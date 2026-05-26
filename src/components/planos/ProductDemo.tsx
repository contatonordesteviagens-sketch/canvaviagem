import { useState } from 'react';
import { Play, ChevronDown, ChevronUp } from 'lucide-react';

import { trackViewContent } from '@/lib/meta-pixel';

interface ProductDemoProps {
  showStartDemo?: boolean;
}

export const ProductDemo = ({ showStartDemo = true }: ProductDemoProps) => {
  const [mutedActive, setMutedActive] = useState(true);
  const [showStartVideo, setShowStartVideo] = useState(false);

  const ELITE_VIDEO_ID = 'P0_4EdEOQAc';
  const START_VIDEO_ID = '1Or9QJPn6OA';

  const handleActivateSound = () => {
    setMutedActive(false);
    // Firing specific ViewContent event requested for Video clicks
    trackViewContent('Demonstrativo Plano Elite');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', width: '100%' }}>
      
      {/* Player Principal (Elite Video) */}
      <div style={{
        position: 'relative', 
        width: '100%', 
        paddingTop: '56.25%', // 16:9 ratio
        borderRadius: '24px', 
        overflow: 'hidden', 
        marginBottom: '20px',
        border: '2px solid rgba(0,229,255,0.3)', 
        boxShadow: '0 24px 80px rgba(0,229,255,0.25)',
        background: '#000000'
      }}>
        {mutedActive ? (
          <>
            {/* Autoplay silent preview */}
            <iframe
              style={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                pointerEvents: 'none'
              }}
              src={`https://www.youtube.com/embed/${ELITE_VIDEO_ID}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ELITE_VIDEO_ID}&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
              allow="autoplay; encrypted-media"
              title="Demonstração Plano Elite"
            />
            
            {/* Silent Overlay */}
            <div 
              onClick={handleActivateSound}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(5, 13, 26, 0.4)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '16px',
                cursor: 'pointer', transition: 'background 0.3s ease'
              }}
            >
              <div style={{
                position: 'absolute', top: '20px',
                background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(0,229,255,0.25)',
                borderRadius: '100px', padding: '6px 18px', fontSize: '11px',
                fontWeight: 800, color: '#00E5FF', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#00E5FF', borderRadius: '50%' }} className="animate-pulse" />
                ASSISTIR COM SOM (CLIQUE PARA ATIVAR)
              </div>

              <div 
                className="hover:scale-105 active:scale-95 transition-all animate-bounce"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: '#00E5FF', color: '#050D1A', fontWeight: 900,
                  fontSize: '14px', padding: '16px 32px', borderRadius: '100px',
                  boxShadow: '0 8px 32px rgba(0,229,255,0.4)',
                  animationDuration: '2.2s'
                }}
              >
                <Play size={16} fill="#050D1A" />
                ATIVAR AUDIO DO VÍDEO
              </div>
            </div>
          </>
        ) : (
          <iframe
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            src={`https://www.youtube.com/embed/${ELITE_VIDEO_ID}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Demonstração Plano Elite"
          />
        )}
      </div>

      {showStartDemo && (
        <div>
          <button
            onClick={() => setShowStartVideo(!showStartVideo)}
            className="hover:bg-white/5 active:scale-95 transition-all"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '100px', padding: '10px 20px', fontSize: '12px',
              fontWeight: 800, color: 'rgba(255,255,255,0.7)', cursor: 'pointer'
            }}
          >
            <span>{showStartVideo ? 'Ocultar Vídeo do Plano Start' : 'Quer ver o vídeo do Plano Start? Clique aqui'}</span>
            {showStartVideo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      )}

      {/* Player Oculto do Plano Start */}
      {showStartDemo && showStartVideo && (
        <div style={{
          marginTop: '24px',
          animation: 'fadeIn 0.4s ease-out'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '12px', color: 'rgba(255,255,255,0.8)' }}>
            🎥 Vídeo de Demonstração - Plano Start
          </h3>
          
          <div style={{
            position: 'relative', 
            width: '100%', 
            paddingTop: '56.25%', 
            borderRadius: '20px', 
            overflow: 'hidden', 
            border: '1px solid rgba(255,255,255,0.15)',
            background: '#000000',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)'
          }}>
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              src={`https://www.youtube.com/embed/${START_VIDEO_ID}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Demonstração Plano Start"
            />
          </div>
        </div>
      )}
    </div>
  );
};
