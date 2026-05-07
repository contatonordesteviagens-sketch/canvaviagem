import { useState, useEffect } from 'react';

export const StickyTopBar = ({ onCheckout }: { onCheckout: () => void }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled30 = docHeight > 0 ? (scrollY / docHeight >= 0.3) : false;

      // Check if pricing element is in viewport
      const pricingEl = document.getElementById('pricing');
      let inPricing = false;
      if (pricingEl) {
        const rect = pricingEl.getBoundingClientRect();
        inPricing = rect.top < window.innerHeight && rect.bottom > 0;
      }

      setVisible(scrolled30 && !inPricing);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
      background: 'rgba(5, 13, 26, 0.96)', border: '1px solid #00E5FF',
      borderRadius: '100px', padding: '10px 24px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: '16px', backdropFilter: 'blur(10px)',
      boxShadow: '0 10px 30px rgba(0, 229, 255, 0.25)',
      width: '90%', maxWidth: '420px', transition: 'all 0.3s ease'
    }}>
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
        Canva Viagem — R$ 16,41/mês
      </span>
      <button
        id="cta-sticky"
        onClick={() => {
          const pricingEl = document.getElementById('pricing');
          if (pricingEl) {
            pricingEl.scrollIntoView({ behavior: 'smooth' });
          } else {
            onCheckout();
          }
        }}
        aria-label="Assinar Canva Viagem"
        style={{
          background: '#00E5FF', color: '#050D1A', border: 'none',
          borderRadius: '100px', padding: '8px 16px', fontSize: '12px',
          fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap',
          textTransform: 'uppercase', letterSpacing: '0.5px'
        }}
      >
        ASSINAR AGORA
      </button>
    </div>
  );
};
