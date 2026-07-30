import { useEffect } from "react";
import { Image, Layers3, Sparkles, UserPlus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEntitlements } from "@/contexts/EntitlementsContext";

export function FabricaAccessSummary() {
  const { tier, limits, remaining, loading, needsReview, track } = useEntitlements();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !limits || !remaining || typeof window === "undefined") return;
    const key = `cv:free-quota-seen:${tier}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    track("free_quota_seen", {
      ad_remaining: remaining.ad_export,
      carousel_remaining: remaining.carousel_export,
    });
  }, [limits, loading, remaining, tier, track]);

  if (loading || !limits || !remaining) return null;

  const isGuest = tier === "guest";
  const tierLabel = tier === "start_legacy"
    ? "Plano Start"
    : isGuest
      ? "Modo visitante"
      : "Acesso gratuito";

  return (
    <div className="mb-4 flex flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-amber-300" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-white">{tierLabel}</p>
          <p className="truncate text-[10px] text-white/45">
            {isGuest
              ? "Monte seu projeto agora; a conta gratuita preserva o trabalho na nuvem."
              : "Monte tudo e use seus créditos somente ao baixar."}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-white/70">
          <Image className="h-3 w-3 text-cyan-300" />
          {isGuest ? `${limits.ad_export} anúncios após criar conta` : `${remaining.ad_export} de ${limits.ad_export} anúncios`}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-white/70">
          <Layers3 className="h-3 w-3 text-emerald-300" />
          {isGuest ? `${limits.carousel_export} carrosséis após criar conta` : `${remaining.carousel_export} de ${limits.carousel_export} carrosséis`}
        </span>
        {isGuest && (
          <button
            type="button"
            onClick={() => {
              const returnTo = `${location.pathname}${location.search}`;
              navigate(`/auth?redirect=${encodeURIComponent(returnTo)}`);
            }}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-[#F5F906] px-2.5 py-1 text-[10px] font-black text-zinc-950 hover:bg-[#F5F906]/90"
          >
            <UserPlus className="h-3 w-3" />
            Criar conta grátis
          </button>
        )}
        {needsReview && (
          <span className="rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-amber-200">
            Plano em conferência
          </span>
        )}
      </div>
    </div>
  );
}
