import { DATOS_EMPRESA_PENDIENTE, LegalES, SeccionLegal, enlaceLegal } from "@/components/cv-cream/LegalES";
import { MOEDA_ES, SUPORTE_EMAIL_ES } from "@/lib/precos-es";

/**
 * /es/privacidad: traducción fiel de src/pages/Privacidade.tsx (mismas cláusulas y mismo contacto).
 * Añadido solo lo que es un hecho: responsable (pendiente), pago por Stripe en dólares y la sección
 * "Cookies y píxeles" con lo que el sitio carga de verdad (index.html y src/lib/meta-pixel-sales.ts).
 */
const PrivacidadES = () => (
  <LegalES title="Política de privacidad" updated="noviembre de 2026" description="Cómo Canva Viagem trata tus datos, qué cookies y píxeles usa, y que solo se cargan si pulsas «Aceptar».">
    <SeccionLegal title="Responsable del tratamiento">
      <p>
        Razón social: <strong>{DATOS_EMPRESA_PENDIENTE}</strong>. NIF/CNPJ: <strong>{DATOS_EMPRESA_PENDIENTE}</strong>. Domicilio:{" "}
        <strong>{DATOS_EMPRESA_PENDIENTE}</strong>. Correo de contacto:{" "}
        <a href={`mailto:${SUPORTE_EMAIL_ES}`} className={enlaceLegal}>{SUPORTE_EMAIL_ES}</a>.
      </p>
    </SeccionLegal>

    <SeccionLegal title="1. Información que recogemos">
      <p>
        Recogemos la información que nos facilitas directamente, como nombre, correo electrónico y datos de pago al crear una cuenta o suscribirte a nuestros servicios. También recogemos información de forma automática, como datos de navegación y de uso de la plataforma.
      </p>
    </SeccionLegal>

    <SeccionLegal title="2. Uso de la información">
      <p>
        Utilizamos tu información para: prestar y mejorar nuestros servicios, procesar pagos, enviarte comunicaciones sobre tu cuenta y novedades, y personalizar tu experiencia en la plataforma.
      </p>
    </SeccionLegal>

    <SeccionLegal title="3. Con quién compartimos los datos">
      <p>
        No vendemos tu información personal. Compartimos datos únicamente con los proveedores de servicios necesarios para operar nuestra plataforma (como los procesadores de pago) y cuando lo exige la ley.
      </p>
      <p>
        El pago se procesa a través de Stripe, en dólares estadounidenses ({MOEDA_ES}). Los datos de tu tarjeta los introduces en la página de pago de Stripe.
      </p>
    </SeccionLegal>

    <SeccionLegal title="4. Seguridad de los datos">
      <p>
        Aplicamos medidas de seguridad técnicas y organizativas para proteger tu información contra el acceso no autorizado, la alteración, la divulgación o la destrucción.
      </p>
    </SeccionLegal>

    <SeccionLegal id="cookies" title="5. Cookies y píxeles">
      <p>
        Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el tráfico del sitio y personalizar el contenido. Puedes gestionar tus preferencias de cookies desde el aviso de este sitio y desde la configuración de tu navegador.
      </p>
      <p>En concreto, este sitio utiliza:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Píxeles de Meta (Facebook e Instagram):</strong> registran visitas y acciones en el sitio (página vista, correo enviado, inicio del pago y compra) para medir nuestra publicidad y mostrarla a públicos relacionados.
        </li>
        <li>
          <strong>Etiqueta de Google Ads:</strong> mide las conversiones de nuestros anuncios en Google.
        </li>
        <li>
          <strong>Analítica propia:</strong> si aceptas, guardamos en nuestra base de datos eventos de uso (páginas vistas, pasos del cuestionario, inicio de sesión y elección de plan) con un identificador de sesión.
        </li>
        <li>
          <strong>Almacenamiento del navegador:</strong> guardamos en tu dispositivo tu sesión, tu idioma, el correo que escribes en el cuestionario y tu elección sobre las cookies.
        </li>
      </ul>
      <p>
        Consentimiento: en las páginas en español (rutas que empiezan por /es y el inicio de sesión en español) no se carga ningún píxel de Meta ni la etiqueta de Google Ads, ni se envía ningún evento de publicidad, hasta que pulses «Aceptar» en el aviso de cookies. Si pulsas «Rechazar», o no eliges nada, no se carga nada de eso. Si aceptas, se cargan en ese momento, sin recargar la página. Tampoco guardamos en nuestra base de datos eventos de navegación ni la procedencia de tu visita (UTM, página de origen) mientras no aceptes; lo único que guardamos en tu navegador es tu elección (clave «cv-es-cookies»), tu idioma y los datos técnicos necesarios para que el sitio funcione, como tu sesión si inicias sesión. Si aceptas, también se activan las acciones de tu compra y de tu registro que se envían a Meta. Puedes cambiar de opinión borrando los datos del sitio en tu navegador, y el aviso volverá a aparecer.
      </p>
    </SeccionLegal>

    <SeccionLegal title="6. Tus derechos">
      <p>
        Tienes derecho a acceder a tu información personal, a corregirla o a eliminarla. Para ejercer estos derechos o hacer preguntas sobre nuestra política de privacidad, ponte en contacto con nosotros.
      </p>
    </SeccionLegal>

    <SeccionLegal title="7. Contacto">
      <p>
        Para cuestiones de privacidad, escríbenos a:{" "}
        <a href={`mailto:${SUPORTE_EMAIL_ES}`} className={enlaceLegal}>{SUPORTE_EMAIL_ES}</a>
      </p>
      <p>
        Consulta también nuestros <a href="/es/terminos" className={enlaceLegal}>términos de uso</a>.
      </p>
    </SeccionLegal>
  </LegalES>
);

export default PrivacidadES;
