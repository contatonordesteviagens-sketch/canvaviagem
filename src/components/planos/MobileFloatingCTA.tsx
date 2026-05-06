import { useState, useEffect } from 'react';

export const MobileFloatingCTA = ({ onCheckout }: { onCheckout: () => void }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const pricingEl = document.getElementById('pricing');
      const pricingTop = pricingEl?.getBoundingClientRect().top ?? 9999;
      // Aparece após 400px de scroll, mas some quando chegamos na seção de preços
      setVisible(scrollY > 400 && pricingTop > window.innerHeight);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div 
      className="md:hidden"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9997,
        background: '#050D1A', borderTop: '1px solid rgba(0, 229, 255, 0.3)',
        padding: '12px 16px',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.4s cubic-bezier(0.36, 0, 0.66, -0.56)', // Efeito suave
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        visibility: visible ? 'visible' : 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Plano Anual Pro</p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
            R$ 16,41<span style={{ fontSize: '12px', fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>/mês</span>
          </p>
        </div>
        <button
          id="cta-mobile-float"
          onClick={onCheckout}
          className="animate-pulse"
          style={{
            background: '#00E5FF', color: '#050D1A', border: 'none',
            borderRadius: '8px', padding: '12px 20px', fontSize: '13px',
            fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}
        >
          Garantir Vaga →
        </button>
      </div>
    </div>
  );
};
