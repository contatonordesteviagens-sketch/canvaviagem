import { useState } from 'react';

export const ProductDemo = () => {
  const [mutedActive, setMutedActive] = useState(true);
  const YOUTUBE_VIDEO_ID = '1Or9QJPn6OA';

  const handleActivateSound = () => {
    setMutedActive(false);
  };

  return (
    <section style={{
      padding: '40px 24px 60px', maxWidth: '100%', background: '#050D1A',
      color: '#FFFFFF'
    }}>
      <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: '#00E5FF', letterSpacing: '.1em', marginBottom: '12px', margin: 0, fontWeight: 800 }}>
          VEJA POR DENTRO
        </p>
        <h2 style={{
          fontSize: '28px', fontWeight: 900, margin: '12px 0 8px',
          lineHeight: 1.2
        }}>
          Não acredite no que eu digo.<br />
          <span style={{ color: '#00E5FF' }}>Olhe a tela.</span>
        </h2>
        <p style={{
          fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '16px 0 32px',
          lineHeight: 1.5
        }}>
          60 segundos: do login até o post no Instagram.
        </p>

        <div style={{
          position: 'relative', 
          width: '100%', 
          paddingTop: '56.25%', // Proporção horizontal 16:9
          borderRadius: '24px', 
          overflow: 'hidden', 
          marginBottom: '24px',
          border: '2px solid rgba(0,229,255,0.3)', 
          boxShadow: '0 20px 80px rgba(0,229,255,0.2)',
          background: '#000000'
        }}>
          {mutedActive ? (
            <>
              {/* Autoplay silenciado sem controles do YouTube no fundo */}
              <iframe
                style={{ 
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  pointerEvents: 'none' // Impede que o usuário interaja diretamente com o iframe silenciado
                }}
                src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&controls=0&loop=1&playlist=${YOUTUBE_VIDEO_ID}&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
                allow="autoplay; encrypted-media"
              />
              
              {/* Overlay interativo com efeito de som desativado e botão pulsante */}
              <div 
                onClick={handleActivateSound}
                className="group"
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(5, 13, 26, 0.35)', // Filtro escuro suave para contraste
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '16px',
                  cursor: 'pointer',
                  transition: 'background 0.3s ease'
                }}
              >
                {/* Badge informativa flutuante */}
                <div style={{
                  position: 'absolute', top: '20px',
                  background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(0,229,255,0.2)',
                  borderRadius: '100px', padding: '6px 16px', fontSize: '11px',
                  fontWeight: 800, color: '#00E5FF', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#00E5FF', borderRadius: '50%' }} className="animate-pulse" />
                  ROLANDO SEM SOM (CLIQUE PARA OUVIR)
                </div>

                {/* Botão de volume pulsante */}
                <div 
                  className="group-hover:scale-105 active:scale-95 transition-all animate-bounce"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: '#00E5FF', color: '#050D1A', fontWeight: 900,
                    fontSize: '14px', padding: '16px 28px', borderRadius: '100px',
                    boxShadow: '0 8px 32px rgba(0,229,255,0.5)',
                    animationDuration: '2s'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>🔊</span>
                  ATIVAR SOM DO VÍDEO
                </div>
              </div>
            </>
          ) : (
            /* Vídeo normal com som e controles do YouTube ativos ao clicar */
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </section>
  );
};
