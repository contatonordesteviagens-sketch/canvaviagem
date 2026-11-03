import { lazy } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { isBlackFridayOpen } from "@/components/checkout/checkout-plans";
import { SuspendedSiteNotice } from "@/components/SuspendedSiteNotice";

const Inicio2 = lazy(() => import("./Inicio2"));
const InicioCreme = lazy(() => import("./InicioCreme"));

// Paywalls internos (buildUpgradePath), retomada de checkout e ofertas contextuais
// continuam no Inicio2, que tem essa lógica. O tráfego frio cai na landing nova.
const LEGACY_PARAMS = ["upgrade", "checkout", "returnTo", "offer"];

export default function InicioEntry() {
  const [searchParams] = useSearchParams();
  const { search } = useLocation();
  const legacy = LEGACY_PARAMS.some((key) => searchParams.has(key));
  // Até 30/11 só vendemos a Black: o tráfego da /inicio (anúncios inclusive) cai na /black, com a mesma origem.
  if (!legacy && isBlackFridayOpen()) return <Navigate to={`/black${search}`} replace />;
  return (
    <>
      <SuspendedSiteNotice />
      {legacy ? <Inicio2 /> : <InicioCreme />}
    </>
  );
}
