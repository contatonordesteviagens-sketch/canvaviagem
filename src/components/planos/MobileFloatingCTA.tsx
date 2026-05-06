import { useState, useEffect } from 'react';

export const MobileFloatingCTA = ({ onCheckout }: { onCheckout: () => void }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const pricingEl = document.getElementById('preco');
      const pricingTop = pricingEl?.getBoundingClientRect().top ?? 9999;
      setVisible(scrollY > 400 && pricingTop > 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="md:hidden" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9997,
      background: '#050D1A', borderTop: '1px solid #00E5FF',
      padding: '12px 16px',
      transform: visible ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Plano Anual Pro</p>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
            R$16,41<span style={{ fontSize: '12px', fontWeight: 400 }}>/mês</span>
          </p>
        </div>
        <button
          id="cta-mobile-float"
          onClick={onCheckout}
          style={{
            background: '#00E5FF', color: '#050D1A', border: 'none',
            borderRadius: '8px', padding: '12px 20px', fontSize: '13px',
            fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
          }}
        >
          Garantir acesso →
        </button>
      </div>
    </div>
  );
};
