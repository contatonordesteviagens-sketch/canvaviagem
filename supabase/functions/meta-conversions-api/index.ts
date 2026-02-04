import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Security: Restrict CORS to application domains only
const ALLOWED_ORIGINS = [
  'https://canvaviagem.lovable.app',
  'https://id-preview--998ca1b7-1f9d-4bc1-bba2-e32e02c74e9e.lovable.app'
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

const PIXEL_IDS = [
  '1599242897762192',
  '1152272353771099',
  '4254631328136179',
  '1560736461820497'
];

interface EventData {
  event_name: string;
  event_time?: number;
  event_source_url?: string;
  user_data?: {
    em?: string; // hashed email
    ph?: string; // hashed phone
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // click ID
    fbp?: string; // browser ID
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_type?: string;
    predicted_ltv?: number;
  };
  action_source: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Security: Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Security: Require authentication - verify user session
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = Deno.env.get('META_CONVERSIONS_API_TOKEN');
    
    if (!accessToken) {
      console.error('META_CONVERSIONS_API_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { event_name, event_source_url, user_data, custom_data } = body;

    if (!event_name) {
      return new Response(
        JSON.stringify({ error: 'event_name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client info from headers
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || '';

    const eventData: EventData = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: event_source_url || 'https://canvaviagem.lovable.app',
      user_data: {
        ...user_data,
        client_ip_address: clientIp,
        client_user_agent: userAgent,
      },
      custom_data,
      action_source: 'website',
    };

    // Send to all pixel IDs
    const results = await Promise.allSettled(
      PIXEL_IDS.map(async (pixelId) => {
        const url = `https://graph.facebook.com/v18.0/${pixelId}/events`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: [eventData],
            access_token: accessToken,
          }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          console.error(`Meta API error for pixel ${pixelId}:`, result);
          throw new Error(`Failed for pixel ${pixelId}: ${JSON.stringify(result)}`);
        }

        console.log(`Event ${event_name} sent to pixel ${pixelId} for user ${user.id}`);
        return { pixelId, result };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        event_name,
        pixels_sent: successful,
        pixels_failed: failed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in meta-conversions-api:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
