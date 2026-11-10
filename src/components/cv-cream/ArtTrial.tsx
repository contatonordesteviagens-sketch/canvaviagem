import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronRight, Loader2, MapPin, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  generateTrialArts, ONBOARDING_DESTINO_KEY, ONBOARDING_LOGO_KEY, ONBOARDING_PATH, prepareTrialLogo, readTrialResult, resolveTrialDestino, saveTrialResult,
  TRIAL_DESTINOS, type TrialDestino, type TrialLogo,
} from "@/lib/inicio-arte";
import { trackInicioTeste } from "@/lib/inicio-teste";
import { delay } from "@/components/cv-cream/shared";

const TRIAL_ARTS = 3;
const MAX_LOGO_STORED = 1_500_000;
const QUICK_IDS = ["cancun", "gramado", "rio", "noronha", "maragogi"];
const QUICK_DESTINOS = QUICK_IDS.map((id) => TRIAL_DESTINOS.find((item) => item.id === id)).filter(Boolean) as TrialDestino[];

// No aparelho, e não só na aba: quem já tem conta volta pelo link do e-mail, que abre outra aba.
const remember = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch { /* sem storage */ }
};

type Stage = "destino" | "logo" | "artes";

/** Destino, logo e 3 artes prontas. Depois das artes, a pessoa deixa o e-mail como quem entra na ferramenta e segue para o quiz. */
export function ArtTrial() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const [previous] = useState(readTrialResult);
  const [stage, setStage] = useState<Stage>(previous ? "artes" : "destino");
  const [typed, setTyped] = useState("");
  const [destino, setDestino] = useState<TrialDestino | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [arts, setArts] = useState<string[]>(previous?.arts ?? []);
  const [generating, setGenerating] = useState(false);
  const [failed, setFailed] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const chooseDestino = (item: TrialDestino) => {
    setDestino(item);
    remember(ONBOARDING_DESTINO_KEY, item.nome);
    try { sessionStorage.setItem(ONBOARDING_DESTINO_KEY, item.nome); } catch { /* sem storage */ }
    trackInicioTeste("destino");
    setStage("logo");
    // Deixa o motor das artes pronto enquanto a pessoa escolhe a logo.
    void import("@/lib/fabrica-compose-art");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (typed.trim()) chooseDestino(resolveTrialDestino(typed));
  };

  const generate = async (item: TrialDestino, logo: TrialLogo | null) => {
    setStage("artes");
    setArts([]);
    setFailed(false);
    setGenerating(true);
    window.requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    const made: string[] = [];
    const done = await generateTrialArts(item, logo, (url) => {
      made.push(url);
      if (alive.current) setArts((prev) => [...prev, url]);
    }).catch(() => 0);
    if (done) saveTrialResult({ destino: item.nome, arts: made });
    if (!alive.current) return;
    setGenerating(false);
    if (done) trackInicioTeste("artes");
    else setFailed(true);
  };

  const onLogo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !destino) return;
    setLogoError(false);
    try {
      const logo = await prepareTrialLogo(file);
      if (logo.dataUrl.length < MAX_LOGO_STORED) remember(ONBOARDING_LOGO_KEY, logo.dataUrl);
      trackInicioTeste("logo");
      void generate(destino, logo);
    } catch {
      setLogoError(true);
    }
  };

  const goOn = () => {
    trackInicioTeste("botao", { valor: "artes" });
    if (user && subscription.subscribed) { navigate("/fabrica"); return; }
    // O e-mail é pedido no fim do quiz, depois do diagnóstico.
    navigate(ONBOARDING_PATH);
  };

  const ready = !generating && !failed && arts.length > 0;

  return (
    <div ref={topRef} id="teste-arte" className="w-full scroll-mt-24">
      {stage === "destino" && (
        <div className="mx-auto max-w-xl">
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-2 rounded-[28px] border bg-white p-2 shadow-[0_18px_40px_-24px_rgba(32,28,19,.35)] sm:flex-row sm:items-center sm:rounded-full" style={{ borderColor: "var(--cv-line)" }}>
              <label className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 sm:px-4">
                <MapPin className="h-5 w-5 shrink-0" style={{ color: "var(--cv-muted)" }} />
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="Digite: Cancún, Gramado, Rio de Janeiro"
                  className="w-full min-w-0 bg-transparent text-[16px] outline-none placeholder:text-[12.5px] placeholder:text-[#9b917d] sm:placeholder:text-[14px]"
                  aria-label="Destino do pacote"
                />
              </label>
              <button type="submit" className="cv-btn h-12 px-7 text-[15px] sm:h-[52px]">
                Criar agora <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {QUICK_DESTINOS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseDestino(item)}
                className={`relative rounded-full border bg-white px-2.5 py-1 text-[12px] font-semibold transition-colors hover:bg-[#f3ead2] sm:px-3 sm:py-1.5 sm:text-[13px] ${i < 3 ? "cv-chip" : ""}`}
                style={{ borderColor: "var(--cv-line)", ...(i < 3 ? delay(i * 1500) : {}) }}
              >
                {item.nome}
                {/* Toque animado nos três primeiros, um de cada vez: mostra que dá para clicar. */}
                {i < 3 && <span aria-hidden className="cv-chip-dot pointer-events-none absolute left-1/2 top-1/2 -ml-3 -mt-3 h-6 w-6 rounded-full" style={delay(i * 1500)} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === "logo" && destino && (
        <div className="cv-pop cv-card mx-auto max-w-xl p-5 text-center sm:p-7">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold" style={{ background: "var(--cv-sand)" }}>
            <MapPin className="h-3.5 w-3.5" /> {destino.nome}
          </span>
          <button type="button" onClick={() => fileRef.current?.click()} className="cv-btn mt-4 h-14 w-full text-[16px]">
            <Upload className="h-5 w-5" /> Adicione sua logo
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={onLogo} aria-label="Adicionar logo" />
          {logoError && (
            <p role="alert" className="mt-3 text-[14px] font-semibold" style={{ color: "#b3261e" }}>
              Não consegui abrir essa imagem. Envie em PNG ou JPG.
            </p>
          )}
          <button type="button" onClick={() => void generate(destino, null)} className="mt-4 text-[15px] font-bold underline">
            Gerar sem logo
          </button>
          <div className="mt-4">
            <button type="button" onClick={() => setStage("destino")} className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--cv-muted)" }}>
              <ArrowLeft className="h-4 w-4" /> Trocar o destino
            </button>
          </div>
        </div>
      )}

      {stage === "artes" && (
        <div className="cv-pop">
          <p className="text-center text-[22px] font-extrabold leading-tight tracking-[-0.02em]">
            {generating ? "Montando suas artes…" : failed ? "Não consegui montar as artes agora" : "Suas artes ficaram prontas"}
          </p>
          {failed ? (
            <button type="button" onClick={() => destino && void generate(destino, null)} className="cv-btn mx-auto mt-4 h-12 px-6 text-[15px]">
              Tentar de novo
            </button>
          ) : (
            <div className="relative mt-4">
              <div
                onContextMenu={(e) => e.preventDefault()}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 24);
                }}
                className="no-scrollbar -mx-4 flex select-none snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0"
                style={{ WebkitTouchCallout: "none" }}
              >
                {Array.from({ length: TRIAL_ARTS }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => arts[i] && goOn()}
                    aria-label={`Arte ${i + 1}: usar na minha agência`}
                    className={`aspect-square w-[86vw] shrink-0 snap-center overflow-hidden rounded-2xl bg-[#e9e3d3] sm:w-auto ${ready ? "cv-peek" : ""}`}
                  >
                    {arts[i] ? (
                      <img src={arts[i]} alt="" draggable={false} className="cv-pop pointer-events-none h-full w-full object-cover" />
                    ) : generating ? (
                      <div className="grid h-full w-full place-items-center"><Loader2 className="h-7 w-7 animate-spin" style={{ color: "var(--cv-muted)" }} /></div>
                    ) : null}
                  </button>
                ))}
              </div>
              {arts.length > 1 && !atEnd && (
                <span aria-hidden className="cv-swipe pointer-events-none absolute right-0 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg sm:hidden">
                  <ChevronRight className="h-6 w-6" style={{ color: "var(--cv-primary-ink)" }} />
                </span>
              )}
            </div>
          )}

          {ready && (
            <div className="cv-pop mx-auto mt-5 max-w-xl">
              <button type="button" onClick={goOn} className="cv-btn h-14 w-full text-[16px]">
                Quero usar na minha agência <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
