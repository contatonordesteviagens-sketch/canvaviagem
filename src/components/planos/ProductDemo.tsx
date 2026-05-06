import { useState } from 'react';

export const ProductDemo = () => {
  const [playing, setPlaying] = useState(false);
  const YOUTUBE_VIDEO_ID = '1Or9QJPn6OA';
  const THUMBNAIL_URL = `https://i.ytimg.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`;

  return (
    <section style={{
      padding: '60px 24px', maxWidth: '100%', background: '#050D1A',
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
          paddingTop: '56.25%', // Horizontal 16:9
          borderRadius: '24px', 
          overflow: 'hidden', 
          marginBottom: '24px',
          border: '2px solid rgba(0,229,255,0.3)', 
          cursor: 'pointer',
          boxShadow: '0 20px 80px rgba(0,229,255,0.25)',
          background: `url(${THUMBNAIL_URL}) center/cover no-repeat`
        }}
          onClick={() => setPlaying(true)}
        >
          {playing ? (
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&start=2`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(5, 13, 26, 0.4)', // Darker overlay for play button contrast
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '12px'
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: '#00E5FF', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(0,229,255,0.6)'
              }}>
                <div style={{
                  width: 0, height: 0,
                  borderTop: '15px solid transparent',
                  borderBottom: '15px solid transparent',
                  borderLeft: '24px solid #050D1A',
                  marginLeft: '5px'
                }} />
              </div>
              <p style={{ 
                color: '#FFFFFF', 
                fontSize: '12px', 
                margin: 0, 
                fontWeight: 900,
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                letterSpacing: '1px'
              }}>
                VER POR DENTRO (60S)
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
