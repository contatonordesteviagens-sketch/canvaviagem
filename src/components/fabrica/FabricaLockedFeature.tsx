import { useEffect } from "react";
import { BarChart3, Check, LockKeyhole } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEntitlements } from "@/contexts/EntitlementsContext";
import { buildUpgradePath, type UpgradeFeature } from "@/lib/eliteOffer";

type FabricaLockedFeatureProps = {
  feature: UpgradeFeature;
  title: string;
  description: string;
  previewItems: string[];
};

export function FabricaLockedFeature({
  feature,
  title,
  description,
  previewItems,
}: FabricaLockedFeatureProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { track } = useEntitlements();

  useEffect(() => {
    if (feature === "crm") {
      track("crm_preview_opened", { source: "fabrica_locked_feature" });
    }
  }, [feature, track]);

  const openUpgrade = () => {
    track("upgrade_clicked", { feature, source: "fabrica_locked_feature" });
    navigate(buildUpgradePath(feature, location.pathname));
  };

  return (
    <section className="mx-auto max-w-5xl py-8">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#111113]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 sm:p-8">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10">
              <BarChart3 className="h-5 w-5 text-cyan-300" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
              Prévia do Plano Elite
            </p>
            <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">{title}</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">{description}</p>
            <div className="mt-6 space-y-2">
              {previewItems.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-white/75">
                  <Check className="h-4 w-4 shrink-0 text-emerald-300" />
                  {item}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={openUpgrade}
              className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#F5F906] px-5 text-sm font-black text-zinc-950 hover:bg-[#F5F906]/90"
            >
              <LockKeyhole className="h-4 w-4" />
              Desbloquear no Elite
            </button>
          </div>
          <div className="relative min-h-72 border-t border-white/10 bg-black/30 p-5 lg:border-l lg:border-t-0">
            <div className="grid h-full grid-cols-2 gap-3 opacity-55 blur-[2px]" aria-hidden="true">
              {["Visitas", "Cliques", "Leads", "Conversão"].map((label, index) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[10px] uppercase text-white/40">{label}</p>
                  <p className="mt-2 text-3xl font-black text-white">{[128, 46, 18, "14%"][index]}</p>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 grid place-items-center">
              <div className="rounded-full border border-white/15 bg-black/80 p-4 shadow-xl">
                <LockKeyhole className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
