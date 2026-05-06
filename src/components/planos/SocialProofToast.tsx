import { useState, useEffect } from 'react';

const EVENTS = [
  { city: 'Recife, PE', plan: 'Plano Pro', mins: '2' },
  { city: 'São Paulo, SP', plan: 'Plano Pro', mins: '5' },
  { city: 'Fortaleza, CE', plan: 'Mensal', mins: '8' },
  { city: 'Belo Horizonte, MG', plan: 'Plano Pro', mins: '11' },
  { city: 'Curitiba, PR', plan: 'Plano Pro', mins: '3' },
  { city: 'Salvador, BA', plan: 'Mensal', mins: '7' },
];

export const SocialProofToast = ({ ctaClicked }: { ctaClicked: boolean }) => {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (ctaClicked) return;

    const show = () => {
      setCurrent(prev => (prev + 1) % EVENTS.length);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    };

    const firstTimeout = setTimeout(show, 8000);
    const interval = setInterval(show, 45000 + Math.random() * 20000);

    return () => { clearTimeout(firstTimeout); clearInterval(interval); };
  }, [ctaClicked]);

  const ev = EVENTS[current];

  return (
    <div style={{
      position: 'fixed', bottom: '100px', left: '16px', zIndex: 9998,
      background: '#0A1628', border: '1px solid rgba(0, 229, 255, 0.3)',
      borderRadius: '12px', padding: '12px 16px', maxWidth: '280px',
      transform: visible ? 'translateX(0)' : 'translateX(-340px)',
      transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', gap: '12px'
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: 'rgba(0,229,255,0.15)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0
      }}>🚀</div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ev.city}
        </p>
        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
          assinou o <span style={{ color: '#00E5FF', fontWeight: 600 }}>{ev.plan}</span> há {ev.mins}min
        </p>
      </div>
    </div>
  );
};
