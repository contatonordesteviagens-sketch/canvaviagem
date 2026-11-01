import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2, Lock, Mail, MapPin, ShieldCheck, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { trackMetaEvent } from "@/lib/meta-pixel-sales";
import {
  generateTrialArts, ONBOARDING_DESTINO_KEY, ONBOARDING_LOGO_KEY, ONBOARDING_PATH, prepareTrialLogo, TRIAL_DESTINOS, trialPhotoUrl,
  type TrialDestino, type TrialLogo,
} from "@/lib/inicio-arte";
import { trackInicioTeste } from "@/lib/inicio-teste";
import { startWithEmail } from "@/lib/quick-start";

const TRIAL_ARTS = 3;
const MAX_LOGO_STORED = 1_500_000;

// No aparelho, e não só na aba: quem já tem conta volta pelo link do e-mail, que abre outra aba.
const remember = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch { /* sem storage */ }
};

type Stage = "destino" | "logo" | "artes";

/** Teste da primeira página: destino, logo e 3 artes prontas. O e-mail só aparece depois das artes. */
export function ArtTrial() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const [stage, setStage] = useState<Stage>("destino");
  const [destino, setDestino] = useState<TrialDestino | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [arts, setArts] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [failed, setFailed] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
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

  const generate = async (item: TrialDestino, logo: TrialLogo | null) => {
    setStage("artes");
    setArts([]);
    setFailed(false);
    setGenerating(true);
    window.requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    const done = await generateTrialArts(item, logo, (url) => {
      if (alive.current) setArts((prev) => [...prev, url]);
    }).catch(() => 0);
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

  const goToQuiz = () => {
    trackInicioTeste("email");
    navigate(ONBOARDING_PATH);
  };

  const onEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    trackMetaEvent("Lead", { content_name: "inicio_arte", content_category: "depois_das_artes" });
    const result = await startWithEmail(email, ONBOARDING_PATH);
    if (!alive.current) return;
    if (result === "existing") {
      setLinkSent(true);
      setBusy(false);
      return;
    }
    goToQuiz();
  };

  return (
    <div ref={topRef} id="teste-arte" className="w-full scroll-mt-24">
      {stage === "destino" && (
        <div className="cv-pop">
          <p className="text-[15px] font-bold">1. Escolha um destino</p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {TRIAL_DESTINOS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseDestino(item)}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#e9e3d3] text-left"
              >
                <img src={trialPhotoUrl(item.photo, 320)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-1.5 pt-6 text-[12px] font-bold leading-tight text-white sm:text-[13px]">
                  {item.nome}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-[13px]" style={{ color: "var(--cv-muted)" }}>
            Sem cadastro. Na sua conta, você cria para qualquer destino.
          </p>
        </div>
      )}

      {stage === "logo" && destino && (
        <div className="cv-pop cv-card p-5 text-center sm:p-7">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold" style={{ background: "var(--cv-sand)" }}>
            <MapPin className="h-3.5 w-3.5" /> {destino.nome}
          </span>
          <p className="mt-4 text-[22px] font-extrabold leading-tight tracking-[-0.02em]">2. Envie a logo da sua agência</p>
          <p className="mt-2 text-[15px] leading-6" style={{ color: "var(--cv-muted)" }}>
            Ela entra na arte e as cores dela viram as cores do anúncio. A logo fica só no seu aparelho.
          </p>
          <button type="button" onClick={() => fileRef.current?.click()} className="cv-btn mt-5 h-14 w-full text-[16px]">
            <Upload className="h-5 w-5" /> Enviar minha logo
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={onLogo} aria-label="Enviar logo" />
          {logoError && (
            <p role="alert" className="mt-3 text-[14px] font-semibold" style={{ color: "#b3261e" }}>
              Não consegui abrir essa imagem. Envie em PNG ou JPG.
            </p>
          )}
          <button type="button" onClick={() => void generate(destino, null)} className="mt-4 text-[15px] font-bold underline">
            Ver as artes sem logo
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
            <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
              {Array.from({ length: TRIAL_ARTS }, (_, i) => (
                <div key={i} className="aspect-square w-[78vw] max-w-[320px] shrink-0 snap-center overflow-hidden rounded-2xl bg-[#e9e3d3] sm:w-auto sm:max-w-none">
                  {arts[i] ? (
                    <img src={arts[i]} alt={`Arte ${i + 1} de ${destino?.nome ?? "seu destino"}`} className="cv-pop h-full w-full object-cover" />
                  ) : generating ? (
                    <div className="grid h-full w-full place-items-center"><Loader2 className="h-7 w-7 animate-spin" style={{ color: "var(--cv-muted)" }} /></div>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {!generating && !failed && (
            <div className="cv-card cv-pop mx-auto mt-4 max-w-xl p-5 sm:p-6">
              <p className="text-[19px] font-extrabold leading-tight tracking-[-0.02em]">Quer usar na sua agência, sem a marca d'água?</p>
              <p className="mt-2 text-[14px] leading-6" style={{ color: "var(--cv-muted)" }}>
                O preço e os textos são de exemplo. Na sua conta, você troca tudo e baixa a arte pronta para postar.
              </p>
              {linkSent ? (
                <p role="status" className="mt-4 flex gap-2 rounded-2xl p-3 text-[14px] font-semibold" style={{ background: "var(--cv-sand)" }}>
                  <Check className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Você já tem conta aqui. Por segurança, mandamos um link de acesso para {email.trim()}. Abra o link para continuar.</span>
                </p>
              ) : user ? (
                <button
                  type="button"
                  onClick={() => (subscription.subscribed ? navigate("/fabrica") : goToQuiz())}
                  className="cv-btn mt-4 h-14 w-full text-[16px]"
                >
                  Continuar <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <form onSubmit={onEmail} className="mt-4">
                  <label htmlFor="trial-email" className="text-[13px] font-bold">Seu melhor e-mail</label>
                  <div className="mt-2 flex items-center gap-3 rounded-full border bg-white px-4" style={{ borderColor: "var(--cv-line)" }}>
                    <Mail className="h-5 w-5 shrink-0" style={{ color: "var(--cv-muted)" }} />
                    <input
                      id="trial-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="voce@suaagencia.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={busy}
                      className="h-14 w-full bg-transparent text-[16px] outline-none placeholder:text-[#9b917d]"
                    />
                  </div>
                  <button type="submit" disabled={busy} className="cv-btn mt-3 h-14 w-full text-[16px]">
                    {busy ? <><Loader2 className="h-5 w-5 animate-spin" /> Um instante…</> : <>Quero usar na minha agência <ArrowRight className="h-5 w-5" /></>}
                  </button>
                  <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px]" style={{ color: "var(--cv-muted)" }}>
                    <li className="inline-flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Sem senha</li>
                    <li className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> 7 dias de garantia</li>
                  </ul>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
