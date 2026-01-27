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

// Gera um ID de sessão único
const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Recupera ou cria o session_id
const getOrCreateSessionId = () => {
  let sessionId = sessionStorage.getItem("utm_session_id");
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem("utm_session_id", sessionId);
  }
  return sessionId;
};

export const useTrackUtm = () => {
  useEffect(() => {
    const trackUtm = async () => {
      // Verifica se já rastreou nesta sessão
      const alreadyTracked = sessionStorage.getItem("utm_tracked");
      if (alreadyTracked) return;

      const params = new URLSearchParams(window.location.search);
      
      // Captura dados UTM
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

      // Só salva se tiver algum UTM ou referrer
      if (utmData.utm_source || utmData.utm_medium || utmData.utm_campaign || utmData.referrer) {
        // Salva no localStorage para associar depois
        localStorage.setItem("utm_data", JSON.stringify(utmData));

        // Tenta salvar no banco
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
          console.error("Erro ao rastrear UTM:", error);
        }
      }
    };

    trackUtm();
  }, []);
};

// Hook para associar UTM ao usuário após login/signup
export const useAssociateUtmToUser = () => {
  useEffect(() => {
    const associateUtm = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const utmDataStr = localStorage.getItem("utm_data");
      if (!utmDataStr) return;

      try {
        const utmData: UtmData = JSON.parse(utmDataStr);
        
        // Atualiza o registro com o user_id
        await supabase
          .from("traffic_sources")
          .update({ user_id: user.id })
          .eq("session_id", utmData.session_id)
          .is("user_id", null);

        // Limpa o localStorage
        localStorage.removeItem("utm_data");
      } catch (error) {
        console.error("Erro ao associar UTM ao usuário:", error);
      }
    };

    associateUtm();
  }, []);
};

// Função para obter o session_id atual (para usar no checkout)
export const getCurrentSessionId = () => {
  return sessionStorage.getItem("utm_session_id");
};
