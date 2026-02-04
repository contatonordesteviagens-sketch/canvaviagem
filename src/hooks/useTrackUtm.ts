import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UtmData {
  session_id: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string;
  landing_page: string;
}

interface MarketingAttribution extends UtmData {
  timestamp: number;
}

// Attribution validity: 30 days
const ATTRIBUTION_TTL = 30 * 24 * 60 * 60 * 1000;
const ATTRIBUTION_KEY = "marketing_attribution";

// Generate unique session ID
const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create session ID
const getOrCreateSessionId = () => {
  let sessionId = sessionStorage.getItem("utm_session_id");
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem("utm_session_id", sessionId);
  }
  return sessionId;
};

// Save attribution with 30-day validity
const saveMarketingAttribution = (data: UtmData) => {
  const attribution: MarketingAttribution = {
    ...data,
    timestamp: Date.now(),
  };
  localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
};

// Get valid attribution (within 30 days)
export const getMarketingAttribution = (): MarketingAttribution | null => {
  try {
    const stored = localStorage.getItem(ATTRIBUTION_KEY);
    if (!stored) return null;

    const attribution: MarketingAttribution = JSON.parse(stored);
    const isValid = Date.now() - attribution.timestamp < ATTRIBUTION_TTL;
    
    if (!isValid) {
      localStorage.removeItem(ATTRIBUTION_KEY);
      return null;
    }
    
    return attribution;
  } catch {
    return null;
  }
};

// Clear attribution after it's been used
export const clearMarketingAttribution = () => {
  localStorage.removeItem(ATTRIBUTION_KEY);
};

export const useTrackUtm = () => {
  useEffect(() => {
    const trackUtm = async () => {
      // Check if already tracked this session
      const alreadyTracked = sessionStorage.getItem("utm_tracked");
      if (alreadyTracked) return;

      const params = new URLSearchParams(window.location.search);
      
      // Capture UTM data
      const utmData: UtmData = {
        session_id: getOrCreateSessionId(),
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        utm_content: params.get("utm_content"),
        utm_term: params.get("utm_term"),
        referrer: document.referrer || "",
        landing_page: window.location.pathname,
      };

      // Only save if there's UTM or referrer data
      if (utmData.utm_source || utmData.utm_medium || utmData.utm_campaign || utmData.referrer) {
        // Save to localStorage with 30-day validity
        saveMarketingAttribution(utmData);

        // Save to database
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          await supabase.from("traffic_sources").insert({
            session_id: utmData.session_id,
            user_id: user?.id || null,
            utm_source: utmData.utm_source,
            utm_medium: utmData.utm_medium,
            utm_campaign: utmData.utm_campaign,
            utm_content: utmData.utm_content,
            utm_term: utmData.utm_term,
            referrer: utmData.referrer,
            landing_page: utmData.landing_page,
          });

          sessionStorage.setItem("utm_tracked", "true");
        } catch (error) {
          console.error("Error tracking UTM:", error);
        }
      }
    };

    trackUtm();
  }, []);
};

// Hook to associate UTM to user after login/signup
export const useAssociateUtmToUser = () => {
  useEffect(() => {
    const associateUtm = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const attribution = getMarketingAttribution();
      if (!attribution) return;

      try {
        // Update traffic_sources with user_id
        await supabase
          .from("traffic_sources")
          .update({ user_id: user.id })
          .eq("session_id", attribution.session_id)
          .is("user_id", null);

        // Update user profile with permanent UTM attribution
        if (attribution.utm_source || attribution.utm_medium || attribution.utm_campaign) {
          await supabase
            .from("profiles")
            .update({
              utm_source: attribution.utm_source,
              utm_medium: attribution.utm_medium,
              utm_campaign: attribution.utm_campaign,
              referrer_url: attribution.referrer,
            })
            .eq("user_id", user.id)
            .is("utm_source", null); // Only update if not already set
        }
      } catch (error) {
        console.error("Error associating UTM to user:", error);
      }
    };

    associateUtm();
  }, []);
};

// Get current session ID (for checkout)
export const getCurrentSessionId = () => {
  return sessionStorage.getItem("utm_session_id");
};
