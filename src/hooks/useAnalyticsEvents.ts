import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

// Get or create session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("utm_session_id");
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("utm_session_id", sessionId);
  }
  return sessionId;
};

// Track an analytics event
export const trackEvent = async (
  eventType: string,
  eventData?: Json
) => {
  try {
    const sessionId = getSessionId();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("analytics_events").insert([{
      user_id: user?.id || null,
      session_id: sessionId,
      event_type: eventType,
      event_data: eventData || {},
      url_path: window.location.pathname,
    }]);
  } catch (error) {
    console.error("Error tracking event:", error);
  }
};

// Hook for tracking events
export const useTrackEvent = () => {
  return { trackEvent };
};

// Event type constants
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: "page_view",
  CTA_CLICK: "cta_click",
  CHECKOUT_START: "checkout_start",
  SIGNUP_COMPLETE: "signup_complete",
  LOGIN_COMPLETE: "login_complete",
  EMAIL_OPENED: "email_opened",
  EMAIL_CLICKED: "email_clicked",
} as const;
