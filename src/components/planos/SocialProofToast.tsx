import { useState, useEffect } from 'react';

const EVENTS = [
  { city: 'Recife, PE', plan: 'Plano Anual Pro', time: '2 minutos' },
  { city: 'São Paulo, SP', plan: 'Plano Anual Pro', time: '5 minutos' },
  { city: 'Fortaleza, CE', plan: 'Plano Mensal', time: '8 minutos' },
  { city: 'Belo Horizonte, MG', plan: 'Plano Anual Pro', time: '12 minutos' },
  { city: 'Curitiba, PR', plan: 'Plano Anual Pro', time: '3 minutos' },
  { city: 'Salvador, BA', plan: 'Plano Mensal', time: '7 minutos' },
  { city: 'Manaus, AM', plan: 'Plano Anual Pro', time: '15 minutos' },
  { city: 'Porto Alegre, RS', plan: 'Plano Anual Pro', time: '1 minuto' },
];

export const SocialProofToast = ({ onCtaClicked }: { onCtaClicked: boolean }) => {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (onCtaClicked) return;

    const show = () => {
      setCurrent(prev => (prev + 1) % EVENTS.length);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    };

    const timeout = setTimeout(show, 8000);
    const interval = setInterval(show, 55000 + Math.random() * 30000);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [onCtaClicked]);

  const ev = EVENTS[current];

  return (
    <div style={{
      position: 'fixed', bottom: '80px', left: '16px', zIndex: 9998,
      background: '#0A1628', border: '1px solid #00E5FF',
      borderRadius: '10px', padding: '12px 16px', maxWidth: '280px',
      transform: visible ? 'translateX(0)' : 'translateX(-320px)',
      transition: 'transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
      boxShadow: '0 4px 20px rgba(0,229,255,0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(0,229,255,0.15)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0
        }}>🚀</div>
        <div>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>
            Alguém de {ev.city}
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
            assinou o {ev.plan} há {ev.time}
          </p>
        </div>
      </div>
    </div>
  );
};
