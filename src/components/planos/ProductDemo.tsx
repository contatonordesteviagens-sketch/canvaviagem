import { useState } from 'react';
import { Play, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export const ProductDemo = () => {
  const [mutedActive, setMutedActive] = useState(true);
  const [showStartVideo, setShowStartVideo] = useState(false);

  const ELITE_VIDEO_ID = 'Xqcw-NpPz08';
  const START_VIDEO_ID = '1Or9QJPn6OA';

  const handleActivateSound = () => {
    setMutedActive(false);
  };

  return (
    <section style={{
      padding: '50px 24px 60px', maxWidth: '100%', background: '#050D1A',
      color: '#FFFFFF', borderTop: '1px solid rgba(255,255,255,0.06)'
    }}>
      <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
        
        {/* Header Badge */}
        <div style={{ 
          display: 'inline-flex', gap: '8px', alignItems: 'center',
          background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.2)',
          borderRadius: '100px', padding: '6px 14px', fontSize: '11px',
          color: '#00E5FF', fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '1px', marginBottom: '16px'
        }}>
          <Sparkles size={12} />
          <span>Fábrica de Anúncios - Plano Elite</span>
        </div>

        <h2 style={{
          fontSize: 'clamp(24px, 4.5vw, 36px)', fontWeight: 900, margin: '12px 0 8px',
          lineHeight: 1.2, letterSpacing: '-0.5px'
        }}>
          Veja o Robô de Criativos em Ação<br />
          <span style={{ color: '#00E5FF' }}>Do zero ao anúncio pronto em 10 segundos.</span>
        </h2>
        
        <p style={{
          fontSize: '15px', color: 'rgba(255,255,255,0.6)', margin: '12px 0 32px',
          lineHeight: 1.5, maxWidth: '600px', marginInline: 'auto'
        }}>
          Assista ao vídeo demonstrativo completo do plano Elite e descubra o poder da Fábrica de Anúncios com Inteligência Artificial.
        </p>

        {/* Player Principal (Elite Video) */}
        <div style={{
          position: 'relative', 
          width: '100%', 
          paddingTop: '56.25%', // 16:9 ratio
          borderRadius: '24px', 
          overflow: 'hidden', 
          marginBottom: '28px',
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

        {/* Botão de Minimizar / Revelar Plano Start */}
        <div style={{ marginTop: '24px' }}>
          <button
            onClick={() => setShowStartVideo(!showStartVideo)}
            className="hover:bg-white/5 active:scale-95 transition-all"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '100px', padding: '12px 24px', fontSize: '13px',
              fontWeight: 800, color: 'rgba(255,255,255,0.8)', cursor: 'pointer'
            }}
          >
            <span>{showStartVideo ? 'Ocultar Vídeo do Plano Start' : 'Quer ver o vídeo do Plano Start? Clique aqui'}</span>
            {showStartVideo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Player Oculto/Minimizado do Plano Start */}
        {showStartVideo && (
          <div style={{
            marginTop: '32px',
            animation: 'fadeIn 0.4s ease-out'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', color: 'rgba(255,255,255,0.9)' }}>
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
    </section>
  );
};
