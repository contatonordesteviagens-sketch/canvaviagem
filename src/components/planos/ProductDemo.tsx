import { useState } from 'react';

export const ProductDemo = () => {
  const [playing, setPlaying] = useState(false);
  const YOUTUBE_VIDEO_ID = 'dvInvZZ7fLY'; // Preenchido com o ID do vídeo demo mencionado no SalesPage

  return (
    <section style={{
      padding: '60px 24px', maxWidth: '100%', background: '#050D1A',
      color: '#FFFFFF'
    }}>
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        <p style={{ fontSize: '11px', color: '#00E5FF', letterSpacing: '.1em', marginBottom: '12px', margin: 0 }}>
          VEJA POR DENTRO
        </p>
        <h2 style={{
          fontSize: '22px', fontWeight: 700, margin: '12px 0 8px',
          lineHeight: 1.3
        }}>
          Não acredite no que eu digo.<br />
          <span style={{ color: '#00E5FF' }}>Olhe a tela.</span>
        </h2>
        <p style={{
          fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '16px 0 32px',
          lineHeight: 1.5
        }}>
          60 segundos: do login até o post no Instagram.
        </p>

        <div style={{
          position: 'relative', width: '100%', paddingTop: '56.25%',
          borderRadius: '12px', overflow: 'hidden', marginBottom: '24px',
          border: '1px solid rgba(0,229,255,0.2)', cursor: 'pointer',
          boxShadow: '0 20px 60px rgba(0,229,255,0.15)'
        }}
          onClick={() => setPlaying(true)}
        >
          {playing ? (
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, #0A1628 0%, #0d2040 100%)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '12px'
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: '#00E5FF', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(0,229,255,0.4)'
              }}>
                <div style={{
                  width: 0, height: 0,
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  borderLeft: '16px solid #050D1A',
                  marginLeft: '3px'
                }} />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0, fontWeight: 700 }}>
                VER A PLATAFORMA POR DENTRO (60S)
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
