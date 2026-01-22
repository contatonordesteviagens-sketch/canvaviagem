import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Security constants for input validation
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_CONTENT_LENGTH = 50000; // Characters sent to AI
const MAX_URL_LENGTH = 2048;
const MAX_TITLE_LENGTH = 500;

// Allowlist of acceptable MIME types
const ALLOWED_MIME_TYPES = [
  "text/plain",
  "text/csv",
  "application/csv",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// Validate URL format and structure
function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  if (url.length > MAX_URL_LENGTH) return false;
  
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    // Block potentially dangerous patterns
    if (url.includes("javascript:") || url.includes("data:") || url.includes("vbscript:")) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Sanitize title to prevent injection
function sanitizeTitle(title: string): string {
  if (!title || typeof title !== "string") return "";
  // Truncate to max length
  let sanitized = title.substring(0, MAX_TITLE_LENGTH);
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>'"\\]/g, "");
  // Trim whitespace
  return sanitized.trim();
}

// Validate and sanitize extracted items
function validateAndSanitizeItems(items: unknown[]): Array<{ title: string; url: string }> {
  if (!Array.isArray(items)) return [];
  
  const validItems: Array<{ title: string; url: string }> = [];
  
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    
    const rawTitle = (item as Record<string, unknown>).title;
    const rawUrl = (item as Record<string, unknown>).url;
    
    if (typeof rawTitle !== "string" || typeof rawUrl !== "string") continue;
    
    const sanitizedTitle = sanitizeTitle(rawTitle);
    const url = rawUrl.trim();
    
    // Only include items with valid URLs and non-empty titles
    if (sanitizedTitle && isValidUrl(url)) {
      validItems.push({
        title: sanitizedTitle,
        url: url,
      });
    }
  }
  
  return validItems;
}

// Validate MIME type against allowlist
function isAllowedMimeType(mimeType: string): boolean {
  if (!mimeType || typeof mimeType !== "string") return false;
  // Normalize and check against allowlist
  const normalized = mimeType.toLowerCase().split(";")[0].trim();
  return ALLOWED_MIME_TYPES.includes(normalized);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Create client with user's auth token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is admin using service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log admin access (redact email for security)
    const emailParts = (user.email || "").split("@");
    const redactedEmail = emailParts.length === 2 
      ? `${emailParts[0].substring(0, 2)}***@${emailParts[1]}`
      : "[redacted]";
    console.log(`Admin ${redactedEmail} accessing parse-content-file`);

    const body = await req.json();
    const { fileContent, fileName, mimeType } = body;

    // Validate required fields
    if (!fileContent) {
      return new Response(
        JSON.stringify({ error: "File content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file content type
    if (typeof fileContent !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid file content format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate MIME type
    if (mimeType && !isAllowedMimeType(mimeType)) {
      return new Response(
        JSON.stringify({ error: "Unsupported file type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file size (base64 is ~33% larger than original)
    const estimatedSize = fileContent.length * 0.75; // Approximate original size
    if (estimatedSize > MAX_FILE_SIZE_BYTES) {
      return new Response(
        JSON.stringify({ error: `File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Decode base64 content to text for text-based files
    let textContent = "";
    try {
      textContent = atob(fileContent);
    } catch {
      // If not base64, use as-is (but truncate for safety)
      textContent = fileContent;
    }

    // Sanitize filename for logging (remove potentially dangerous chars)
    const safeFileName = (fileName || "unknown")
      .replace(/[<>'"\\]/g, "")
      .substring(0, 255);

    const systemPrompt = `You are a data extraction assistant specialized in CLEANING and extracting travel content from messy, unformatted files.

IMPORTANT PATTERN: The most common format has the TITLE on a LINE ABOVE the URL, like this:
---
Istambul
https://www.canva.com/design/DAGgIOg8LZs/...

VANCOUVER
https://www.canva.com/design/DAG-_XNnz74/...

FRANKFURT
|
https://www.canva.com/design/DAG-_TJMUIc/...

DUBAI
https://www.canva.com/design/DAG-_XmmKzw/...
---

The input data is often MESSY and may contain:
- Title on a SEPARATE LINE above the URL (most common pattern!)
- Extra spaces, tabs, or newlines between words
- Random punctuation (commas, dots, dashes, pipes |) in wrong places
- Mixed formatting (some uppercase, some lowercase)
- Empty lines or garbage characters between title and URL

Your job is to:
1. RECOGNIZE that titles often appear on the line BEFORE the URL
2. CLEAN the data - remove extra spaces, random punctuation
3. IDENTIFY place names and pair them with the Canva URL that follows
4. NORMALIZE titles - proper capitalization (first letter uppercase)

The TITLE is always a place name/destination (city, country, region).
The URL is always a Canva link (https://canva.com/... or https://www.canva.com/...)

Examples of extraction:
- "Istambul\\nhttps://canva.com/xxx" → title: "Istambul", url: "https://canva.com/xxx"
- "VANCOUVER\\nhttps://canva.com/yyy" → title: "Vancouver", url: "https://canva.com/yyy"  
- "FRANKFURT\\n|\\nhttps://canva.com/zzz" → title: "Frankfurt", url: "https://canva.com/zzz"
- "  Dubai    ,,, https://canva.com/xxx  " → title: "Dubai", url: "https://canva.com/xxx"
- "Rio  de   Janeiro     https://canva.com/aaa" → title: "Rio de Janeiro", url: "https://canva.com/aaa"
- "fernando de noronha - pe https://canva.com/ccc" → title: "Fernando de Noronha - PE", url: "https://canva.com/ccc"

Rules:
1. Look for titles on the line BEFORE URLs
2. ALWAYS capitalize titles properly (first letter of each word uppercase)
3. REMOVE garbage punctuation (,,,   ...   ---   ||| etc)
4. FIX spacing (convert multiple spaces to single space)
5. Keep meaningful separators like " - " between city and state
6. Only include items with valid Canva URLs
7. If no title found for a URL, skip that item

Return ONLY a valid JSON array:
[{"title": "Place Name", "url": "https://canva.com/..."}, ...]

If no valid items are found, return an empty array: []`;


    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `File name: ${safeFileName}\nMIME type: ${mimeType || "unknown"}\n\nContent:\n${textContent.substring(0, MAX_CONTENT_LENGTH)}` 
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error:", response.status);
      throw new Error("Failed to process file with AI");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "[]";

    // Parse and validate the JSON from the response
    let items: Array<{ title: string; url: string }> = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Validate and sanitize all extracted items
        items = validateAndSanitizeItems(parsed);
      }
    } catch (parseError) {
      console.error("Error parsing AI response");
      items = [];
    }

    return new Response(
      JSON.stringify({ items }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in parse-content-file");
    return new Response(
      JSON.stringify({ error: "An error occurred while processing the file" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
