import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isPixPlan, PIX_PLAN_INFO, PixCheckoutModal, pixCheckoutPath, type PixPlan } from "@/components/pix/PixCheckout";

/**
 * /pix?plano=monthly|semiannual|annual
 * Destino de quem clicou em "Pagar com Pix" sem estar logado e do e-mail de renovação.
 */
export default function PixCheckout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const raw = params.get("plano");
  const plan: PixPlan = isPixPlan(raw) ? raw : "annual";
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) navigate("/inicio", { replace: true });
  }, [open, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-[100dvh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(pixCheckoutPath(plan))}`} replace />;

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      <Helmet><title>Pagar com Pix — {PIX_PLAN_INFO[plan].label}</title></Helmet>
      <PixCheckoutModal open={open} onOpenChange={setOpen} plan={plan} />
    </div>
  );
}
