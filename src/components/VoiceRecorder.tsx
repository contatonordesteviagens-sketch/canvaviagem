import { useState, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Props = { onTranscriptComplete: (text: string) => void };

export function VoiceRecorder({ onTranscriptComplete }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [livePartial, setLivePartial] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm", "audio/mp4"].find(t => MediaRecorder.isTypeSupported(t)) || "";
      const recorder = new MediaRecorder(stream, { mimeType: mimeType || undefined });
      chunksRef.current = [];

      recorder.ondataavailable = e => e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        if (blob.size < 1024) return alert("Gravação muito curta, tente de novo.");
        await transcribe(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Erro ao acessar microfone", err);
      alert("Não foi possível acessar o microfone.");
    }
  }

  function stop() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setIsTranscribing(true);
  }

  async function transcribe(blob: Blob) {
    try {
      const ext = blob.type.includes("webm") ? "webm" : "mp4";
      const file = new File([blob], `audio.${ext}`, { type: blob.type });

      // Como o Supabase Functions espera FormData para binários ou um Base64, 
      // usaremos Base64 para simplificar a chamada da Edge Function,
      // ou passamos via multipart/form-data.
      const formData = new FormData();
      formData.append("file", file);

      // Usando supabase.functions.invoke
      // No Supabase Edge Functions, precisamos usar uma requisição POST padrão
      // se quisermos suportar Streaming (SSE), ou lidar com JWT auth via URL diretamente.
      const { data: session } = await supabase.auth.getSession();
      
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fabrica-transcribe-audio`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      );

      if (!res.body) return;

      const contentType = res.headers.get("Content-Type") || "";
      let fullText = "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        fullText = data.text || "";
      } else {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            try {
              const evt = JSON.parse(line.slice(6));
              if (evt.type === "transcript.text.delta") {
                fullText += evt.delta;
                setLivePartial(fullText);
              } else if (evt.type === "transcript.text.done") {
                fullText = evt.text;
              }
            } catch {}
          }
        }
      }

      setIsTranscribing(false);
      setLivePartial("");
      onTranscriptComplete(fullText);
    } catch (err) {
      console.error("Erro na transcrição", err);
      alert("Erro na transcrição. Verifique o console.");
      setIsTranscribing(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
      <Button
        size="lg"
        variant={isRecording ? "destructive" : "default"}
        onClick={isRecording ? stop : start}
        disabled={isTranscribing}
      >
        {isTranscribing ? <Loader2 className="animate-spin" /> :
         isRecording ? <Square /> : <Mic />}
        <span className="ml-2">
          {isTranscribing ? "Transcrevendo..." :
           isRecording ? "Parar" : "Falar sobre minha agência"}
        </span>
      </Button>
      {livePartial && <p className="text-sm italic">{livePartial}</p>}
    </div>
  );
}
