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
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fabrica-transcribe-audio`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error("Falha na transcrição de áudio.");
      }

      if (!response.body) throw new Error("Sem resposta do servidor.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      // Ler streaming SSE
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "transcript.text.delta") {
                fullText += data.text;
                setTranscript(fullText);
              } else if (data.type === "transcript.text.done") {
                fullText = data.text;
                setTranscript(fullText);
              }
            } catch (e) {
              // Ignorar erros de parse se o pedaço estiver quebrado
            }
          }
        }
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
    <div className="bg-gradient-to-r from-violet-600/20 to-amber-500/20 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm mb-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="flex flex-col md:flex-row items-center gap-6 z-10 relative">
        <div className="flex-1 space-y-2">
          <h2 className="text-xl font-black text-white">Crie sua agência usando apenas a voz 🎙️</h2>
          <p className="text-sm text-white/70">
            Fale o nome da sua agência, o que você vende, os destinos principais e seus pacotes de viagem. Nossa IA escutará, montará o seu perfil e criará os pacotes automaticamente!
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center justify-center min-w-[200px]">
          {state === "idle" && (
            <button
              onClick={startRecording}
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-wider px-6 py-4 rounded-full transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
            >
              <Mic className="w-5 h-5" />
              <span>Gravar Áudio</span>
            </button>
          )}

          {state === "recording" && (
            <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/30 px-6 py-3 rounded-full">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 font-bold font-mono">{formatTime(timer)}</span>
              </div>
              <button
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-transform active:scale-95"
              >
                <Square className="w-4 h-4" />
              </button>
            </div>
          )}

          {(state === "uploading" || state === "transcribing" || state === "extracting") && (
            <div className="flex items-center gap-3 text-amber-400 bg-amber-500/10 px-6 py-3 rounded-full border border-amber-500/30">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-bold text-sm">
                {state === "uploading" && "Enviando..."}
                {state === "transcribing" && "Ouvindo áudio..."}
                {state === "extracting" && "Extraindo pacotes..."}
              </span>
            </div>
          )}
        </div>
      </div>

      {(state === "transcribing" || state === "extracting") && transcript && (
        <div className="mt-6 bg-black/40 border border-white/10 rounded-xl p-4 text-white/80 italic text-sm">
          "{transcript}"
        </div>
      )}

      {state === "error" && (
        <div className="mt-4 flex items-center justify-between bg-red-500/10 border border-red-500/30 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-bold">{errorMsg}</span>
          </div>
          <button 
            onClick={() => setState("idle")}
            className="text-xs text-white/60 hover:text-white underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {state === "review" && extractedData && (
        <div className="mt-6 bg-black/60 border border-white/10 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <Check className="w-5 h-5" /> Revise os Dados Extraídos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Nome da Agência</label>
              <input 
                type="text" 
                value={extractedData.agencyName || ""}
                onChange={(e) => setExtractedData({...extractedData, agencyName: e.target.value})}
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Nicho / Especialidade</label>
              <input 
                type="text" 
                value={extractedData.niche || ""}
                onChange={(e) => setExtractedData({...extractedData, niche: e.target.value})}
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
              />
            </div>
          </div>

          {extractedData.packages && extractedData.packages.length > 0 && (
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-2">Pacotes Encontrados</label>
              <div className="space-y-2">
                {extractedData.packages.map((pkg, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex flex-col md:flex-row gap-4">
                    <input 
                      type="text" 
                      value={pkg.title} 
                      onChange={(e) => {
                        const newPkgs = [...extractedData.packages];
                        newPkgs[i].title = e.target.value;
                        setExtractedData({...extractedData, packages: newPkgs});
                      }}
                      className="md:w-1/3 bg-transparent border-b border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                    <input 
                      type="text" 
                      value={pkg.price} 
                      onChange={(e) => {
                        const newPkgs = [...extractedData.packages];
                        newPkgs[i].price = e.target.value;
                        setExtractedData({...extractedData, packages: newPkgs});
                      }}
                      className="md:w-1/4 bg-transparent border-b border-white/10 text-emerald-400 text-sm focus:outline-none focus:border-amber-500"
                    />
                    <input 
                      type="text" 
                      value={pkg.description} 
                      onChange={(e) => {
                        const newPkgs = [...extractedData.packages];
                        newPkgs[i].description = e.target.value;
                        setExtractedData({...extractedData, packages: newPkgs});
                      }}
                      className="flex-1 bg-transparent border-b border-white/10 text-white/60 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
            <button 
              onClick={() => { setState("idle"); setExtractedData(null); setTranscript(""); }}
              className="text-xs text-white/50 hover:text-white"
            >
              Cancelar e Gravar Novamente
            </button>
            <button 
              onClick={handleSaveAndAdvance}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-2 rounded-lg text-sm transition-colors shadow-lg shadow-amber-500/20"
            >
              Salvar e Avançar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
