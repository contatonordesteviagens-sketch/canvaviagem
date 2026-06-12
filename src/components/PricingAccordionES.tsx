import { CheckCircle2 } from "lucide-react";

export function PricingAccordionES() {
  const PLAN_MENSUAL_FEATURES = [
    "Acceso a la plataforma",
    "IA para anuncios y textos",
    "Contenidos listos para turismo",
    "Páginas de paquetes",
    "CRM para leads",
    "Soporte vía WhatsApp",
    "Garantía de 7 días"
  ];

  const PLAN_ANUAL_FEATURES = [
    "Todo lo del plan mensual",
    "Acceso completo por 12 meses",
    "Mayor descuento disponible",
    "250 videos Reels de destinos",
    "400 diseños, stories y posts",
    "Generador de anuncios con IA",
    "Constructor de páginas de paquetes",
    "CRM para leads y cotizaciones",
    "Textos, leyendas y CTAs",
    "Generador de itinerarios",
    "Soporte vía WhatsApp",
    "Acceso inmediato",
    "Garantía de 7 días"
  ];

  return (
    <>
    <div className="w-full max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-8 mt-8 items-stretch justify-center">
      
      {/* PLANO MENSAL */}
      <div className="relative w-full lg:w-[35%] flex flex-col order-2 lg:order-1 mt-6 lg:mt-6 lg:mb-6">
        <div className="relative rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-colors flex flex-col h-full shadow-sm">
          <div className="p-6 md:p-8 flex flex-col h-full opacity-90">
            <div className="flex flex-col items-center text-center w-full mb-6">
              <h3 className="text-xl font-bold text-slate-700 leading-tight">
                Plan Mensual
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-2">
                Para validar la plataforma con menor compromiso y pagar mes a mes.
              </p>
              
              <div className="mt-6 mb-2">
                <div className="text-3xl font-black text-slate-800 leading-none flex items-baseline justify-center gap-1">
                  US$50<span className="text-sm text-slate-500 font-bold">/mes</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-left mb-8 flex-grow">
              <p className="text-sm font-semibold text-slate-600 mb-4 pb-2 border-b border-slate-100">Pagas US$50 cada mes. Mantienes acceso mientras la suscripción esté activa. Es simple para empezar, pero no tiene el ahorro del anual.</p>
              {PLAN_MENSUAL_FEATURES.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[14px] font-medium text-slate-600 leading-snug">
                  <CheckCircle2 size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  {feature}
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4">
              <a
                href="https://pay.hotmart.com/C106141067C?off=8qkh1yh6&checkoutMode=10"
                className="w-full text-center py-3.5 rounded-xl font-bold border-2 transition-all hover:bg-slate-50 active:scale-95 flex items-center justify-center text-[15px]"
                style={{ borderColor: '#CBD5E1', color: '#64748B' }}
              >
                Elegir mensual por US$50
              </a>
              <p className="text-center text-[12px] text-slate-500 font-semibold mt-3">
                Pago seguro por Hotmart. Tarjetas internacionales. Precios en dólares (USD).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PLANO ANUAL (Mejor Elección) */}
      <div className="relative w-full lg:w-[65%] flex flex-col order-1 lg:order-2">
        <div className="relative rounded-3xl bg-white border-[4px] border-[#7C3AED] shadow-[0_20px_50px_-12px_rgba(124,58,237,0.5)] flex flex-col h-full z-10 transition-transform hover:-translate-y-2">
          
          {/* Glowing Background Effect behind the card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[28px] blur opacity-20 -z-10"></div>
          
          {/* Badge */}
          <div style={{
            position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(90deg, #EA580C, #DC2626)',
            color: 'white', fontSize: '14px', fontWeight: '900',
            padding: '8px 32px', borderRadius: '30px', whiteSpace: 'nowrap',
            boxShadow: '0 8px 20px rgba(220,38,38,0.4)',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            MEJOR ELECCIÓN · MAYOR AHORRO
          </div>

          <div className="p-8 md:p-10 pt-12 flex flex-col h-full">
            <div className="flex flex-col items-center text-center w-full mb-8">
              <h3 className="text-3xl font-black text-slate-900 leading-tight">
                Plan Anual
              </h3>
              <p className="text-base text-slate-600 font-medium mt-2">
                La mejor opción si quieres usar la plataforma todo el año pagando menos que 12 mensualidades.
              </p>
              
              <div className="mt-6 w-full flex flex-col items-center">
                {/* Visual Math Comparison */}
                <div className="flex flex-col items-center justify-center mb-4 text-center">
                  <div className="text-[15px] text-slate-400 font-medium mb-1">
                  Si pagaras mensual: US$50 x 12 = <span className="line-through">US$600/año</span>
                  </div>
                </div>

                <div className="w-full max-w-sm" style={{
                  background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                  border: '2px solid #4ADE80', borderRadius: '16px',
                  padding: '20px', textAlign: 'center',
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)'
                }}>
                  <div className="text-[40px] font-[900] text-[#15803D] leading-none mb-1">
                    US$250<span className="text-[18px] font-bold">/año</span>
                  </div>
                  <div className="text-[14px] text-[#15803D] font-bold opacity-90 mt-2 bg-green-100 rounded-md py-1 px-3 inline-block">
                    Ahorro real: US$350
                  </div>
                </div>
                
                <div className="text-[13px] text-slate-500 font-semibold mt-3">
                  Puedes pagar al contado o en 12x de US$25 en el checkout. El acceso sigue siendo anual.
                </div>
                <div className="text-[13px] text-green-700 font-black mt-2">
                  Equivale a ahorrar cerca de 58% frente a pagar mensual por 12 meses.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-left mb-10 flex-grow">
              {PLAN_ANUAL_FEATURES.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[14px] font-bold text-slate-700 leading-snug">
                  <CheckCircle2 size={18} className="text-[#7C3AED] shrink-0 mt-0.5 drop-shadow-sm" />
                  {feature}
                </div>
              ))}
            </div>

            <div className="mt-auto">
              <a
                href="https://pay.hotmart.com/C106141067C?off=ts1hgsho&checkoutMode=10"
                className="w-full text-center py-5 rounded-2xl font-black text-white shadow-[0_15px_30px_-10px_rgba(124,58,237,0.7)] hover:bg-[#6D28D9] transition-all active:scale-95 flex items-center justify-center text-[19px] bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]"
              >
                Elegir anual y ahorrar US$350
              </a>
              <p className="text-center text-[12px] text-slate-500 font-semibold mt-3">
                Recomendado para agencias que quieren publicar ofertas todo el año, reducir el costo total y tener 12 meses de acceso claro.
              </p>
              <p className="text-center text-[12px] text-slate-500 font-semibold mt-2">
                Pago seguro por Hotmart. Tarjetas internacionales. Precios en dólares (USD).
              </p>
              <div className="text-center text-[13px] font-bold text-slate-400 mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:hidden">
                <span>⚡ Acceso inmediato</span>
                <span className="hidden sm:inline">|</span>
                <span>🔒 Pago seguro por Hotmart</span>
                <span className="hidden sm:inline">|</span>
                <span>Tarjetas internacionales</span>
                <span className="hidden sm:inline">|</span>
                <span>✅ Garantía de 7 días</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    <div className="w-full text-center mt-8 hidden md:flex items-center justify-center gap-4 text-slate-500 font-medium text-sm">
      <span>🔒 Pago seguro por Hotmart</span>
      <span>|</span>
      <span>Tarjetas internacionales</span>
      <span>|</span>
      <span>Precios en USD</span>
      <span>|</span>
      <span>⚡ Acceso inmediato</span>
      <span>|</span>
      <span>✔ Garantía de 7 días</span>
      <span>|</span>
      <span>💬 Soporte vía WhatsApp</span>
    </div>
    </>
  );
}
