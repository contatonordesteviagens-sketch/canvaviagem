import { memo, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Crown, Play, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
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
          "Seu plano atual ja libera o Canva Viagem. O Elite adiciona a Fabrica de Anuncios, paginas de pacote e criacao guiada para vender com mais clareza.",
        primary: "Ver planos Elite",
        secondary: "Continuar no Start",
      };
    }

    return {
      eyebrow: "Acesso Elite",
      title: "Esse recurso faz parte do Plano Elite",
      description:
        "Entre pelo plano mensal ou anual e acesse Canva Viagem, Fabrica de Anuncios, criador de sites, CRM e ferramentas de IA para turismo.",
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
      <DialogContent className="max-h-[92vh] w-[calc(100vw-24px)] max-w-3xl overflow-y-auto border border-cyan-400/20 bg-[#040912] p-0 text-white shadow-2xl shadow-cyan-950/40 sm:rounded-2xl">
        <div className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              background:
                "radial-gradient(circle at 18% 12%, rgba(34,211,238,0.22), transparent 34%), radial-gradient(circle at 84% 18%, rgba(249,115,22,0.18), transparent 30%)",
            }}
          />

          <div className="relative grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-5 sm:p-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5">
                <Crown className="h-4 w-4 text-cyan-300" />
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">{copy.eyebrow}</span>
              </div>

              <DialogTitle className="text-2xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                {copy.title}
              </DialogTitle>
              <DialogDescription className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                {copy.description}
              </DialogDescription>

              <div className="mt-5 grid gap-2 text-sm text-slate-200">
                {[
                  "Fabrica de anuncios com IA",
                  "Criador de paginas de pacote",
                  "CRM e materiais para WhatsApp",
                  "Acesso imediato com 7 dias de garantia",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-none text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-orange-200">Elite anual</p>
                  <div className="mt-1 flex items-end gap-1">
                    <strong className="text-2xl font-black text-white">{ELITE_OFFER.annualMonthlyEquivalent}</strong>
                    <span className="pb-1 text-xs font-bold text-slate-400">/mes equivalente</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-orange-200">{ELITE_OFFER.annualPrice} cobrados anualmente</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-300">Elite mensal</p>
                  <div className="mt-1 flex items-end gap-1">
                    <strong className="text-2xl font-black text-white">{ELITE_OFFER.monthlyPrice}</strong>
                    <span className="pb-1 text-xs font-bold text-slate-400">/mes</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Sem fidelidade, cancele quando quiser.</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={handleRedirect}
                  className="h-12 flex-1 rounded-xl bg-cyan-300 font-black uppercase tracking-wide text-slate-950 hover:bg-cyan-200"
                >
                  {copy.primary}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="h-12 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  {copy.secondary}
                </Button>
              </div>
            </div>

            <div className="border-t border-white/10 bg-slate-950/60 p-4 lg:border-l lg:border-t-0">
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
                      Mostramos o produto antes da compra para o upgrade ser uma decisao clara, nao impulso.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[260px] flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-400/15 text-orange-200">
                      <Wand2 className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-black text-white">O upgrade que libera a area de criacao.</h4>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      Se voce ja usa o Start, o proximo passo natural e liberar a Fabrica para criar anuncios, paginas e campanhas sem sair do painel.
                    </p>
                  </div>
                  <div className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-xs text-emerald-100">
                    <ShieldCheck className="mb-2 h-4 w-4" />
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
