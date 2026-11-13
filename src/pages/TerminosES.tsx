import { DATOS_EMPRESA_PENDIENTE, LegalES, SeccionLegal, enlaceLegal } from "@/components/cv-cream/LegalES";
import { GARANTIA_DIAS_ES, MOEDA_ES, SUPORTE_WHATSAPP_ES } from "@/lib/precos-es";

/**
 * /es/terminos: traducción fiel de src/pages/Termos.tsx (mismas cláusulas y mismos datos de contacto).
 * Lo único añadido es lo que es un hecho del producto en España: titular (pendiente), cobro en dólares
 * por Stripe y la garantía de GARANTIA_DIAS_ES. Ningún dato de empresa se inventa aquí.
 */
const TerminosES = () => (
  <LegalES title="Términos de uso" updated="noviembre de 2026">
    <SeccionLegal title="Titular del sitio">
      <p>
        Razón social: <strong>{DATOS_EMPRESA_PENDIENTE}</strong>. NIF/CNPJ: <strong>{DATOS_EMPRESA_PENDIENTE}</strong>. Domicilio:{" "}
        <strong>{DATOS_EMPRESA_PENDIENTE}</strong>. Correo de contacto:{" "}
        <a href="mailto:contato@canvaviagem.com" className={enlaceLegal}>contato@canvaviagem.com</a>.
      </p>
    </SeccionLegal>

    <SeccionLegal title="1. Aceptación de los términos">
      <p>
        Al acceder a Canva Viagem y utilizarlo, aceptas cumplir los siguientes términos y condiciones de uso y quedar vinculado por ellos. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.
      </p>
    </SeccionLegal>

    <SeccionLegal title="2. Descripción del servicio">
      <p>
        Canva Viagem es una plataforma que ofrece plantillas, textos para publicaciones y herramientas de marketing para agencias de viajes. Nuestro servicio incluye el acceso a contenidos exclusivos mediante suscripción.
      </p>
    </SeccionLegal>

    <SeccionLegal title="3. Uso de los contenidos">
      <p>
        Las plantillas y los contenidos disponibles son para uso comercial de los suscriptores en sus actividades de marketing. Está prohibida la reventa, la redistribución o el uso compartido de los materiales con terceros no autorizados.
      </p>
    </SeccionLegal>

    <SeccionLegal title="4. Suscripciones y pagos">
      <p>
        Las suscripciones se cobran según el plan elegido. Las renovaciones son automáticas hasta que se solicite la cancelación.
      </p>
      <p>
        El cobro se hace en dólares estadounidenses ({MOEDA_ES}), con tarjeta, a través de Stripe. Si tu tarjeta está en otra moneda, tu banco puede aplicar su tipo de cambio y sus comisiones.
      </p>
      <p>
        <strong>Garantía de {GARANTIA_DIAS_ES} días:</strong> en la primera compra, puedes pedir el reembolso íntegro en un plazo de {GARANTIA_DIAS_ES} días naturales, por{" "}
        <a href={SUPORTE_WHATSAPP_ES} target="_blank" rel="noopener noreferrer" className={enlaceLegal}>WhatsApp (+55 85 98641-1294)</a>, indicando el correo de la compra. Después del reembolso, el acceso a la plataforma se cierra.
      </p>
    </SeccionLegal>

    <SeccionLegal title="5. Propiedad intelectual">
      <p>
        Todo el contenido disponible en la plataforma, incluidos diseños, textos y materiales gráficos, está protegido por derechos de autor y pertenece a Canva Viagem o a sus licenciantes.
      </p>
    </SeccionLegal>

    <SeccionLegal title="6. Contacto">
      <p>
        Para dudas sobre estos términos, escríbenos a:{" "}
        <a href="mailto:contato@canvaviagem.com" className={enlaceLegal}>contato@canvaviagem.com</a>
      </p>
      <p>
        Consulta también nuestra <a href="/es/privacidad" className={enlaceLegal}>política de privacidad</a>.
      </p>
    </SeccionLegal>
  </LegalES>
);

export default TerminosES;
