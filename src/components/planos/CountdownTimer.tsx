import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  variant: 'bar' | 'block';
}

const STORAGE_KEY = 'cv_offer_expires_at';
const DURATION_MS = 24 * 60 * 60 * 1000; // 24h

export const CountdownTimer = ({ variant }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({ h: '23', m: '59', s: '59' });

  useEffect(() => {
    let expiresAt = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
    const now = Date.now();

    if (!expiresAt || expiresAt <= now) {
      expiresAt = now + DURATION_MS;
      localStorage.setItem(STORAGE_KEY, expiresAt.toString());
    }

    const update = () => {
      const remaining = Math.max(0, expiresAt - Date.now());
      if (remaining === 0) {
        expiresAt = Date.now() + DURATION_MS;
        localStorage.setItem(STORAGE_KEY, expiresAt.toString());
      }
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeLeft({
        h: h.toString().padStart(2, '0'),
        m: m.toString().padStart(2, '0'),
        s: s.toString().padStart(2, '0'),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (variant === 'bar') {
    return (
      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#00E5FF', fontSize: '15px' }}>
        {timeLeft.h}:{timeLeft.m}:{timeLeft.s}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      {([['h', timeLeft.h], ['m', timeLeft.m], ['s', timeLeft.s]] as [string, string][]).map(([label, val]) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <div style={{
            background: 'rgba(0,229,255,0.1)', border: '1px solid #00E5FF',
            borderRadius: '6px', padding: '8px 14px',
            fontSize: '28px', fontWeight: 700, color: '#00E5FF',
            fontFamily: 'monospace', minWidth: '56px'
          }}>{val}</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textTransform: 'uppercase' }}>{label}</div>
        </div>
      ))}
    </div>
  );
};
