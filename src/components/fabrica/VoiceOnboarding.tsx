import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFabricaContext } from "@/hooks/useFabricaContext";
import { useSaveDiagnostico } from "@/hooks/useFabricaDiagnosticos";
import { toast } from "sonner";

type State = "idle" | "recording" | "uploading" | "transcribing" | "extracting" | "review" | "error";

interface ExtractedData {
  agencyName: string;
  niche: string;
  destinos: string[];
  packages: Array<{ title: string; description: string; price: string }>;
}

export function VoiceOnboarding() {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const { state: fabricaState, update } = useFabricaContext();
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
      setErrorMsg("Não foi possível acessar o microfone.");
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
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fabrica-transcribe-audio?stream=false`,
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

      if (!fullText || fullText.length < 5) {
        throw new Error("Não conseguimos entender o áudio. Fale mais alto e por pelo menos 10 segundos.");
      }

      // 3. Extrair informações de negócios com LLM
      setState("extracting");
      const extractResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fabrica-extract-business-info-v2`,
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
    const newPackages = (extractedData.packages || []).map(p => ({
      id: `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: p.title,
      description: p.description,
      price: p.price,
      imageUrl: "",
      ctaLabel: "Reservar agora",
      isDraft: true,
    }));

    const newStateUpdates = {
      agencyName: extractedData.agencyName || fabricaState.agencyName,
      niche: (extractedData.niche as any) || fabricaState.niche,
      destinos: extractedData.destinos || fabricaState.destinos,
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
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex items-center">
      {state === "idle" && (
        <div className="flex items-center gap-2 mr-4">
          <button
            onClick={startRecording}
            className="flex items-center justify-center w-7 h-7 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg transition-all active:scale-95 border border-amber-500/20"
            title="Gravar por voz"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>
          <span className="text-[9px] font-black text-white/60 uppercase tracking-widest select-none whitespace-nowrap">
            Adicione informações da sua empresa
          </span>
        </div>
      )}

      {state === "recording" && (
        <div className="flex items-center gap-2 mr-4">
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 text-[10px] font-bold font-mono">{formatTime(timer)}</span>
            <span className="text-[9px] text-red-400/70 uppercase tracking-wide ml-1">
              Gravando...
            </span>
            <button
              onClick={stopRecording}
              className="bg-red-500 hover:bg-red-600 text-white p-0.5 rounded-sm transition-transform active:scale-95 ml-2"
            >
              <Square className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {(state === "uploading" || state === "transcribing" || state === "extracting") && (
        <div className="flex items-center gap-2 text-amber-400 mr-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-[9px] uppercase tracking-wide font-bold whitespace-nowrap">
            {state === "uploading" && "Enviando..."}
            {state === "transcribing" && "Ouvindo áudio..."}
            {state === "extracting" && "Extraindo..."}
          </span>
        </div>
      )}

      {state === "error" && (
        <div className="flex items-center gap-2 text-red-400 mr-4">
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="font-bold text-[10px]">{errorMsg}</span>
          <button 
            onClick={() => setState("idle")}
            className="text-[9px] text-white/50 hover:text-white underline ml-2 whitespace-nowrap"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {state === "review" && extractedData && (
        <div className="absolute top-[110%] left-0 z-50 w-full max-w-2xl bg-[#0F0F11] border border-white/10 rounded-xl p-6 space-y-6 shadow-2xl">
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
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-4 py-1.5 rounded-lg text-xs transition-colors shadow-lg shadow-amber-500/20"
            >
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
