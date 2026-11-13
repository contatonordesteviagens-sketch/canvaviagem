import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { ehFluxoES } from "@/lib/idioma-es";

/**
 * Título e descrição em espanhol para as telas compartilhadas quando estão no fluxo espanhol:
 * /login, /auth, /auth/verify e /es/obrigado. No Brasil não renderiza nada (título atual intacto).
 * As demais rotas /es definem o próprio título (InicioES, SalesPageES, LegalES, FabricaES, Onboarding).
 * LIMITE: isto é feito no navegador (Helmet). A prévia de link (og:*) lida do HTML estático segue em português.
 */
export function TituloES() {
  const { pathname, search } = useLocation();
  const ehObrigado = /^\/es\/obrigado(?:\/|$)/.test(pathname);
  const ehAcceso = /^\/(?:login|auth)(?:\/|$)/.test(pathname);
  if (!ehObrigado && !(ehAcceso && ehFluxoES(search))) return null;

  const title = ehObrigado
    ? "Compra confirmada | Canva Viagem"
    : "Accede a tu cuenta | Canva Viagem";
  const description = ehObrigado
    ? "Tu compra está confirmada. Recibe el enlace de acceso por correo y entra en Canva Viagem."
    : "Entra en Canva Viagem con el enlace que te enviamos por correo. Para agencias de viajes.";
  return (
    <Helmet>
      <html lang="es" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
    </Helmet>
  );
}
