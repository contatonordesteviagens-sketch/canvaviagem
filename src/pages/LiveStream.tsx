import { useState, useEffect, useRef } from "react";
import { Send, Smile, Eye, MessageCircle, AlertCircle, Sparkles, Play, Check, Pause, Clock, ShoppingBag, Paperclip, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  username: string;
  message: string;
  isUser?: boolean;
  time: string;
  sortTimestamp?: number;
  playbackSecond?: number;
}

// Comentários exibidos ANTES do play (esperando a live começar)
const DEFAULT_PRE_PLAY_COMMENTS: Comment[] = [
  { id: "pre-1", username: "Fabiotravell", message: "aguardando começar...", time: "19:28" },
  { id: "pre-2", username: "Jr99", message: "to esperando a live! bora", time: "19:29" },
  { id: "pre-3", username: "AnaPeloMundo", message: "esperando aqui, ansiosa demais!", time: "19:30" },
];

import { DEFAULT_SCHEDULED_COMMENTS, ScheduledComment } from "@/data/scheduledComments";

const LiveStream = () => {
  const computeIsTimeAllowed = () => true;
  const [isTimeAllowed, setIsTimeAllowed] = useState<boolean>(computeIsTimeAllowed());

  useEffect(() => {
    const tick = () => setIsTimeAllowed(computeIsTimeAllowed());
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const [step, setStep] = useState<"register" | "watch">("register");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Controle de intenção de saída e widget de WhatsApp de suporte
  const [showRecoveryWidget, setShowRecoveryWidget] = useState(false);
  const [hasManuallyClosedWidget, setHasManuallyClosedWidget] = useState(false);
  const [hasTriggeredOfferWidget, setHasTriggeredOfferWidget] = useState(false);
  const [hasTriggered65MinWidget, setHasTriggered65MinWidget] = useState(false);
  const [hasReceivedYTUpdate, setHasReceivedYTUpdate] = useState(false);
  const triggeredCommentsRef = useRef<Set<string>>(new Set());


  const handlePhoneChange = (val: string) => {
    let cleaned = val.replace(/\D/g, "");
    
    // Se o número começa com 55 e tem mais de 10 dígitos, provavelmente o preenchimento automático inseriu o código do país (+55).
    // Remove o prefixo 55 para preservar o DDD + 9 dígitos de celular (total 11 dígitos).
    if (cleaned.startsWith("55") && cleaned.length >= 12) {
      cleaned = cleaned.slice(2);
    }
    
    if (cleaned.length > 11) {
      cleaned = cleaned.slice(0, 11);
    }
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `(${cleaned.slice(0, 2)}) `;
      if (cleaned.length > 7) {
        formatted += `${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
      } else {
        formatted += cleaned.slice(2);
      }
    } else if (cleaned.length > 0) {
      formatted = `(${cleaned}`;
    }
    setPhone(formatted);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [initialStartSeconds, setInitialStartSeconds] = useState<number>(0);
  
  // Helper for dynamic decrementing seats: 10 → 8 → 7 → 5 → 4
  const getDynamicSeats = () => {
    const offerStartSeconds = getOfferActivationSeconds();
    if (playbackSeconds < offerStartSeconds) return 10;
    const elapsed = playbackSeconds - offerStartSeconds;
    if (elapsed < 90)  return 10; // 0–90s
    if (elapsed < 210) return 8;  // 90–210s
    if (elapsed < 360) return 7;  // 210–360s
    if (elapsed < 480) return 5;  // 360–480s
    return 4;                      // 480s+ (final da live)
  };

  // Helper to get psychological phase & dynamic support link
  const getDynamicSupportLink = () => {
    const minutes = Math.floor(playbackSeconds / 60);
    const seconds = playbackSeconds % 60;
    const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    
    let phase = "Introdução da Aula e Alinhamento";
    if (playbackSeconds >= 5 * 60 && playbackSeconds < 20 * 60) {
      phase = "Apresentação da Fábrica de Criativos";
    } else if (playbackSeconds >= 20 * 60 && playbackSeconds < 40 * 60) {
      phase = "Demonstração Prática da I.A";
    } else if (playbackSeconds >= 40 * 60 && playbackSeconds < 50 * 60) {
      phase = "Revelação dos Planos e Descontos";
    } else if (playbackSeconds >= 50 * 60) {
      phase = "Oferta Vitalícia e Bônus Exclusivos";
    }

    const text = `Olá Lucas! Estava assistindo à aula especial da Fábrica de Criativos e parei no minuto ${timeStr} (${phase}). Gostaria de tirar uma dúvida sobre...`;
    return `https://wa.me/5585998458995?text=${encodeURIComponent(text)}`;
  };

  // Helper to sync watch progress via SECURITY DEFINER RPC (RLS blocks direct updates)
  const syncProgressToSupabase = async (currentSeconds: number, opts?: { left?: boolean }) => {
    try {
      const activeSessionStr = localStorage.getItem("live_stream_active_session");
      if (!activeSessionStr) return;
      const activeSession = JSON.parse(activeSessionStr);
      const cleanPhone = activeSession.phone;
      if (!cleanPhone) return;

      let localWatchTime = 0;
      try {
        const leadsStr = localStorage.getItem("live_stream_leads");
        if (leadsStr) {
          const leads = JSON.parse(leadsStr);
          const localLead = leads.find((l: any) => l.phone === cleanPhone);
          if (localLead) localWatchTime = localLead.watchTime || 0;
        }
      } catch (_) {}

      const { error } = await (supabase as any).rpc("update_webinar_lead_session", {
        p_whatsapp: cleanPhone,
        p_watch_time: localWatchTime || null,
        p_last_playback_time: currentSeconds,
        p_clicked_offer: null,
        p_left: !!opts?.left,
      });
      if (error) console.error("Erro RPC update_webinar_lead_session:", error);
    } catch (err) {
      console.error("Erro no sync progress do Supabase:", err);
    }
  };

  // Helper to update clicked offer status via SECURITY DEFINER RPC
  const updateClickedOfferInSupabase = async () => {
    try {
      const activeSessionStr = localStorage.getItem("live_stream_active_session");
      if (!activeSessionStr) return;
      const activeSession = JSON.parse(activeSessionStr);
      const cleanPhone = activeSession.phone;
      if (!cleanPhone) return;

      const { error } = await (supabase as any).rpc("update_webinar_lead_session", {
        p_whatsapp: cleanPhone,
        p_watch_time: null,
        p_last_playback_time: null,
        p_clicked_offer: true,
        p_left: false,
      });
      if (error) console.error("Erro RPC clicked offer:", error);
    } catch (e) {
      console.error("Erro ao atualizar clique no checkout no Supabase:", e);
    }
  };

  // Helper to add user comment to Supabase via SECURITY DEFINER RPC (RLS blocks direct updates)
  const addCommentToSupabase = async (message: string) => {
    try {
      const activeSessionStr = localStorage.getItem("live_stream_active_session");
      if (!activeSessionStr) return;
      const activeSession = JSON.parse(activeSessionStr);
      const cleanPhone = activeSession.phone;
      if (!cleanPhone) return;

      const minutes = Math.floor(playbackSeconds / 60);
      const seconds = playbackSeconds % 60;
      const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

      const { error } = await (supabase as any).rpc("append_webinar_lead_comment", {
        p_whatsapp: cleanPhone,
        p_message: message,
        p_time: timeStr,
        p_playback_second: playbackSeconds,
      });
      if (error) console.error("Erro RPC append_webinar_lead_comment:", error);
    } catch (e) {
      console.error("Erro ao salvar comentário no Supabase:", e);
    }
  };

  const [viewers, setViewers] = useState(35);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "offer">("chat");
  const [scheduledCommentsList, setScheduledCommentsList] = useState<ScheduledComment[]>([]);
  const [prePlayComments, setPrePlayComments] = useState<Comment[]>(DEFAULT_PRE_PLAY_COMMENTS);
  const [videoUrlId, setVideoUrlId] = useState("uqicM_vSGPw");
  const [offerSettings, setOfferSettings] = useState({
    status: "scheduled",
    time: "60:00",
    title: "🔥 OFERTA EXCLUSIVA DA LIVE LIBERADA!",
    description: "Adquira o Canva Viagem Vitalício + Fábrica de Anúncios I.A com Desconto!",
    price: "Apenas 12x de R$ 28,91 ou R$ 347 à vista",
    checkoutUrl: "https://buy.stripe.com/fZu14ogGugreeH9bF28so0d",
    bannerUrl: ""
  });
  const [showOfferBanner, setShowOfferBanner] = useState(false);
  const [userClosedOffer, setUserClosedOffer] = useState(false);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  // Altura estável da live. Não usar visualViewport durante digitação: no Chrome/iPhone isso pode cancelar o foco do input.
  const [viewportHeight, setViewportHeight] = useState<number>(
    () => (typeof window !== 'undefined' ? window.innerHeight : 800)
  );
  const isIOSMobile = typeof navigator !== "undefined" && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
  const [viewportOffsetTop, setViewportOffsetTop] = useState(0);

  const playbackSecondsRef = useRef(0);
  useEffect(() => {
    playbackSecondsRef.current = playbackSeconds;
  }, [playbackSeconds]);

  const getYouTubeId = (urlOrId: string) => {
    if (!urlOrId) return "Xqcw-NpPz08";
    if (urlOrId.length === 11) return urlOrId;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlOrId.match(regExp);
    return (match && match[2].length === 11) ? match[2] : urlOrId;
  };

  useEffect(() => {
    // 1. Comments - não confiar no cache local do visitante para evitar comentários fantasmas por dispositivo.
    setScheduledCommentsList(DEFAULT_SCHEDULED_COMMENTS);
    localStorage.setItem("live_stream_comments", JSON.stringify(DEFAULT_SCHEDULED_COMMENTS));

    // 2. Video URL/ID
    const savedVideo = localStorage.getItem("live_stream_video_url");
    if (savedVideo) {
      setVideoUrlId(getYouTubeId(savedVideo));
    }

    // 3. Offer Settings
    const savedOffer = localStorage.getItem("live_stream_offer_settings");
    if (savedOffer) {
      try {
        const parsed = JSON.parse(savedOffer);
        setOfferSettings(parsed);
        if (parsed.status === "visible") {
          setShowOfferBanner(true);
        }
      } catch (e) {
        console.error("Error parsing offer settings", e);
      }
    }

    // 4. Pre-play Comments
    const savedPrePlay = localStorage.getItem("live_stream_pre_play_comments");
    if (savedPrePlay) {
      try {
        const parsed = JSON.parse(savedPrePlay);
        const cleaned = parsed.map((c: any) => ({
          ...c,
          message: c.message.replace(" 🙌", "").replace("🙌", "")
        }));
        setPrePlayComments(cleaned);
      } catch (e) {
        setPrePlayComments(DEFAULT_PRE_PLAY_COMMENTS);
      }
    } else {
      setPrePlayComments(DEFAULT_PRE_PLAY_COMMENTS);
    }

    // Fetch global settings from Supabase to sync admin settings on mount
    const fetchGlobalSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("webinar_leads")
          .select("source")
          .eq("whatsapp", "global_live_settings")
          .maybeSingle();

        if (error) {
          console.error("Erro ao buscar configurações globais do Supabase:", error);
          return;
        }

        if (data && data.source) {
          const globalSettings = typeof data.source === "string" ? JSON.parse(data.source) : data.source;
          
          if (globalSettings.videoUrl) {
            const videoId = getYouTubeId(globalSettings.videoUrl);
            setVideoUrlId(videoId);
            localStorage.setItem("live_stream_video_url", globalSettings.videoUrl);
          }
          
          if (globalSettings.offerSettings) {
            setOfferSettings(globalSettings.offerSettings);
            localStorage.setItem("live_stream_offer_settings", JSON.stringify(globalSettings.offerSettings));
            if (globalSettings.offerSettings.status === "visible") {
              setShowOfferBanner(true);
            }
          }
          
          if (globalSettings.scheduledComments && Array.isArray(globalSettings.scheduledComments)) {
            setScheduledCommentsList(globalSettings.scheduledComments);
            localStorage.setItem("live_stream_comments", JSON.stringify(globalSettings.scheduledComments));
          }
          
          if (globalSettings.prePlayComments && Array.isArray(globalSettings.prePlayComments)) {
            const cleaned = globalSettings.prePlayComments.map((c: any) => ({
              ...c,
              message: c.message.replace(" 🙌", "").replace("🙌", "")
            }));
            setPrePlayComments(cleaned);
            localStorage.setItem("live_stream_pre_play_comments", JSON.stringify(cleaned));
          }
        }
      } catch (e) {
        console.error("Erro ao processar configurações globais:", e);
      }
    };
    fetchGlobalSettings();

    // 5. Restore active session (Falta de Persistência no Recarregamento / Conexão)
    try {
      const activeSessionStr = localStorage.getItem("live_stream_active_session");
      if (activeSessionStr) {
        const activeSession = JSON.parse(activeSessionStr);
        if (activeSession.phone && activeSession.name) {
          setName(activeSession.name);
          setPhone(activeSession.phone);
          setStep("watch");
          
          if (activeSession.lastTime && activeSession.lastTime > 0) {
            setPlaybackSeconds(activeSession.lastTime);
            setInitialStartSeconds(activeSession.lastTime);
          }

          // Fetch user comments from localStorage with robust playbackSecond parsing
          const savedUserComments = localStorage.getItem(`live_stream_user_comments_${activeSession.phone}`);
          if (savedUserComments) {
            try {
              const parsed = JSON.parse(savedUserComments);
              const mapped = parsed.map((c: any) => {
                let pSec = c.playbackSecond;
                if (pSec === undefined && c.time && typeof c.time === "string" && c.time.includes(":")) {
                  const parts = c.time.split(":");
                  const mins = parseInt(parts[0], 10) || 0;
                  const secs = parseInt(parts[1], 10) || 0;
                  pSec = mins * 60 + secs;
                }
                return {
                  ...c,
                  playbackSecond: pSec
                };
              });
              setUserComments(mapped);
            } catch (e) {
              console.error("Erro ao fazer parse dos comentários do localStorage:", e);
            }
          }

          // Fetch user comments from Supabase if active session exists
          const fetchUserCommentsFromSupabase = async () => {
            try {
              const { data: lead } = await supabase
                .from("webinar_leads")
                .select("source")
                .eq("whatsapp", activeSession.phone)
                .maybeSingle();

              if (lead && lead.source) {
                const parsedSource = typeof lead.source === "string" ? JSON.parse(lead.source) : lead.source;
                if (parsedSource.comments && Array.isArray(parsedSource.comments)) {
                  const dbComments = parsedSource.comments.map((c: any) => {
                    let playbackSecond = 0;
                    if (c.time && typeof c.time === "string" && c.time.includes(":")) {
                      const parts = c.time.split(":");
                      const mins = parseInt(parts[0], 10) || 0;
                      const secs = parseInt(parts[1], 10) || 0;
                      playbackSecond = mins * 60 + secs;
                    }
                    return {
                      id: c.id || String(c.timestamp || Date.now()),
                      username: activeSession.name || "Lucas",
                      message: c.message,
                      isUser: true,
                      time: c.time,
                      sortTimestamp: c.timestamp || Date.now(),
                      playbackSecond: playbackSecond
                    };
                  });

                  setUserComments(prev => {
                    const merged = [...prev];
                    dbComments.forEach((dbc: any) => {
                      if (!merged.some(mc => mc.message === dbc.message && Math.abs((mc.sortTimestamp || 0) - dbc.sortTimestamp) < 5000)) {
                        merged.push(dbc);
                      }
                    });
                    localStorage.setItem(`live_stream_user_comments_${activeSession.phone}`, JSON.stringify(merged));
                    return merged;
                  });
                }
              }
            } catch (err) {
              console.error("Erro ao sincronizar comentários do usuário com o Supabase:", err);
            }
          };
          fetchUserCommentsFromSupabase();
        }
      }
    } catch (e) {
      console.error("Erro ao carregar sessão ativa persistida:", e);
    }

    // Real-Time subscription para sincronização automática da Gestão com a Live
    const channel = supabase
      .channel('global-settings-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'webinar_leads',
          filter: "whatsapp=eq.global_live_settings"
        },
        (payload) => {
          try {
            const nextRow = payload.new as { source?: string | Record<string, unknown> };
            if (nextRow && nextRow.source) {
              const globalSettings = typeof nextRow.source === "string" ? JSON.parse(nextRow.source) : nextRow.source;
              
              if (globalSettings.videoUrl) {
                const videoId = getYouTubeId(globalSettings.videoUrl);
                setVideoUrlId(videoId);
                localStorage.setItem("live_stream_video_url", globalSettings.videoUrl);
              }
              
              if (globalSettings.offerSettings) {
                setOfferSettings(globalSettings.offerSettings);
                localStorage.setItem("live_stream_offer_settings", JSON.stringify(globalSettings.offerSettings));
                if (globalSettings.offerSettings.status === "visible") {
                  setShowOfferBanner(true);
                } else {
                  setShowOfferBanner(false);
                }
              }
              
              if (globalSettings.scheduledComments && Array.isArray(globalSettings.scheduledComments)) {
                setScheduledCommentsList(globalSettings.scheduledComments);
                localStorage.setItem("live_stream_comments", JSON.stringify(globalSettings.scheduledComments));
              }
              
              if (globalSettings.prePlayComments && Array.isArray(globalSettings.prePlayComments)) {
                const cleaned = globalSettings.prePlayComments.map((c: any) => ({
                  ...c,
                  message: c.message.replace(" 🙌", "").replace("🙌", "")
                }));
                setPrePlayComments(cleaned);
                localStorage.setItem("live_stream_pre_play_comments", JSON.stringify(cleaned));
              }
            }
          } catch (e) {
            console.error("Erro ao processar realtime global settings:", e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null); // container scroll (não scrollIntoView)
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const hasInitializedStartRef = useRef(false);
  const offerActivatedRef = useRef(false);

  // Insere 3 comentários de "aguardando" gradualmente ANTES do play
  useEffect(() => {
    if (step !== "watch" || isPlaying) return;

    // Não exibe comentários de "aguardando" se o usuário está retomando o vídeo de onde parou
    const activeSessionStr = localStorage.getItem("live_stream_active_session");
    if (activeSessionStr) {
      try {
        const session = JSON.parse(activeSessionStr);
        if (session.lastTime && session.lastTime > 0) return;
      } catch (e) {}
    }

    const timers = prePlayComments.map((c, i) =>
      setTimeout(() => {
        setComments(prev => {
          // Não adiciona se o play já começou
          if (prev.some(p => p.id === c.id)) return prev;
          return [...prev, c];
        });
      }, (i + 1) * 2500)
    );

    return () => timers.forEach(clearTimeout);
  }, [step, isPlaying, prePlayComments]);

  // Sync state changes and real-time events from YouTube iframe
  useEffect(() => {
    const handleYTMessage = (event: MessageEvent) => {
      if (!event.origin.includes("youtube.com")) return;
      
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        
        if (data.event === "infoDelivery" && data.info) {
          const info = data.info;
          
          if (typeof info.playerState !== "undefined") {
            const state = info.playerState;
            if (state === 1) {
              setIsPaused(false);
            } else if (state === 2) { // Apenas estado 2 (pausado), ignorando estado 3 (buffering) para evitar overlays falsos de pausa
              setIsPaused(true);
            }
          }
          
          if (typeof info.currentTime !== "undefined" && isPlaying && !isPaused) {
            const ytTime = Math.floor(info.currentTime);
            
            // Ignore low currentTime reports immediately after start when seek is pending
            if (initialStartSeconds > 0 && !hasInitializedStartRef.current) {
              if (ytTime >= initialStartSeconds - 5) {
                hasInitializedStartRef.current = true;
                setPlaybackSeconds(ytTime);
              }
            } else {
              setPlaybackSeconds(ytTime);
            }
          }
        }
        
        if (data.event === "onStateChange") {
          const state = data.info;
          if (state === 1) {
            setIsPaused(false);
          } else if (state === 2) { // Apenas estado 2 (pausado)
            setIsPaused(true);
          }
        }
      } catch (e) {
        // Safe to ignore
      }
    };
    
    window.addEventListener("message", handleYTMessage);
    return () => window.removeEventListener("message", handleYTMessage);
  }, [isPlaying, isPaused, initialStartSeconds]);

  const handleStartPlay = () => {
    setIsPlaying(true);
    setIsPaused(false);
    hasInitializedStartRef.current = false;
    
    // Auto-play and unmute the iframe immediately upon overlay click
    const cw = iframeRef.current?.contentWindow;
    if (cw) {
      const send = (func: string, args: any = "") =>
        cw.postMessage(JSON.stringify({ event: "command", func, args }), "*");
      const forceUnmute = () => {
        send("unMute");
        send("setVolume", [100]);
        send("playVideo");
      };
      forceUnmute();
      // Retries para Chrome mobile (1ª chamada às vezes é ignorada antes do iframe estar pronto)
      setTimeout(forceUnmute, 250);
      setTimeout(forceUnmute, 800);
      setTimeout(forceUnmute, 1800);
    }
  };

  const handleTogglePause = () => {
    if (!isPlaying) {
      handleStartPlay();
      return;
    }
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    
    if (iframeRef.current?.contentWindow) {
      const command = nextPaused ? "pauseVideo" : "playVideo";
      if (!nextPaused) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "unMute", args: "" }), 
          "*"
        );
      }
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: command, args: "" }), 
        "*"
      );
    }

    // Synergize pause event: immediately sync progress to Supabase when paused!
    if (nextPaused) {
      syncProgressToSupabase(playbackSeconds);
    }
  };

  // Atualiza espectadores dinâmicos de forma ultra realista baseada no tempo do vídeo (curva exata solicitada)
  useEffect(() => {
    if (step !== "watch") return;
    
    const m = playbackSeconds / 60; // tempo da live em minutos (float)
    let nextViewers = 35;

    if (playbackSeconds < 60) {
      // 1. Começando em 35 e subindo suavemente para 42 no primeiro minuto (0 a 60 segundos)
      const t = playbackSeconds / 60;
      nextViewers = Math.round(35 + (42 - 35) * t);
    } else if (playbackSeconds < 120) {
      // 2. Do minuto 1 ao 2 (60 a 120 segundos): sobe suavemente de 42 para 58
      const t = (playbackSeconds - 60) / 60;
      nextViewers = Math.round(42 + (58 - 42) * t);
    } else if (playbackSeconds < 180) {
      // 3. Do minuto 2 ao 3 (120 a 180 segundos): sobe suavemente de 58 para 68
      const t = (playbackSeconds - 120) / 60;
      nextViewers = Math.round(58 + (68 - 58) * t);
    } else if (playbackSeconds < 240) {
      // 4. Do minuto 3 ao 4 (180 a 240 segundos): sobe suavemente de 68 para 95
      const t = (playbackSeconds - 180) / 60;
      nextViewers = Math.round(68 + (95 - 68) * t);
    } else if (playbackSeconds < 20 * 60) {
      // 5. Do minuto 4 ao 20: mantém estável entre 91 e 98 sem oscilações bruscas
      // Onda senoidal de 4 minutos para flutuação super natural
      const sineValue = Math.sin(((playbackSeconds - 240) * Math.PI) / 120); // período de 4 minutos (240s)
      nextViewers = Math.round(94.5 + 3.5 * sineValue); // flutua entre 91 e 98
    } else if (playbackSeconds < 40 * 60) {
      // 6. Do minuto 20 ao 40: intercalando entre 90 e 110 usuários sem muitas oscilações, com pico de 115 na meta (minuto 30)
      // Ajustamos a fase inicial da senóide para iniciar exatamente em 95 e manter a continuidade
      const osc = Math.sin(((playbackSeconds - 20 * 60) * Math.PI) / (5 * 60) - Math.PI / 6); // período de 10 min
      let base = 100 + 10 * osc; // flutua entre 90 e 110 (em m=20, base é 95, 100% contínuo!)
      
      // Pico de 115 na meta (exatamente aos 30 minutos / 1800 segundos) com decaimento suave de 4 minutos para cada lado
      const peakTime = 30 * 60;
      const diffMinutes = Math.abs(playbackSeconds - peakTime) / 60;
      if (diffMinutes < 4) { // transição suave de 4 minutos para o pico de 115
        const t = diffMinutes / 4;
        const peakWeight = (1 - t * t) * (1 - t * t); // perfil de suavização smooth
        base = base * (1 - peakWeight) + 115 * peakWeight;
      }
      nextViewers = Math.round(base);
    } else if (playbackSeconds < 50 * 60) {
      // 7. Do minuto 40 ao 50 (Hora da Oferta): baixa levemente para a faixa de 74
      // De 40 a 41 min, cai de forma suave de 95 para a faixa de 74. Depois fica flutuando entre 72 e 76
      const startOfPeriod = 40 * 60;
      const elapsed = playbackSeconds - startOfPeriod;
      const osc74 = Math.sin((elapsed * Math.PI) / 180); // ciclo de 6 min
      const targetBase = 74 + 2 * osc74; // flutua entre 72 e 76 (média 74)
      
      if (elapsed < 60) { // transição suave de 1 minuto
        const t = elapsed / 60;
        nextViewers = Math.round(95 * (1 - t) + targetBase * t);
      } else {
        nextViewers = Math.round(targetBase);
      }
    } else if (playbackSeconds < 61.5 * 60) {
      // 8. Do minuto 50 ao 61.5: baixa para a faixa de 56
      // De 50 a 51 min, cai suavemente de 74 para a faixa de 56. Depois flutua entre 54 e 58
      const startOfPeriod = 50 * 60;
      const elapsed = playbackSeconds - startOfPeriod;
      const osc56 = Math.sin((elapsed * Math.PI) / 180); // ciclo de 6 min
      const targetBase = 56 + 2 * osc56; // flutua entre 54 e 58 (média 56)
      
      if (elapsed < 60) { // transição suave de 1 minuto
        const t = elapsed / 60;
        nextViewers = Math.round(74 * (1 - t) + targetBase * t);
      } else {
        nextViewers = Math.round(targetBase);
      }
    } else if (playbackSeconds < 62 * 60) {
      // 9. Do minuto 61.5 ao 62: cai suavemente para atingir 25 pessoas exatamente no minuto 62
      const startOfPeriod = 61.5 * 60;
      const elapsed = playbackSeconds - startOfPeriod;
      const t = elapsed / 30; // 30 segundos de queda
      nextViewers = Math.round(54 * (1 - t) + 25 * t);
    } else if (playbackSeconds < 63 * 60) {
      // 10. Do minuto 62 ao 63: cai suavemente de 25 para 19 pessoas
      const startOfPeriod = 62 * 60;
      const elapsed = playbackSeconds - startOfPeriod;
      const t = elapsed / 60; // 1 minuto de queda
      nextViewers = Math.round(25 * (1 - t) + 19 * t);
    } else {
      // 11. Do minuto 63 até o final da transmissão (68 minutos+): permanece estável em 19 pessoas
      nextViewers = 19;
    }

    setViewers(nextViewers);
  }, [playbackSeconds, step]);

  // Increment playback timer in seconds and track watch time / activity heartbeat in background
  useEffect(() => {
    if (!isPlaying || isPaused || step !== "watch") return;
    const interval = setInterval(() => {
      setPlaybackSeconds(prev => {
        const next = prev + 1;
        
        try {
          const activeSessionStr = localStorage.getItem("live_stream_active_session");
          if (activeSessionStr) {
            const activeSession = JSON.parse(activeSessionStr);
            activeSession.lastTime = next; // Persiste o segundo de reprodução atualizado para resiliência de queda/recarregamento
            localStorage.setItem("live_stream_active_session", JSON.stringify(activeSession));

            const leadsStr = localStorage.getItem("live_stream_leads");
            if (leadsStr) {
              const leads = JSON.parse(leadsStr);
              const leadIndex = leads.findIndex((l: any) => l.phone === activeSession.phone);
              if (leadIndex !== -1) {
                leads[leadIndex].watchTime = (leads[leadIndex].watchTime || 0) + 1;
                leads[leadIndex].lastPlaybackTime = next; // Rastreia o momento exato em segundos do vídeo
                leads[leadIndex].lastActiveAt = Date.now(); // Heartbeat de atividade online
                localStorage.setItem("live_stream_leads", JSON.stringify(leads));
              }
            }
          }
        } catch (e) {
          console.error("Erro ao atualizar watch time do lead:", e);
        }
        
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isPaused, step]);

  // Keep comments in perfect synchronization with playback progress (never repeats, never starts from zero, seeks perfectly)
  useEffect(() => {
    if (step !== "watch" || !isPlaying) return; // NUNCA sincroniza os comentários gravados antes de dar o Play

    try {
      const activeSessionStr = localStorage.getItem("live_stream_active_session");
      const activeSession = activeSessionStr ? JSON.parse(activeSessionStr) : null;
      const currentSeconds = playbackSeconds;
      const sessionStart = activeSession?.startedAt || (Date.now() - currentSeconds * 1000);

      // Mapeia os comentários agendados utilizando o playbackSecond real (totalSecs)
      const activeScheduled = scheduledCommentsList
        .filter((c: any) => {
          const parts = c.time.split(":");
          const mins = parseInt(parts[0], 10) || 0;
          const secs = parseInt(parts[1], 10) || 0;
          const totalSecs = mins * 60 + secs;
          return totalSecs <= currentSeconds;
        })
        .map((c: any) => {
          const parts = c.time.split(":");
          const mins = parseInt(parts[0], 10) || 0;
          const secs = parseInt(parts[1], 10) || 0;
          const totalSecs = mins * 60 + secs;
          const commentTimeMs = sessionStart + totalSecs * 1000;
          const d = new Date(commentTimeMs);
          const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          
          return {
            id: `scheduled-${c.time}-${c.username}-${c.message}`,
            username: c.username,
            message: c.message,
            time: timeStr,
            playbackSecond: totalSecs
          };
        });

      // Mapeia comentários pré-play para ficarem no início
      const activePrePlay = prePlayComments.map((c: any, index: number) => ({
        ...c,
        playbackSecond: -100 + index
      }));

      // Mescla comentários administrados + comentários do próprio usuário (aparecem inline na rolagem).
      const merged = [...activePrePlay, ...activeScheduled, ...userComments]
        .sort((a: any, b: any) => {
          const secA = a.playbackSecond ?? 0;
          const secB = b.playbackSecond ?? 0;
          return secA - secB;
        })
        .slice(-20); // Keep only the 20 most recent comments to avoid flooding from zero


      setComments(merged);
    } catch (e) {
      console.error("Error in comments playback synchronization:", e);
    }
  }, [playbackSeconds, step, isPlaying, scheduledCommentsList, prePlayComments, userComments]);

  // Monitor exit-intent (mouse leaving the screen top)
  useEffect(() => {
    if (step !== "watch") return;
    
    const handleMouseLeave = (e: MouseEvent) => {
      if (playbackSeconds < 15 * 60) return; // Only allow after 15 minutes of watching
      if (e.clientY < 5) {
        setShowRecoveryWidget(true);
        setHasManuallyClosedWidget(false); // Permite reabrir ao tentar sair, mesmo se fechado antes
      }
    };
    
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [step, playbackSeconds]);

  // Monitor pause duration (trigger WhatsApp popup if paused for > 5 seconds, only after offer shown or min 65)
  useEffect(() => {
    if (!isPlaying || step !== "watch") return;
    if (playbackSeconds < 15 * 60) return; // Only allow after 15 minutes of watching
    
    let pauseTimer: ReturnType<typeof setTimeout> | undefined;
    if (isPaused) {
      const offerStartSeconds = getOfferActivationSeconds();
      const isOfferShownOrLate = playbackSeconds >= offerStartSeconds || playbackSeconds >= 65 * 60;
      
      if (isOfferShownOrLate) {
        pauseTimer = setTimeout(() => {
          setShowRecoveryWidget(true);
          setHasManuallyClosedWidget(false); // Reabre no pause prolongado
        }, 5000);
      }
    } else {
      // Fecha o widget expandido ao retomar para não cobrir o vídeo
      setShowRecoveryWidget(false);
    }
    
    return () => {
      if (pauseTimer) clearTimeout(pauseTimer);
    };
  }, [isPaused, isPlaying, step, playbackSeconds]);

  // Auto-disparar o popup do WhatsApp em momentos cruciais da live (revelação da oferta e aos 65 minutos)
  useEffect(() => {
    if (step !== "watch" || !isPlaying || isPaused) return;
    if (playbackSeconds < 15 * 60) return; // Only allow after 15 minutes of watching
    
    const offerStartSeconds = getOfferActivationSeconds();
    
    // Dispara no segundo exato da oferta (ou se passar um pouco e ainda não foi disparado)
    if (playbackSeconds >= offerStartSeconds && !hasTriggeredOfferWidget) {
      setHasTriggeredOfferWidget(true);
      setShowRecoveryWidget(true);
      setHasManuallyClosedWidget(false);
    }
    
    // Dispara no minuto 65 (3900 segundos)
    if (playbackSeconds >= 65 * 60 && !hasTriggered65MinWidget) {
      setHasTriggered65MinWidget(true);
      setShowRecoveryWidget(true);
      setHasManuallyClosedWidget(false);
    }
  }, [playbackSeconds, step, isPlaying, isPaused, hasTriggeredOfferWidget, hasTriggered65MinWidget]);

  // Heartbeat to Supabase every 20s while watching (keeps "online" status fresh in /gestao)
  useEffect(() => {
    if (step !== "watch") return;
    const interval = setInterval(() => {
      syncProgressToSupabase(playbackSecondsRef.current);
    }, 20000);
    return () => clearInterval(interval);
  }, [step]);

  // Mantém presença real sem marcar saída falsa quando o Chrome/iPhone abre teclado, PiP ou alterna foco rapidamente
  useEffect(() => {
    if (step !== "watch") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncProgressToSupabase(playbackSecondsRef.current);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [step]);

  // Oferta aparece exatamente no minuto 60:00 da live
  const getOfferActivationSeconds = () => {
    return 3600; // 60 minutos
  };

  // Auto-switch to "Oferta" tab at configured time
  useEffect(() => {
    if (isPlaying && step === "watch") {
      const offerStartSeconds = getOfferActivationSeconds();
      if (playbackSeconds >= offerStartSeconds && !offerActivatedRef.current) {
        offerActivatedRef.current = true;
        setActiveTab("offer");
        toast.success("🔥 Oferta Especial Revelada! Aproveite o desconto exclusivo.");
      } else if (playbackSeconds < offerStartSeconds && offerActivatedRef.current) {
        offerActivatedRef.current = false;
        if (activeTab === "offer") {
          setActiveTab("chat");
        }
      }
    }
  }, [playbackSeconds, isPlaying, step, activeTab]);

  const getOfferCountdown = () => {
    const offerStartSeconds = getOfferActivationSeconds();
    // Duração exata = fim do vídeo (1:08:39 = 4119s) − início da oferta (3600s) = 519s = 8min39s
    const countdownTotal = 519;
    if (playbackSeconds < offerStartSeconds) {
      return "08:39";
    }
    const elapsed = playbackSeconds - offerStartSeconds;
    const remaining = Math.max(0, countdownTotal - elapsed);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Trigger scheduled pricing banner/offer at exact MM:SS marker (and keep visible if past that time)
  useEffect(() => {
    if (!isPlaying || isPaused || step !== "watch" || offerSettings.status !== "scheduled") return;

    const totalSecs = getOfferActivationSeconds();
    if (playbackSeconds >= totalSecs) {
      if (!showOfferBanner && !userClosedOffer) {
        setShowOfferBanner(true);
        toast.success("🔥 Oferta Especial Revelada! Aproveite o desconto exclusivo.");
      }
    } else {
      if (showOfferBanner) {
        setShowOfferBanner(false);
      }
      // Se voltou para antes do gatilho, reseta o flag de fechado
      if (userClosedOffer) setUserClosedOffer(false);
    }
  }, [playbackSeconds, isPlaying, isPaused, step, offerSettings, showOfferBanner, userClosedOffer]);

  // Auto scroll: usa container.scrollTop para não rolar a página inteira
  useEffect(() => {
    if (step === "watch" && chatScrollRef.current) {
      const el = chatScrollRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [comments, step]);

  // Evita "puxão" da página na live sem bloquear eventos de toque do teclado/campo de comentário no mobile
  useEffect(() => {
    if (step !== "watch") return;
    
    const originalOverscroll = document.body.style.overscrollBehavior;
    const originalHTMLOverscroll = document.documentElement.style.overscrollBehavior;
    
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";
    
    return () => {
      document.body.style.overscrollBehavior = originalOverscroll;
      document.documentElement.style.overscrollBehavior = originalHTMLOverscroll;
    };
  }, [step]);

  // Layout mobile estável: não reage ao abre/fecha do teclado para não derrubar
  // o foco do comentário NEM travar/recarregar o vídeo durante a digitação.
  useEffect(() => {
    let baseHeight = window.innerHeight;
    let baseWidth = window.innerWidth;

    const updateLayout = (force = false) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const ae = document.activeElement as HTMLElement | null;
      const typing = !!ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable);
      // Heurística de teclado aberto: altura encolheu significativamente sem mudar a largura.
      const keyboardOpen = !force && w === baseWidth && h < baseHeight - 100;
      if (typing || keyboardOpen) return; // não recalcula layout: evita travar o player
      baseHeight = h;
      baseWidth = w;
      setViewportHeight(h);
      setViewportOffsetTop(0);
      setIsMobileLandscape(w > h && h <= 520);
      setIsMobileViewport(w < 1024 || h <= 520);
    };
    updateLayout(true);
    const onOrientation = () => updateLayout(true);
    const onResize = () => updateLayout(false);
    window.addEventListener('orientationchange', onOrientation);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('orientationchange', onOrientation);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    const syncFullscreenState = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null };
      if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
        setIsPlayerExpanded(false);
      }
    };

    document.addEventListener("fullscreenchange", syncFullscreenState);
    document.addEventListener("webkitfullscreenchange", syncFullscreenState as EventListener);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
      document.removeEventListener("webkitfullscreenchange", syncFullscreenState as EventListener);
    };
  }, []);

  const handleMobileFullscreen = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const target = videoContainerRef.current;
    if (!target) return;

    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
    };
    const element = target as HTMLDivElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
      webkitEnterFullscreen?: () => Promise<void> | void;
    };

    try {
      const activeFullscreen = document.fullscreenElement || doc.webkitFullscreenElement;
      if (activeFullscreen) {
        await (document.exitFullscreen?.() || doc.webkitExitFullscreen?.());
        setIsPlayerExpanded(false);
        return;
      }
      if (isPlayerExpanded) {
        setIsPlayerExpanded(false);
        return;
      }

      // Ativa imediatamente o modo tela-cheia interno. Em muitos celulares,
      // o navegador bloqueia/ignora fullscreen nativo para iframes, então este
      // modo garante o resultado visual mesmo quando a API nativa falha.
      setIsPlayerExpanded(true);

      if (element.requestFullscreen) {
        await element.requestFullscreen({ navigationUI: "hide" });
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.webkitEnterFullscreen) {
        await element.webkitEnterFullscreen();
      }
    } catch (err) {
      setIsPlayerExpanded(true);
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      toast.error("Por favor, digite seu nome.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Por favor, digite seu telefone.");
      return;
    }
    
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length !== 11) {
      toast.error("Por favor, insira um número de WhatsApp válido com DDD (11 dígitos, ex: (11) 99999-9999).");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const cleanPhone = phone.trim();
      
      // 1. Persist to Supabase Database
      const { data: existingLead } = await supabase
        .from("webinar_leads")
        .select("*")
        .eq("whatsapp", cleanPhone)
        .maybeSingle();
        
      if (existingLead) {
        let parsedSource: any = {};
        try {
          parsedSource = existingLead.source ? JSON.parse(existingLead.source) : {};
        } catch (e) {
          parsedSource = {};
        }
        
        const nextSource = {
          ...parsedSource,
          sourceType: "live",
          entryCount: (parsedSource.entryCount || 1) + 1,
          lastActiveAt: Date.now(),
        };
        
        await supabase
          .from("webinar_leads")
          .update({
            name: name.trim(),
            source: JSON.stringify(nextSource)
          })
          .eq("whatsapp", cleanPhone);
      } else {
        const newSource = {
          sourceType: "live",
          entryCount: 1,
          watchTime: 0,
          lastPlaybackTime: 0,
          clickedOffer: false,
          comments: [],
          lastActiveAt: Date.now(),
        };
        
        await supabase
          .from("webinar_leads")
          .insert({
            name: name.trim(),
            whatsapp: cleanPhone,
            source: JSON.stringify(newSource)
          });
      }

      // 2. Also keep local storage synchronized for backward compatibility / fallback
      const existingLeadsStr = localStorage.getItem("live_stream_leads");
      const existingLeads = existingLeadsStr ? JSON.parse(existingLeadsStr) : [];
      const existingIndex = existingLeads.findIndex((l: any) => l.phone === cleanPhone);
      
      if (existingIndex !== -1) {
        existingLeads[existingIndex].entryCount = (existingLeads[existingIndex].entryCount || 1) + 1;
        existingLeads[existingIndex].name = name.trim();
        existingLeads[existingIndex].registeredAt = new Date().toLocaleString("pt-BR");
      } else {
        const newLead = {
          id: Date.now().toString(),
          name: name.trim(),
          phone: cleanPhone,
          registeredAt: new Date().toLocaleString("pt-BR"),
          entryCount: 1,
          watchTime: 0,
          clickedOffer: false,
          hasLeft: false,
          lastPlaybackTime: 0
        };
        existingLeads.unshift(newLead);
      }
      
      localStorage.setItem("live_stream_leads", JSON.stringify(existingLeads));
      
      const activeSession = {
        phone: cleanPhone,
        name: name.trim(),
        startedAt: Date.now()
      };
      localStorage.setItem("live_stream_active_session", JSON.stringify(activeSession));
      
      const statsStr = localStorage.getItem("live_stream_analytics_stats");
      const stats = statsStr ? JSON.parse(statsStr) : {
        totalSessions: 0,
        totalOfferClicks: 0,
        exitIntervals: {
          "0-5min": 0,
          "5-15min": 0,
          "15-30min": 0,
          "30-60min": 0,
          "60min+": 0
        },
        dailyEntries: {}
      };
      
      stats.totalSessions = (stats.totalSessions || 0) + 1;
      const todayStr = new Date().toLocaleDateString("pt-BR").split("/").reverse().join("-");
      stats.dailyEntries[todayStr] = (stats.dailyEntries[todayStr] || 0) + 1;
      localStorage.setItem("live_stream_analytics_stats", JSON.stringify(stats));
      
    } catch (e) {
      console.error("Erro ao processar cadastro de lead:", e);
    }
    
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("watch");
      toast.success("Inscrição confirmada! Aproveite a transmissão.");
    }, 1200);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const userComment: Comment & { sortTimestamp: number; playbackSecond: number } = {
      id: String(Date.now()),
      username: name.trim() || "Lucas",
      message: newComment.trim(),
      isUser: true,
      time: timeStr,
      sortTimestamp: Date.now(),
      playbackSecond: playbackSeconds // Armazena a posição exata da live para rolagem integrada
    };

    setUserComments(prev => {
      const updated = [...prev, userComment];
      try {
        const activeSessionStr = localStorage.getItem("live_stream_active_session");
        if (activeSessionStr) {
          const activeSession = JSON.parse(activeSessionStr);
          if (activeSession.phone) {
            localStorage.setItem(`live_stream_user_comments_${activeSession.phone}`, JSON.stringify(updated));
          }
        }
      } catch (e) {
        console.error("Error saving user comment to localStorage:", e);
      }
      return updated;
    });

    addCommentToSupabase(newComment.trim()); // Sync to Supabase in real-time
    setNewComment("");

  };

  const trackCheckoutClick = () => {
    try {
      updateClickedOfferInSupabase(); // Sync to Supabase in real-time
      
      const activeSessionStr = localStorage.getItem("live_stream_active_session");
      if (activeSessionStr) {
        const activeSession = JSON.parse(activeSessionStr);
        const leadsStr = localStorage.getItem("live_stream_leads");
        if (leadsStr) {
          const leads = JSON.parse(leadsStr);
          const leadIndex = leads.findIndex((l: any) => l.phone === activeSession.phone);
          if (leadIndex !== -1) {
            leads[leadIndex].clickedOffer = true;
            localStorage.setItem("live_stream_leads", JSON.stringify(leads));
          }
        }
      }
      
      const statsStr = localStorage.getItem("live_stream_analytics_stats");
      const stats = statsStr ? JSON.parse(statsStr) : {
        totalSessions: 0,
        totalOfferClicks: 0,
        exitIntervals: {
          "0-5min": 0,
          "5-15min": 0,
          "15-30min": 0,
          "30-60min": 0,
          "60min+": 0
        },
        dailyEntries: {}
      };
      
      stats.totalOfferClicks = (stats.totalOfferClicks || 0) + 1;
      localStorage.setItem("live_stream_analytics_stats", JSON.stringify(stats));
    } catch (e) {
      console.error("Erro ao rastrear clique de checkout:", e);
    }
  };

  const offerActivationSec = getOfferActivationSeconds();
  const offerUnlocked = playbackSeconds >= offerActivationSec;
  const mobileVideoFocusMode = isMobileLandscape || isPlayerExpanded;

  if (!isTimeAllowed) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none justify-center items-center p-4 md:p-6 animate-fade-in relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-md w-full relative z-10">
          <div className="bg-zinc-900/80 backdrop-blur-xl text-zinc-100 rounded-3xl shadow-2xl border border-zinc-800/80 p-6 md:p-8 flex flex-col gap-6 items-center text-center">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.25em] font-black text-cyan-400">Canva Viagem</span>
              <h2 className="text-xl font-black italic tracking-tighter text-white mt-1">
                AULA SECRETA AO VIVO
              </h2>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="absolute inset-0 w-24 h-24 rounded-full bg-cyan-400/5 animate-pulse" />
              <div className="h-20 w-20 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner relative z-10">
                <Clock size={36} className="text-cyan-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wide">
                A live encerrou
              </h3>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed px-2">
                Aguarde a próxima live no grupo. A transmissão ao vivo fica disponível diariamente das 17h às 00h (horário de Brasília), com início pontual às 19h.
              </p>
            </div>

            <div className="w-full bg-zinc-950 border border-zinc-800/50 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs border-b border-zinc-800/50 pb-2">
                <span className="text-zinc-500 font-bold uppercase tracking-wider">Período de Acesso</span>
                <span className="text-zinc-300 font-black">Diário</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-bold uppercase tracking-wider">Horário de Brasília</span>
                <span className="text-cyan-400 font-black text-sm bg-cyan-400/10 px-3 py-1 rounded-xl">
                  17:00 às 00:00
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-zinc-950/40 border border-zinc-800/40 px-4 py-2 rounded-xl text-[10px] text-zinc-400 uppercase tracking-widest font-black">
              <span className="h-2 w-2 rounded-full bg-zinc-600 animate-pulse" />
              Retorne no horário da transmissão
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      
      {/* PASSO 1: CARD DE CADASTRO */}
      {step === "register" ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <div className="bg-white text-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 p-6 flex flex-col gap-5">
              
              {/* BANNER ESTILIZADO SUPERIOR */}
              <div className="bg-black text-white p-5 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden border border-zinc-800">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
                <span className="text-[9px] uppercase tracking-[0.2em] font-black text-zinc-500">Acelere Suas Vendas com</span>
                <h2 className="text-lg md:text-xl font-black italic tracking-tighter text-cyan-400 mt-1">
                  CANVA VIAGEM <span className="text-white">&amp; FÁBRICA</span>
                </h2>
                <div className="flex gap-1.5 mt-3 justify-center">
                  <span className="text-[8px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-bold">✓ Feed Premium em 5 min</span>
                  <span className="text-[8px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-bold">✓ Anúncios com I.A em 5s</span>
                </div>
              </div>

              {/* BARRA DE PROGRESSO DE VAGAS */}
              <div className="w-full">
                <div className="h-6 w-full bg-zinc-200 rounded-full overflow-hidden relative border border-zinc-300">
                  <div 
                    className="h-full bg-[#25D366] rounded-full flex items-center justify-center text-[10px] font-black text-white tracking-wider animate-pulse" 
                    style={{ width: "84%" }}
                  >
                    84% dos agentes de viagens conectados...
                  </div>
                </div>
              </div>

              {/* TÍTULO PRINCIPAL */}
              <div className="text-center">
                <h3 className="text-[22px] md:text-[26px] font-black text-zinc-900 leading-tight">
                  A Fábrica de Criar Anúncios e Criar Site de Viagens Ilimitados em minutos!
                </h3>
              </div>

              {/* FORMULÁRIO */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-700 uppercase tracking-wider">Nome</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    name="name"
                    autoComplete="name"
                    className="bg-zinc-50 border-zinc-200 text-zinc-900 focus-visible:ring-[#00E5FF] rounded-xl py-5 text-[16px] md:text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-700 uppercase tracking-wider">Telefone</label>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center gap-1.5 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 text-sm font-bold flex-shrink-0">
                      <span>🇧🇷 BR</span>
                      <span className="text-[10px] text-zinc-500">▼</span>
                    </div>
                    <Input
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="(XX) XXXXX-XXXX"
                      required
                      name="phone"
                      autoComplete="tel"
                      className="flex-1 bg-zinc-50 border-zinc-200 text-zinc-900 focus-visible:ring-[#00E5FF] rounded-xl py-5 text-[16px] md:text-sm"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleRegister}
                  disabled={isSubmitting}
                  className={`w-full font-black py-6 rounded-xl shadow-lg border-none flex items-center justify-center text-md transition-all duration-300 ${
                    isSubmitting 
                      ? "bg-[#00E5FF] hover:bg-[#00c8e0] text-black" 
                      : "bg-[#25D366] hover:bg-[#20ba59] text-white"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Conectando à Live...</span>
                    </div>
                  ) : (
                    "Confirmar Inscrição"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (

        /* PASSO 2: PLAYER DA LIVE — LAYOUT MOBILE-FIRST CORRIGIDO */
        <div
          className="flex flex-col bg-zinc-950 overflow-hidden"
          style={{
            position: isIOSMobile ? 'absolute' : 'fixed',
            top: `${viewportOffsetTop}px`,
            left: 0,
            right: 0,
            bottom: 0,
            height: `${viewportHeight}px`,
            maxHeight: `${viewportHeight}px`,
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            zIndex: 50,
          }}
        >

          {/* HEADER DA LIVE */}
          <div className={`${mobileVideoFocusMode ? "hidden" : "flex"} bg-zinc-900 border-b border-zinc-800 px-4 py-2 sm:py-3 items-center justify-between gap-3 flex-shrink-0`} style={{ marginTop: '10px' }}>
            <h2 className="text-xs sm:text-base font-black text-white leading-tight flex-1 min-w-0 break-words line-clamp-2">
              A Fábrica de Criar Anúncios e Criar Site de Viagens Ilimitados em minutos!
            </h2>
            <div className="flex items-center gap-1.5 bg-red-600 px-2.5 py-1 rounded-full flex-shrink-0 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              <span className="text-[9px] font-black text-white uppercase tracking-wider">AO VIVO</span>
            </div>
          </div>

          {/* LAYOUT PRINCIPAL: empilhado no mobile (altura limitada), lado a lado no desktop (fixo) */}
          <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">

            {/* ── PLAYER DE VÍDEO ─────────────────────────────────────── */}
            <div
              className={`relative bg-black w-full lg:w-3/4 lg:flex-none lg:h-full overflow-hidden ${mobileVideoFocusMode ? "flex-1 min-h-0" : "flex-shrink-0"}`}
              style={mobileVideoFocusMode ? { height: "100%", minHeight: 0 } : { aspectRatio: "16/9" }}
            >

              {/* BADGES */}
              <div className="absolute top-3 left-3 z-40 flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-red-600 px-2.5 py-1 rounded-full font-black text-[10px] text-white uppercase tracking-wider shadow-lg">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  Ao Vivo
                </div>
                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-lg border border-white/10">
                  <Eye size={11} className="text-cyan-400 animate-pulse" />
                  <span>{viewers}</span>
                </div>
              </div>

              {/* CLICK-TO-PLAY OVERLAY */}
              {!isPlaying ? (
                <div
                  onClick={handleStartPlay}
                  className="absolute inset-0 z-30 cursor-pointer bg-gradient-to-t from-zinc-950 via-zinc-900/90 to-zinc-950 flex flex-col items-center justify-center p-4 text-center hover:brightness-110 transition-all duration-500"
                >
                  <h3 className="text-base sm:text-3xl font-black text-white tracking-widest uppercase mb-3">
                    SUA AULA JÁ COMEÇOU
                  </h3>
                  <div className="h-16 w-16 sm:h-28 sm:w-28 rounded-full bg-red-600 border-4 border-red-500 flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.9)] animate-pulse">
                    <Play size={28} className="text-white fill-white ml-2 sm:w-10 sm:h-10" />
                  </div>
                  <h3 className="text-sm sm:text-2xl font-black text-white tracking-widest uppercase mt-3">
                    CLIQUE PARA ASSISTIR
                  </h3>
                </div>
              ) : (
                /* OVERLAY DE PAUSE */
                <div
                  onClick={handleTogglePause}
                  className="absolute inset-0 z-20 cursor-pointer flex flex-col items-center justify-center group"
                >
                  {isPaused && (
                    <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-4 transition-all duration-300 animate-fade-in z-30">
                      <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-cyan-400/20 border-2 border-cyan-400 flex items-center justify-center shadow-2xl">
                        <Play size={28} className="text-cyan-400 fill-cyan-400 ml-1.5 animate-pulse" />
                      </div>
                      <span className="text-xs sm:text-sm font-black tracking-[0.2em] text-cyan-400 uppercase">
                        Transmissão Pausada
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        Clique em qualquer lugar para retomar
                      </span>
                    </div>
                  )}
                  {!isPaused && (
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-zinc-800 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 shadow-lg z-30">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">Ao Vivo</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTogglePause(); }}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white p-1.5 rounded-lg transition-all flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                      >
                        <Pause size={11} className="fill-white" />
                        Pausar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* VÍDEO */}
              <div ref={videoContainerRef} id="live-video-container" className="relative w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center blur-3xl opacity-35 scale-125 pointer-events-none"
                  style={{ backgroundImage: `url('https://img.youtube.com/vi/${videoUrlId}/maxresdefault.jpg')` }}
                />
                <div className="relative w-full h-full bg-black z-10 overflow-hidden flex items-center justify-center">
                  <img
                    src={`https://img.youtube.com/vi/${videoUrlId}/maxresdefault.jpg`}
                    alt="Live Thumbnail"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
                  />
                  <iframe
                    ref={iframeRef}
                    className={`absolute inset-0 w-full h-full border-none z-10 transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
                    style={{ pointerEvents: isPlaying ? 'auto' : 'none' }}
                    src={`https://www.youtube.com/embed/${videoUrlId}?enablejsapi=1&autoplay=1&mute=1&controls=0&rel=0&showinfo=0&iv_load_policy=3&fs=1&disablekb=1&playsinline=1${initialStartSeconds > 0 ? `&start=${initialStartSeconds}` : ""}`}
                    title="Canva Viagem Live"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                </div>

              </div>

              {/* BOTÃO TELA CHEIA — MOBILE */}
              {isPlaying && isMobileViewport && (
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={handleMobileFullscreen}
                  aria-label={isPlayerExpanded ? "Sair da tela cheia" : "Tela cheia"}
                  className="absolute top-3 right-3 z-[80] bg-black/70 backdrop-blur-md hover:bg-black/90 text-white p-2 rounded-full border border-white/15 shadow-lg active:scale-95 transition pointer-events-auto"
                >
                  {isPlayerExpanded ? <span className="block text-sm font-black leading-none">×</span> : <Maximize2 size={16} />}
                </button>
              )}


              {/* BANNER DE OFERTA SOBRE O VÍDEO — DESKTOP APENAS */}
              {showOfferBanner && (
                <div className="hidden sm:flex absolute bottom-3 left-3 right-3 z-40 bg-zinc-950/95 backdrop-blur-xl border-2 border-cyan-400/40 p-3 rounded-2xl flex-row items-center justify-between gap-3 shadow-[0_0_40px_rgba(34,211,238,0.25)] animate-fade-in">
                  <div className="relative w-full flex flex-row items-center justify-between gap-3 pr-6">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowOfferBanner(false); setUserClosedOffer(true); }}
                      className="absolute -top-1 right-0 z-50 text-zinc-400 hover:text-white text-xs font-bold bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ✕
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-tr from-cyan-400 to-blue-600 p-2 rounded-xl text-black flex-shrink-0">
                        <ShoppingBag size={16} className="animate-bounce" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider line-clamp-1">{offerSettings.title}</h4>
                        <p className="text-[10px] text-zinc-300 font-medium leading-tight line-clamp-1">{offerSettings.description}</p>
                      </div>
                    </div>
                    <a
                      href={offerSettings.checkoutUrl || "https://buy.stripe.com/fZu14ogGugreeH9bF28so0d"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => { e.stopPropagation(); trackCheckoutClick(); }}
                      className="flex-shrink-0"
                    >
                      <button className="bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-black font-black px-4 py-2 rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all duration-300 flex items-center gap-1.5 text-xs uppercase tracking-wider animate-pulse whitespace-nowrap">
                        <Sparkles size={11} className="fill-black" />
                        Garantir Desconto
                      </button>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* ── BANNER DE OFERTA MOBILE (ABAIXO DO VÍDEO, NÃO SOBREPOSTO) ── */}
            {showOfferBanner && !mobileVideoFocusMode && (
              <div className="sm:hidden flex-shrink-0 bg-zinc-950 border-b border-cyan-400/30 px-3 py-2 animate-fade-in">
                <div className="flex flex-row items-center gap-3">
                  <div className="bg-gradient-to-tr from-cyan-400 to-blue-600 p-2 rounded-xl text-black flex-shrink-0">
                    <ShoppingBag size={16} className="animate-bounce" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-black text-white uppercase tracking-wide leading-tight line-clamp-1">{offerSettings.title}</h4>
                    <p className="text-[10px] text-zinc-400 leading-tight line-clamp-1 mt-0.5">{offerSettings.description}</p>
                  </div>
                  <a
                    href={offerSettings.checkoutUrl || "https://buy.stripe.com/fZu14ogGugreeH9bF28so0d"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => { e.stopPropagation(); trackCheckoutClick(); }}
                    className="flex-shrink-0"
                  >
                    <button className="bg-gradient-to-r from-emerald-400 to-green-500 text-black font-black px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                      <Sparkles size={10} className="fill-black" />
                      Garantir
                    </button>
                  </a>
                </div>
              </div>
            )}

            {/* ── PAINEL DO CHAT ───────────────────────────────────────── */}
            <div
              className={`flex-col bg-zinc-900/60 border-t border-zinc-800/80 lg:border-t-0 lg:border-l lg:w-1/4 lg:flex-none flex-1 min-h-0 overflow-hidden ${mobileVideoFocusMode ? "hidden lg:flex" : "flex"}`}
              data-chat-panel
            >

              {/* ABAS: CHAT e OFERTA */}
              {offerUnlocked && (
                <div className="flex p-1.5 bg-zinc-900 border-b border-zinc-800/80 gap-1 flex-shrink-0">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                      activeTab === "chat"
                        ? "bg-white text-black shadow-lg"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                    }`}
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveTab("offer")}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 relative overflow-hidden ${
                      activeTab === "offer" && offerUnlocked
                        ? "bg-gradient-to-r from-emerald-400 to-green-500 text-black shadow-lg"
                        : offerUnlocked
                        ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20 border border-emerald-900/30"
                        : "text-zinc-600 cursor-default"
                    }`}
                  >
                    {offerUnlocked && activeTab !== "offer" && (
                      <span className="absolute top-1.5 right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    )}
                    🔥 Oferta
                  </button>
                </div>
              )}

              {/* ABA CHAT */}
              {activeTab === "chat" && (
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <div
                    ref={chatScrollRef}
                    className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
                  >
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        className={`flex flex-col gap-0.5 p-2.5 rounded-2xl max-w-[90%] transition-all duration-300 ${
                          c.isUser
                            ? "bg-cyan-950/40 border border-cyan-800/30 ml-auto text-zinc-100"
                            : "bg-zinc-800/40 border border-zinc-800/30 text-zinc-100"
                        }`}
                      >
                        <span className={`text-[10px] font-bold ${c.isUser ? "text-cyan-400" : "text-zinc-400"}`}>
                          @{c.username}
                        </span>
                        <p className="text-xs font-medium leading-relaxed break-words">{c.message}</p>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  <form
                    onSubmit={handleSendMessage}
                    data-chat-panel
                    className="p-2 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center gap-1.5 flex-shrink-0 pointer-events-auto touch-auto select-text"
                  >
                    <input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onFocus={(e) => {
                        setIsPlayerExpanded(false);
                      }}
                      type="text"
                      placeholder="Digite algo..."
                      autoComplete="off"
                      autoCapitalize="sentences"
                      inputMode="text"
                      enterKeyHint="send"
                      className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-xl text-[16px] md:text-xs px-3 py-2 h-10 pointer-events-auto touch-auto select-text"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-cyan-400 text-black hover:bg-cyan-300 shadow-md flex-shrink-0 h-10 w-10 flex items-center justify-center transition-colors border-none pointer-events-auto touch-manipulation"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              )}

              {/* ABA DE OFERTA ESPECIAL */}
              {activeTab === "offer" && (
                <div className="flex-1 min-h-0 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent flex flex-col gap-3">
                  {!offerUnlocked ? (
                    <div className="flex flex-col items-center justify-center gap-3 text-center py-8">
                      <div className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                        <Clock size={20} className="text-zinc-500" />
                      </div>
                      <p className="text-xs text-zinc-400 max-w-[180px]">A oferta especial será revelada no momento certo da transmissão!</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-200 flex flex-col gap-4 text-zinc-900">

                      {/* CRONÔMETRO — SEMPRE NO TOPO */}
                      <div className="flex flex-col items-center justify-center gap-1 bg-red-50 rounded-2xl py-3 px-2 border border-red-100 flex-shrink-0">
                        <span className="text-[10px] text-red-500 font-black uppercase tracking-wider flex items-center gap-1">
                          <Clock size={11} className="animate-pulse" />
                          A OFERTA EXPIRA EM
                        </span>
                        <div className="text-red-600 font-black text-3xl tracking-widest font-mono select-none">
                          {getOfferCountdown()}
                        </div>
                      </div>

                      {/* BANNER NEGRO DA OFERTA */}
                      <div className="bg-black rounded-xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden flex-shrink-0">
                        <div className="absolute -top-8 -left-8 w-20 h-20 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
                        <div className="absolute -bottom-8 -right-8 w-20 h-20 rounded-full bg-yellow-500/10 blur-xl pointer-events-none" />
                        <span className="text-[#FFD700] font-black text-lg tracking-wider animate-pulse drop-shadow-[0_2px_8px_rgba(255,215,0,0.3)]">
                          APENAS {getDynamicSeats()} VAGAS RESTANTES
                        </span>
                        <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-2 block">
                          DE <span className="line-through decoration-red-500 decoration-2 font-black text-white text-sm">R$ 1.500,00</span>
                        </span>
                        <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest block mt-1.5">
                          POR APENAS
                        </span>
                        <div className="flex items-baseline justify-center gap-1 mt-2">
                          <span className="text-white text-xs font-extrabold uppercase tracking-wide">12x</span>
                          <span className="text-[#00E676] font-black text-2xl tracking-tight drop-shadow-[0_0_15px_rgba(0,230,118,0.4)]">
                            R$ 28,91
                          </span>
                        </div>
                        <span className="text-white text-xs underline mt-2 block font-bold">
                          ou R$ 347,00 à vista
                        </span>
                      </div>

                      {/* ANCORAGEM DE PREÇOS */}
                      <div className="flex justify-between items-center px-1 text-xs flex-shrink-0">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-zinc-400 line-through font-semibold">De R$ 1.500,00</span>
                          <span className="text-zinc-900 font-extrabold text-sm">Por R$ 347,00</span>
                        </div>
                        <div className="flex flex-col text-right gap-0.5">
                          <span className="text-zinc-400 font-semibold">Por tempo limitado</span>
                          <span className="text-zinc-900 font-extrabold text-sm">Oferta de lançamento</span>
                        </div>
                      </div>

                      {/* BOTÃO GRANDE VERDE */}
                      <a
                        href={offerSettings.checkoutUrl || "https://buy.stripe.com/fZu14ogGugreeH9bF28so0d"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block flex-shrink-0"
                        onClick={trackCheckoutClick}
                      >
                        <button className="w-full py-3.5 bg-[#25D366] hover:bg-[#1ebd54] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_8px_25px_rgba(37,211,102,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-none flex items-center justify-center gap-2">
                          <ShoppingBag size={16} className="animate-bounce flex-shrink-0 text-white fill-none" />
                          APROVEITAR OPORTUNIDADE
                        </button>
                      </a>

                      {/* VER OUTROS PLANOS */}
                      <div className="text-center flex-shrink-0">
                        <a
                          href="/planos"
                          className="text-zinc-400 hover:text-zinc-800 text-xs font-black transition-colors underline uppercase tracking-widest"
                        >
                          ver outros planos
                        </a>
                      </div>

                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* FLOAT RECOVERY WIDGET (Whats Support on exit-intent or long pause) */}
      {playbackSeconds >= 15 * 60 && showRecoveryWidget && !hasManuallyClosedWidget && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-zinc-950/90 backdrop-blur-md border border-emerald-500/30 p-4 rounded-2xl shadow-[0_8px_32px_rgba(16,185,129,0.25)] flex items-center gap-3 animate-fade-in text-white">
          <div className="bg-[#25D366]/20 p-2.5 rounded-xl text-[#25D366] flex-shrink-0 animate-bounce">
            <MessageCircle size={20} className="fill-[#25D366]/20 text-[#25D366]" />
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 font-sans">Dúvidas sobre o Canva Viagem?</h4>
            <p className="text-[10px] text-zinc-300 font-medium leading-normal font-sans">
              Ficou com alguma dúvida ou travou em algo? Fale agora com o Lucas no WhatsApp.
            </p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <a 
              href={getDynamicSupportLink()} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => {
                setShowRecoveryWidget(false);
                setHasManuallyClosedWidget(true);
                trackCheckoutClick();
              }}
            >
              <Button size="sm" className="bg-[#25D366] hover:bg-[#1ebd54] text-white font-extrabold text-[10px] uppercase tracking-wider px-3 h-8 rounded-lg flex items-center gap-1 font-sans">
                Chamar Lucas
              </Button>
            </a>
            <button 
              onClick={() => {
                setShowRecoveryWidget(false);
                setHasManuallyClosedWidget(true);
              }}
              className="text-[9px] text-zinc-500 hover:text-zinc-300 font-bold uppercase tracking-wider text-center font-sans"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Sleek floating pulsing WhatsApp support button (visible only after 15 minutes AND (offer is shown or min 65), and if the card is closed) */}
      {playbackSeconds >= 15 * 60 && (playbackSeconds >= getOfferActivationSeconds() || playbackSeconds >= 65 * 60) && (!showRecoveryWidget || hasManuallyClosedWidget) && step === "watch" && (
        <a
          href={getDynamicSupportLink()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackCheckoutClick}
          className="fixed bottom-4 right-4 z-50 flex items-center justify-center bg-[#25D366] hover:bg-[#1ebd54] text-white p-3.5 rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 group"
          title="Falar no WhatsApp"
        >
          {/* Pulsing ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping group-hover:animate-none pointer-events-none" />
          <MessageCircle size={22} className="fill-white text-white relative z-10" />
          
          {/* Premium micro-tooltip on hover */}
          <span className="absolute right-14 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 text-white font-black text-[9px] uppercase tracking-widest px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl transform translate-x-2 group-hover:translate-x-0 font-sans">
            Dúvidas? Chame no WhatsApp
          </span>
        </a>
      )}
    </div>
  );
};

export default LiveStream;
