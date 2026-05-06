import { CountdownTimer } from './CountdownTimer';

export const StickyTopBar = ({ onCheckout }: { onCheckout: () => void }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: '#050D1A', borderBottom: '1px solid rgba(0, 229, 255, 0.3)',
      padding: '8px 16px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: '12px',
      overflowX: 'hidden', backdropFilter: 'blur(8px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <span className="animate-pulse" style={{ background: '#00E5FF', color: '#000',
          fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px', flexShrink: 0 }}>
          OFERTA
        </span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          EXPIRA EM
        </span>
      </div>
      
      <CountdownTimer variant="bar" />
      
      <button
        id="cta-sticky"
        onClick={onCheckout}
        style={{
          background: '#00E5FF', color: '#050D1A', border: 'none',
          borderRadius: '6px', padding: '7px 14px', fontSize: '11px',
          fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap',
          flexShrink: 0, textTransform: 'uppercase'
        }}
      >
        GARANTIR →
      </button>
    </div>
  );
};
