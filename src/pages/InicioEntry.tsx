import { lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { SuspendedSiteNotice } from "@/components/SuspendedSiteNotice";

const Inicio2 = lazy(() => import("./Inicio2"));
const InicioCreme = lazy(() => import("./InicioCreme"));

// Paywalls internos (buildUpgradePath), retomada de checkout e ofertas contextuais
// continuam no Inicio2, que tem essa lógica. O tráfego frio cai na landing nova.
const LEGACY_PARAMS = ["upgrade", "checkout", "returnTo", "offer"];

export default function InicioEntry() {
  const [searchParams] = useSearchParams();
  const legacy = LEGACY_PARAMS.some((key) => searchParams.has(key));
  return (
    <>
      <SuspendedSiteNotice />
      {legacy ? <Inicio2 /> : <InicioCreme />}
    </>
  );
}
