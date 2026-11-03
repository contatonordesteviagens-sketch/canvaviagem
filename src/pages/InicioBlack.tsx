import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isBlackFridayOpen } from "@/components/checkout/checkout-plans";
import { markBlackFunnel } from "@/lib/black-funnel";
import InicioCreme from "./InicioCreme";

/** /black: a página da /inicio com fundo preto. Depois do prazo, volta para a /inicio mantendo a origem do link. */
export default function InicioBlack() {
  const { search } = useLocation();
  const open = isBlackFridayOpen();
  useState(() => markBlackFunnel(open));
  if (!open) return <Navigate to={`/inicio${search}`} replace />;
  return <InicioCreme />;
}
