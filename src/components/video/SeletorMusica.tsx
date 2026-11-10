import { useEffect, useRef, useState } from "react";
import { Music, Pause, Play, Upload, VolumeX } from "lucide-react";
import { MUSICAS, type EscolhaMusica } from "@/lib/musica-video";

// Escolha da música de fundo do vídeo: rodízio (uma diferente a cada vídeo), uma faixa fixa, a do cliente ou nenhuma.
// Cada faixa tem um botão para ouvir antes de escolher.
export function SeletorMusica({
  escolha,
  onEscolha,
  arquivo,
  onArquivo,
  desabilitado,
}: {
  escolha: EscolhaMusica;
  onEscolha: (e: EscolhaMusica) => void;
  arquivo: File | null;
  onArquivo: (f: File | null) => void;
  desabilitado?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tocando, setTocando] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  const urlMinha = useRef<string | null>(null);

  const parar = () => {
    audioRef.current?.pause();
    setTocando(null);
  };
  useEffect(() => () => {
    audioRef.current?.pause();
    if (urlMinha.current) URL.revokeObjectURL(urlMinha.current);
  }, []);

  function ouvir(id: string, src: string) {
    if (tocando === id) return parar();
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setTocando(null);
    }
    const a = audioRef.current;
    a.src = src;
    a.currentTime = 0;
    a.play().then(() => setTocando(id)).catch(() => setTocando(null));
  }

  function receber(f?: File | null) {
    if (!f) return;
    setAviso("");
    if (!f.type.startsWith("audio/") && !/\.(mp3|m4a|aac|wav|ogg)$/i.test(f.name)) return setAviso("Escolha um arquivo de música (mp3, m4a ou wav).");
    if (f.size > 25 * 1024 * 1024) return setAviso("A música é grande demais. Use um arquivo de até 25 MB.");
    parar();
    if (urlMinha.current) URL.revokeObjectURL(urlMinha.current);
    urlMinha.current = URL.createObjectURL(f);
    onArquivo(f);
    onEscolha("minha");
  }

  const linha = (ativo: boolean) =>
    `flex min-h-12 w-full items-center gap-2 rounded-xl border px-2.5 text-left transition-colors ${ativo ? "border-[#F5F906] bg-[#F5F906]/10" : "border-white/10 bg-white/[0.03]"} ${desabilitado ? "opacity-50" : ""}`;
  const botaoOuvir = "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.08] text-white active:bg-white/[0.16]";

  return (
    <div data-musica className="flex flex-col gap-1.5">
      <div role="radiogroup" aria-label="Música de fundo" className="grid gap-1.5 sm:grid-cols-2">
        <button type="button" role="radio" aria-checked={escolha === "auto"} disabled={desabilitado} onClick={() => onEscolha("auto")} className={linha(escolha === "auto")}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.08]"><Music className="h-4 w-4 text-[#F5F906]" /></span>
          <span className="min-w-0">
            <span className="block text-[14px] font-semibold">Variar</span>
            <span className="block truncate text-[11px] text-white/50">Uma música diferente a cada vídeo</span>
          </span>
        </button>
        {MUSICAS.map((m) => (
          <div key={m.id} className={linha(escolha === m.id)}>
            <button type="button" aria-label={tocando === m.id ? `Parar ${m.nome}` : `Ouvir ${m.nome}`} onClick={() => ouvir(m.id, m.arquivo)} className={botaoOuvir}>
              {tocando === m.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button type="button" role="radio" aria-checked={escolha === m.id} disabled={desabilitado} onClick={() => onEscolha(m.id)} className="min-h-12 min-w-0 flex-1 text-left">
              <span className="block text-[14px] font-semibold">{m.nome}</span>
              <span className="block truncate text-[11px] text-white/50">{m.clima}</span>
            </button>
          </div>
        ))}
        <div className={linha(escolha === "minha")}>
          {arquivo && urlMinha.current ? (
            <button type="button" aria-label={tocando === "minha" ? "Parar a minha música" : "Ouvir a minha música"} onClick={() => ouvir("minha", urlMinha.current!)} className={botaoOuvir}>
              {tocando === "minha" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          ) : (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.08]"><Upload className="h-4 w-4" /></span>
          )}
          <label className={`min-w-0 flex-1 ${desabilitado ? "" : "cursor-pointer"}`}>
            <span className="block text-[14px] font-semibold">{arquivo ? "A minha música" : "Enviar a minha música"}</span>
            <span className="block truncate text-[11px] text-white/50">{arquivo ? arquivo.name : "mp3, m4a ou wav do seu aparelho"}</span>
            <input data-musica-arquivo type="file" accept="audio/*,.mp3,.m4a,.aac,.wav" className="hidden" disabled={desabilitado} onChange={(e) => { receber(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          {arquivo && escolha !== "minha" && (
            <button type="button" disabled={desabilitado} onClick={() => onEscolha("minha")} className="min-h-9 shrink-0 rounded-lg bg-white/[0.08] px-2.5 text-[12px] font-bold">Usar</button>
          )}
        </div>
        <button type="button" role="radio" aria-checked={escolha === "nenhuma"} disabled={desabilitado} onClick={() => { parar(); onEscolha("nenhuma"); }} className={linha(escolha === "nenhuma")}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.08]"><VolumeX className="h-4 w-4" /></span>
          <span className="block text-[14px] font-semibold">Sem música</span>
        </button>
      </div>
      {aviso && <p className="text-[12px] text-red-300">{aviso}</p>}
      {escolha === "minha" && <p className="text-[11px] leading-4 text-white/45">Use só música que você tem direito de usar. O Instagram pode silenciar vídeo com música protegida.</p>}
      <p className="text-[11px] leading-4 text-white/40">As músicas daqui são de uso livre, inclusive em anúncio. A música entra quando você gera o vídeo; a prévia fica sem som.</p>
    </div>
  );
}
