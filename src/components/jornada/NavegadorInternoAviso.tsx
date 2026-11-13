import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { ehIphone, navegadorInterno } from "@/lib/navegador-interno";
import { tradutor, type LangVideo } from "@/lib/video-textos";

/**
 * Aviso para quem abriu o link de acesso dentro de outro app (Instagram, Facebook, visualizador
 * do e-mail no iPhone). Ali o login não fica salvo no navegador de verdade: a pessoa entra,
 * fecha, e depois "não consegue acessar pelo celular".
 */
export function NavegadorInternoAviso({ className = "", lang = "pt" }: { className?: string; lang?: LangVideo }) {
  const tr = tradutor(lang);
  const [{ interno, nome }] = useState(() => navegadorInterno());
  const [copiado, setCopiado] = useState(false);
  if (!interno) return null;

  const link = window.location.href;
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      window.prompt(tr("Copie o link:"), link);
    }
  };
  const abrirFora = () => {
    // Android: tenta abrir no Chrome. iPhone: o próprio sistema abre no Safari quando o app permite.
    if (/Android/i.test(navigator.userAgent)) {
      const semProtocolo = link.replace(/^https?:\/\//, "");
      window.location.href = `intent://${semProtocolo}#Intent;scheme=https;package=com.android.chrome;end`;
    } else {
      window.open(link, "_blank");
    }
  };

  return (
    <div className={`rounded-2xl border border-amber-400/40 bg-amber-50 p-4 text-left text-amber-950 ${className}`}>
      <p className="text-sm font-extrabold">{tr("Você abriu pelo {nome}. Para continuar logado, abra no {navegador}.", { nome, navegador: ehIphone() ? "Safari" : "Chrome" })}</p>
      <p className="mt-1 text-xs text-amber-900/80">
        {tr("Se ficar aqui, o acesso some quando você fechar. ")}{ehIphone() ? tr("Toque no ícone de compartilhar (quadrado com seta) e escolha \"Abrir no Safari\"") : tr("Toque nos três pontinhos e escolha \"Abrir no navegador\" ou \"Abrir no Chrome\"")}{tr(", ou use os botões abaixo.")}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={abrirFora} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3 text-sm font-bold text-black">
          <ExternalLink className="h-4 w-4" />{tr(" Abrir no navegador")}
        </button>
        <button type="button" onClick={copiar} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-amber-500 px-3 text-sm font-bold">
          {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copiado ? tr("Copiado") : tr("Copiar link")}
        </button>
      </div>
    </div>
  );
}
