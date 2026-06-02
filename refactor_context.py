import re

with open('src/hooks/useFabricaContext.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Rename the main variable definition
content = content.replace('const defaultState: FabricaState = {', 'const defaultStateBR: FabricaState = {')

# 2. Replace all remaining 'defaultState' usages with 'getBaseState()'
content = re.sub(r'(?<!\w)defaultState(?!\w)', 'getBaseState()', content)

# 3. Inject the ES version and the smart selector getBaseState()
es_state = """
const defaultStateES: FabricaState = {
  ...defaultStateBR,
  primaryColor: "#0C2340",
  secondaryColor: "#C9A84C",
  siteContent: {
    ...defaultStateBR.siteContent,
    heroHeadline: "",
    heroSubheadline: "",
    heroCtaLabel: "Hablar por WhatsApp",
    pacotesTitle: "Nuestros Paquetes",
    depoimentosTitle: "Quienes viajaron recomiendan",
    faqTitle: "Preguntas Frecuentes",
    finalCtaTitle: "¿Listo para tu próximo viaje?",
    finalCtaLabel: "Contactar por WhatsApp",
    faq: [
      { q: "¿Se puede pagar en cuotas?", a: "¡Sí! Hasta 12 cuotas con tarjeta de crédito, sin intereses en condiciones seleccionadas." },
      { q: "¿Es seguro contratar con ustedes?", a: "Somos una agencia regulada con registro activo y asociación directa con operadores." },
      { q: "¿Y si necesito cancelar?", a: "Cada paquete tiene su política. Recibirás el contrato con todo claro antes de cerrar." },
      { q: "¿Cómo resolver dudas?", a: "Atención directa por WhatsApp, con respuesta en menos de 1h en horario comercial." },
    ],
    heroEyebrow: "Consultoría Premium de Viajes",
    processoEyebrow: "Proceso",
    processoTitle: "Tu viaje soñado en 3 pasos",
    processoSteps: [
      { num: "1", title: "Consulta Personalizada", desc: "Entendemos tus sueños, fechas, presupuesto y estilo en una charla de 30 minutos sin compromiso." },
      { num: "2", title: "Curaduría Exclusiva", desc: "Creamos un itinerario 100% personalizado con los mejores hoteles, tours y experiencias para tu perfil." },
      { num: "3", title: "Embarque Tranquilo", desc: "Cuidamos de pasajes, alojamiento, traslados y soporte 24h durante todo tu viaje." }
    ],
    destinosEyebrow: "Destinos",
    equipeBadge: "+15k Clientes Satisfechos",
    equipeEyebrow: "Nuestro equipo",
    equipeTitle: "Un equipo dedicado exclusivamente a ti",
    equipeIntro: "Cada viaje comienza con una conversación real. Nuestro equipo de expertos conoce los destinos de cerca — cada detalle pensado para tu perfil, tus sueños y tu momento.",
    equipeFeatures: [
      { icon: "🛡️", title: "Seguridad y Confiabilidad", desc: "Años de experiencia con miles de familias y socios verificados mundialmente." },
      { icon: "📞", title: "Soporte 24h Durante el Viaje", desc: "Nuestro equipo está disponible a cualquier hora. Cualquier imprevisto, lo resolvemos." },
      { icon: "✨", title: "Experiencias Exclusivas", desc: "Acceso a hoteles y experiencias que no están disponibles para el público general." },
      { icon: "💰", title: "Mejor Relación Calidad-Precio", desc: "Nuestra red de socios ofrece condiciones especiales que no encuentras en otros lugares." }
    ],
    orcamentoEyebrow: "Presupuesto",
    orcamentoTitle: "Habla con un consultor ahora",
    orcamentoText: "Completa el formulario y nuestro equipo te contactará en hasta 2 horas con una propuesta personalizada.",
    atendimentoText: "Lun–Vie 8h–20h · Sáb 9h–15h",
    footerText: "Tu socio ideal para viajes inolvidables. Cuidamos cada detalle para que tú solo disfrutes el momento.",
    stats: [
      { num: "12+", label: "Años de Experiencia" },
      { num: "15k+", label: "Viajeros Felices" },
      { num: "25", label: "Países Visitados" },
      { num: "99%", label: "Satisfacción" },
    ],
  },
  lastAdTitle: "Paquete {destino}",
  lastPaymentSuffix: "por persona",
  lastCurrency: "USD1",
  selectedPackages: [],
};

const getBaseState = (): FabricaState => {
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/es")) {
    return defaultStateES;
  }
  return defaultStateBR;
};

"""

content = content.replace('const STORAGE_KEY =', es_state + 'const STORAGE_KEY =')

with open('src/hooks/useFabricaContext.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Contexto refatorado com sucesso!")
