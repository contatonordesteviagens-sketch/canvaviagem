import { memo, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Crown, Play, ShieldCheck, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ELITE_OFFER, shouldShowStartUpgradeVideo } from "@/lib/eliteOffer";
import { hasStartAccess } from "@/lib/planAccess";

const PremiumGateModalComponent = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const { subscription } = useAuth();
  const [videoWithSound, setVideoWithSound] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const isStartSubscriber = hasStartAccess(subscription);

  useEffect(() => {
    if (!isOpen) {
      setVideoWithSound(false);
      return;
    }
    setShowVideo(isStartSubscriber && shouldShowStartUpgradeVideo());
  }, [isOpen, isStartSubscriber]);

  const copy = useMemo(() => {
    if (isStartSubscriber) {
      return {
        eyebrow: "Upgrade Start para Elite",
        title: "Libere a Fabrica e transforme pacote em campanha",
        description:
          "Seu Start continua ativo para o Canva Viagem. O Elite libera a Fabrica completa: anuncios, paginas, CRM, IA e materiais de venda.",
        primary: "Ver planos Elite",
        secondary: "Continuar no Start",
      };
    }

    return {
      eyebrow: "Acesso Elite",
      title: "Esse recurso e exclusivo do Plano Elite",
      description:
        "Para usar este recurso, escolha o Elite mensal ou anual. Ele libera Canva Viagem completo, Fabrica, criador de sites, CRM e ferramentas de IA.",
      primary: "Conhecer o Plano Elite",
      secondary: "Agora nao",
    };
  }, [isStartSubscriber]);

  const handleRedirect = () => {
    onClose();
    navigate("/inicio2");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-24px)] max-w-[880px] overflow-y-auto border border-cyan-300/20 bg-[#050914] p-0 text-white shadow-2xl shadow-cyan-950/50 sm:rounded-[24px] [&>button]:right-4 [&>button]:top-4 [&>button]:z-20 [&>button]:rounded-full [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/10 [&>button]:p-2 [&>button]:text-white/70 [&>button]:opacity-100 hover:[&>button]:bg-white/15 hover:[&>button]:text-white">
        <div className="relative overflow-hidden rounded-[inherit]">
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                "radial-gradient(circle at 18% 10%, rgba(34,211,238,0.24), transparent 34%), radial-gradient(circle at 92% 0%, rgba(249,115,22,0.22), transparent 28%), linear-gradient(135deg, rgba(6,182,212,0.08), transparent 46%)",
            }}
          />

          <div className="relative grid lg:grid-cols-[1fr_330px]">
            <div className="p-5 sm:p-7 lg:p-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3.5 py-1.5 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
                <Crown className="h-4 w-4 text-cyan-300" />
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">{copy.eyebrow}</span>
              </div>

              <DialogTitle className="max-w-[520px] text-3xl font-black leading-[1.03] tracking-tight text-white sm:text-4xl">
                {copy.title}
              </DialogTitle>
              <DialogDescription className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                {copy.description}
              </DialogDescription>

              <div className="mt-6 grid gap-2.5 text-sm font-semibold text-slate-100">
                {[
                  "Canva Viagem completo",
                  "Fabrica de anuncios, imagens e campanhas",
                  "Criador de sites e paginas de pacote",
                  "CRM, IA e materiais para WhatsApp",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-none text-emerald-300 drop-shadow-[0_0_10px_rgba(110,231,183,0.35)]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-[1.08fr_0.92fr]">
                <div className="rounded-2xl border border-orange-300/30 bg-orange-300/[0.08] p-4 shadow-[0_16px_42px_rgba(249,115,22,0.12)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-wide text-orange-100">Elite anual</p>
                    <span className="rounded-full bg-orange-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-950">
                      Melhor valor
                    </span>
                  </div>
                  <div className="mt-3">
                    <strong className="block text-[34px] font-black leading-none text-white">{ELITE_OFFER.annualPrice}</strong>
                    <span className="mt-1 block text-sm font-black text-orange-100">por 12 meses de acesso</span>
                  </div>
                  <p className="mt-3 rounded-xl border border-orange-200/15 bg-orange-950/25 px-3 py-2 text-xs font-semibold leading-relaxed text-orange-50">
                    Equivale a {ELITE_OFFER.annualMonthlyEquivalent}/mes. Economia de {ELITE_OFFER.annualSavings} comparado ao mensal por 1 ano.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-300">Elite mensal</p>
                  <div className="mt-3">
                    <strong className="block text-[34px] font-black leading-none text-white">{ELITE_OFFER.monthlyPrice}</strong>
                    <span className="mt-1 block text-sm font-black text-slate-300">por mes</span>
                  </div>
                  <p className="mt-3 rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2 text-xs leading-relaxed text-slate-300">
                    Recorrente, sem fidelidade. Cancele quando quiser.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={handleRedirect}
                  className="h-[52px] flex-1 rounded-2xl bg-cyan-300 px-5 font-black uppercase tracking-wide text-slate-950 shadow-[0_14px_35px_rgba(34,211,238,0.28)] transition hover:bg-cyan-200"
                >
                  {copy.primary}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="h-[52px] rounded-2xl px-5 font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  {copy.secondary}
                </Button>
              </div>
            </div>

            <div className="border-t border-white/10 bg-slate-950/45 p-4 sm:p-5 lg:border-l lg:border-t-0">
              {showVideo ? (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-xl">
                  <div className="relative aspect-video">
                    {videoWithSound ? (
                      <iframe
                        className="absolute inset-0 h-full w-full border-0"
                        src={`https://www.youtube.com/embed/${ELITE_OFFER.videoId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0`}
                        title="Demonstração da Fabrica de Anuncios Canva Viagem"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <iframe
                          className="pointer-events-none absolute inset-0 h-full w-full border-0"
                          src={`https://www.youtube.com/embed/${ELITE_OFFER.videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ELITE_OFFER.videoId}&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
                          title="Demonstração da Fabrica de Anuncios Canva Viagem"
                          allow="autoplay; encrypted-media; picture-in-picture"
                        />
                        <button
                          type="button"
                          onClick={() => setVideoWithSound(true)}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/35 transition-colors hover:bg-slate-950/20"
                        >
                          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-xs font-black uppercase tracking-wide text-slate-950 shadow-lg">
                            <Play className="h-4 w-4 fill-current" />
                            Assistir com som
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-bold text-white">Veja a Fabrica criando uma oferta por dentro.</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      Mostramos o produto antes da compra para o upgrade ser uma decisao clara.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[320px] flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-inner shadow-white/5">
                  <div>
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-300/15 text-orange-100 shadow-[0_0_32px_rgba(249,115,22,0.18)]">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <h4 className="text-2xl font-black leading-tight text-white">Entregaveis do Elite</h4>
                    <div className="mt-5 grid gap-3">
                      {[
                        ["Fabrica", "geracao de imagens, anuncios e campanhas"],
                        ["Sites", "paginas de pacote e ofertas prontas"],
                        ["Canva Viagem", "biblioteca, artes, videos, IA e CRM"],
                      ].map(([title, body]) => (
                        <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                          <p className="text-xs font-black uppercase tracking-wide text-cyan-200">{title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-slate-300">{body}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-xs font-semibold leading-relaxed text-emerald-50">
                    <ShieldCheck className="mb-2 h-4 w-4 text-emerald-200" />
                    7 dias de garantia. Se nao fizer sentido para sua rotina, voce pode cancelar dentro do prazo.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const PremiumGateModal = memo(PremiumGateModalComponent);
