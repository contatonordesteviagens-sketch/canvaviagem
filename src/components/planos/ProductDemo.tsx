import { useState } from 'react';

const YOUTUBE_VIDEO_ID = 'dvInvZZ7fLY'; // usar um dos vídeos já existentes na página

export const ProductDemo = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <section style={{ padding: '60px 24px', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
      <p style={{ fontSize: '11px', color: '#00E5FF', letterSpacing: '.1em', marginBottom: '12px' }}>
        VEJA POR DENTRO
      </p>
      <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
        Tour completo pela plataforma
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px', fontSize: '14px' }}>
        4 minutos que vão mudar como você cria conteúdo para sempre
      </p>

      <div
        style={{
          position: 'relative', width: '100%', paddingTop: '56.25%',
          borderRadius: '12px', overflow: 'hidden',
          border: '1px solid rgba(0,229,255,0.3)', cursor: 'pointer'
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
            alignItems: 'center', justifyContent: 'center', gap: '16px'
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: '#00E5FF', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                width: 0, height: 0,
                borderTop: '12px solid transparent',
                borderBottom: '12px solid transparent',
                borderLeft: '20px solid #050D1A',
                marginLeft: '4px'
              }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>
              Clique para assistir o tour de 4 minutos
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
