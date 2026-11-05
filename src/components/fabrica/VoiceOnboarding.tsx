import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFabricaContext, type Pacote } from "@/hooks/useFabricaContext";
import { useSaveDiagnostico } from "@/hooks/useFabricaDiagnosticos";
import { toast } from "sonner";
import { buildPackageSlug, createUniquePackageSlug, suggestPackageSegment } from "@/lib/package-details";
import { useEntitlements } from "@/contexts/EntitlementsContext";
import { FabricaPaywallDialog } from "@/components/fabrica/FabricaPaywallDialog";

type State = "idle" | "recording" | "uploading" | "transcribing" | "extracting" | "review" | "error";

interface ExtractedData {
  agencyName: string;
  niche: string;
  whatsapp?: string;
  instagram?: string;
  city?: string;
  destinos: string[];
  packages: Array<
    Pick<Pacote, "title" | "description" | "price"> &
      Partial<Omit<Pacote, "id" | "title" | "description" | "price">>
  >;
}

/** "R$ 1.990" vira preço único; "10x de R$ 199" vira parcela. Sem número, fica como está. */
function spokenPriceFields(raw: string | undefined) {
  const value = (raw || "").replace(/R\$/gi, " ").trim();
  const parcel = value.match(/(\d{1,2})\s*x\s*(?:de\s*)?([\d.,]+)/i);
  const amount = parcel ? parcel[2] : value.match(/\d[\d.,]*/)?.[0];
  if (!amount) return {};
  const cents = /,\d{2}$/.test(amount) ? "" : ",00";
  const lastPrice = `${amount}${cents}`;
  return parcel
    ? { lastPrice, lastPaymentMode: "installments" as const, lastInstallments: `${parcel[1]}x` }
    : { lastPrice, lastPaymentMode: "from" as const };
}

/**
 * Microfone único da plataforma. "bar" fica na barra da Fábrica; "hero" é o cartão grande do portal.
 * Os dois gravam, transcrevem, extraem e salvam no mesmo projeto.
 */
export function VoiceOnboarding({ variant = "bar", onSaved }: { variant?: "bar" | "hero"; onSaved?: () => void }) {
  const hero = variant === "hero";
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showVoicePaywall, setShowVoicePaywall] = useState(false);

  const { state: fabricaState, update } = useFabricaContext();
  const { can, track } = useEntitlements();
  const saveProject = useSaveDiagnostico();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (state === "recording") {
      timerRef.current = window.setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [state]);

  const startRecording = async () => {
    if (!can("voice.use")) {
      track("paywall_viewed", { feature: "voice", source: "voice_onboarding" });
      setShowVoicePaywall(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/mp4";
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await processAudio(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start(200);
      setTimer(0);
      setTranscript("");
      setState("recording");
    } catch (err) {
      console.error(err);
      setErrorMsg("Microfone bloqueado. Clique no cadeado ao lado do endereço do site, permita o microfone e tente de novo.");
      setState("error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setState("uploading");
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      setState("uploading");
      const formData = new FormData();
      formData.append("file", audioBlob, "audio_record.webm");

      const { data: { session } } = await supabase.auth.getSession();
      
      setState("transcribing");
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zdjtcwtakgizbsbbwtgc.supabase.co";
      const response = await fetch(
        `${supabaseUrl}/functions/v1/fabrica-transcribe-audio?stream=false`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload?.error || "Falha na transcrição de áudio.");
      }

      const transcribeData = await response.json();
      const fullText: string = (transcribeData?.text || "").trim();
      setTranscript(fullText);
      if (transcribeData?.audios_restantes === 1) {
        toast.warning("O próximo é o seu último áudio de hoje. Amanhã libera de novo.", { duration: 8000 });
      }
      track("audio_used", { source: "voice_onboarding" });

      if (!fullText || fullText.length < 5) {
        throw new Error("Não conseguimos entender o áudio. Fale mais alto e por pelo menos 10 segundos.");
      }

      // 3. Extrair informações de negócios com LLM
      setState("extracting");
      const extractResponse = await fetch(
        `${supabaseUrl}/functions/v1/fabrica-extract-business-info-v2`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ text: fullText })
        }
      );

      if (!extractResponse.ok) {
        throw new Error("Falha na extração dos dados.");
      }

      const extracted = await extractResponse.json();
      setExtractedData(extracted);
      setState("review");

    } catch (err: any) {
      console.error("Erro no processamento:", err);
      setErrorMsg(err.message || "Ocorreu um erro no processamento do áudio.");
      setState("error");
    }
  };

  const handleSaveAndAdvance = async () => {
    if (!extractedData) return;

    // Constrói os pacotes
    const usedSlugs = fabricaState.selectedPackages.map(
      (item) => item.slug || buildPackageSlug(item.title, item.id),
    );
    const newPackages = (extractedData.packages || []).map((p) => {
      const id = `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const slug = createUniquePackageSlug(p.slug || p.title, usedSlugs, id);
      usedSlugs.push(slug);
      return {
        ...p,
        id,
        title: p.title,
        slug,
        description: p.description,
        price: p.price || "Consulte",
        imageUrl: p.imageUrl || "",
        ctaLabel: p.ctaLabel || "Reservar agora",
        segment: p.segment || suggestPackageSegment(fabricaState.agencyType),
        isDraft: true,
      } satisfies Pacote;
    });

    const newStateUpdates = {
      agencyName: extractedData.agencyName || fabricaState.agencyName,
      niche: (extractedData.niche as any) || fabricaState.niche,
      // O que a pessoa já preencheu vale mais que o que a IA entendeu no áudio.
      whatsapp: fabricaState.whatsapp || (extractedData.whatsapp || "").replace(/\D/g, ""),
      instagram: fabricaState.instagram || extractedData.instagram || "",
      city: fabricaState.city || extractedData.city || "",
      // A arte sai com o que a pessoa falou, e não com o preço de exemplo do formulário.
      footerContact1Value: fabricaState.footerContact1Value || (extractedData.whatsapp || "").replace(/\D/g, ""),
      footerContact2Value: fabricaState.footerContact2Value || extractedData.instagram || "",
      ...spokenPriceFields(extractedData.packages?.[0]?.price),
      // Lista vazia da IA não pode apagar os destinos que o usuário já tinha.
      destinos: extractedData.destinos?.length ? extractedData.destinos : fabricaState.destinos,
      selectedPackages: [...newPackages, ...fabricaState.selectedPackages],
    };

    // Atualiza o contexto local
    update(newStateUpdates);

    // Salva no banco de dados
    try {
      const mergedState = { ...fabricaState, ...newStateUpdates };
      await saveProject.mutateAsync({
        state: mergedState,
        score: mergedState.digitalScore || 0,
        level: mergedState.level || 1,
        levelName: "Onboarding IA",
      });
      toast.success("✅ Perfil configurado e salvo com sucesso com IA!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar perfil, mas dados foram mantidos localmente.");
    }

    setState("idle");
    setTranscript("");
    setExtractedData(null);
    onSaved?.();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className={hero ? "w-full rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white shadow-lg sm:p-6" : "flex items-center min-w-0 w-full sm:w-auto"}>
      {state === "idle" && hero && (
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <button
            onClick={startRecording}
            className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full bg-white text-violet-700 shadow-xl transition-transform active:scale-95"
            aria-label="Gravar um áudio sobre a sua agência"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
            <Mic className="relative h-9 w-9" />
          </button>
          <div className="min-w-0">
            <p className="text-xl font-black leading-tight sm:text-2xl">Toque e fale sobre a sua agência</p>
            <p className="mt-1 text-sm text-white/85">
              Diga o nome, o WhatsApp, o Instagram e um pacote que você vende. A gente preenche tudo e seus 3 vídeos ficam a um clique.
            </p>
            <p className="mt-2 text-xs text-white/70">Exemplo: "Sou a Sol Viagens, de Maceió. Vendo Gramado, 5 dias, por 1.990 reais."</p>
          </div>
        </div>
      )}

      {state === "idle" && !hero && (
        <div className="flex items-center gap-3 sm:mr-4 min-w-0 w-full sm:w-auto">
          <button
            onClick={startRecording}
            className="relative flex items-center justify-center w-11 h-11 bg-violet-600 hover:bg-violet-500 text-white rounded-full transition-all active:scale-95 shadow-lg shadow-violet-600/40 shrink-0"
            title="Gravar por voz"
            aria-label="Gravar um áudio sobre a sua agência"
          >
            <Mic className="w-5 h-5" />
          </button>
          <button type="button" onClick={startRecording} className="min-w-0 text-left">
            <span className="block text-[13px] font-black leading-tight text-white">Fale sobre sua agência</span>
            <span className="block truncate text-[11px] text-white/55 sm:whitespace-nowrap">Grave um áudio e a gente preenche</span>
          </button>
        </div>
      )}

      {state === "recording" && (
        <div className={hero ? "flex flex-col items-center gap-3 py-2 text-center" : "flex items-center gap-2 mr-4"}>
          <div className={hero ? "flex items-center gap-3 text-xl font-black" : "flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full"}>
            <div className={hero ? "h-3 w-3 animate-pulse rounded-full bg-red-400" : "w-2 h-2 bg-red-500 rounded-full animate-pulse"}></div>
            <span className={hero ? "font-mono" : "text-red-400 text-xs font-bold font-mono"}>{formatTime(timer)}</span>
            <span className={hero ? "" : "text-[11px] text-red-400/80 font-bold ml-1"}>
              Gravando...
            </span>
            {!hero && (
              <button
                onClick={stopRecording}
                className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded-full text-[11px] font-bold transition-transform active:scale-95 ml-2"
              >
                <Square className="w-3 h-3" /> Parar
              </button>
            )}
          </div>
          {hero && (
            <button onClick={stopRecording} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 text-base font-black text-violet-700 active:scale-95">
              <Square className="h-4 w-4" /> Terminei de falar
            </button>
          )}
        </div>
      )}

      {(state === "uploading" || state === "transcribing" || state === "extracting") && (
        <div className={hero ? "flex items-center justify-center gap-3 py-4 text-base font-bold" : "flex items-center gap-2 text-amber-400 mr-4"}>
          <Loader2 className={hero ? "h-6 w-6 animate-spin" : "w-5 h-5 animate-spin"} />
          <span className={hero ? "" : "text-xs font-bold whitespace-nowrap"}>
            {state === "uploading" && "Enviando o áudio..."}
            {state === "transcribing" && "Ouvindo o áudio..."}
            {state === "extracting" && "Separando as informações..."}
          </span>
        </div>
      )}

      {state === "error" && (
        <div className={hero ? "flex flex-col items-center gap-3 py-2 text-center" : "flex items-center gap-2 text-red-400 mr-4"}>
          <AlertCircle className={hero ? "h-6 w-6" : "w-4 h-4 shrink-0"} />
          <span className={hero ? "text-sm font-bold" : "font-bold text-xs"}>{errorMsg}</span>
          <button
            onClick={() => { setState("idle"); void startRecording(); }}
            className={hero ? "inline-flex min-h-11 items-center rounded-full bg-white px-6 text-sm font-black text-violet-700" : "text-[11px] text-white/60 hover:text-white underline ml-2 whitespace-nowrap"}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {state === "review" && extractedData && hero && <div className="fixed inset-0 z-[65] bg-black/60" />}
      {state === "review" && extractedData && (
        <div className={hero
          ? "fixed inset-x-3 top-16 z-[70] mx-auto max-h-[80vh] max-w-2xl overflow-y-auto bg-[#0F0F11] border border-white/10 rounded-xl p-6 space-y-6 shadow-2xl"
          : "absolute top-[110%] left-0 z-50 max-h-[75vh] overflow-y-auto w-full max-w-2xl bg-[#0F0F11] border border-white/10 rounded-xl p-6 space-y-6 shadow-2xl"}>
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Check className="w-4 h-4" /> Revise os Dados
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Nome da Agência</label>
              <input 
                type="text" 
                value={extractedData.agencyName || ""}
                onChange={(e) => setExtractedData({...extractedData, agencyName: e.target.value})}
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Nicho / Especialidade</label>
              <input 
                type="text" 
                value={extractedData.niche || ""}
                onChange={(e) => setExtractedData({...extractedData, niche: e.target.value})}
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">WhatsApp</label>
              <input
                type="text"
                value={extractedData.whatsapp || ""}
                onChange={(e) => setExtractedData({...extractedData, whatsapp: e.target.value})}
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Instagram</label>
              <input
                type="text"
                value={extractedData.instagram || ""}
                onChange={(e) => setExtractedData({...extractedData, instagram: e.target.value})}
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          {extractedData.packages && extractedData.packages.length > 0 && (
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-2">Pacotes Encontrados</label>
              <div className="space-y-2">
                {extractedData.packages.map((pkg, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex flex-col md:flex-row gap-3">
                    <input 
                      type="text" 
                      value={pkg.title} 
                      onChange={(e) => {
                        const newPkgs = [...extractedData.packages];
                        newPkgs[i].title = e.target.value;
                        setExtractedData({...extractedData, packages: newPkgs});
                      }}
                      className="md:w-1/3 bg-transparent border-b border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                    <input 
                      type="text" 
                      value={pkg.price} 
                      onChange={(e) => {
                        const newPkgs = [...extractedData.packages];
                        newPkgs[i].price = e.target.value;
                        setExtractedData({...extractedData, packages: newPkgs});
                      }}
                      className="md:w-1/4 bg-transparent border-b border-white/10 text-emerald-400 text-xs focus:outline-none focus:border-amber-500"
                    />
                    <input 
                      type="text" 
                      value={pkg.description} 
                      onChange={(e) => {
                        const newPkgs = [...extractedData.packages];
                        newPkgs[i].description = e.target.value;
                        setExtractedData({...extractedData, packages: newPkgs});
                      }}
                      className="flex-1 bg-transparent border-b border-white/10 text-white/60 text-[11px] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button 
              onClick={() => { setState("idle"); setExtractedData(null); setTranscript(""); }}
              className="text-[11px] text-white/50 hover:text-white"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSaveAndAdvance}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-lg shadow-amber-500/20"
            >
              {onSaved ? "Salvar e criar meus vídeos" : "Salvar"}
            </button>
          </div>
        </div>
      )}
      <FabricaPaywallDialog
        open={showVoicePaywall}
        onOpenChange={setShowVoicePaywall}
        feature="voice"
        title="Preenchimento por voz é Elite"
        description="Você pode preencher todos os campos manualmente sem custo. No Elite, a IA ouve seu áudio e organiza agência, destinos e pacotes automaticamente."
      />
    </div>
  );
}
