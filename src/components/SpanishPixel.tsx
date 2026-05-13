import { useEffect } from "react";

const ES_PIXEL_ID = "1560736461820497";

export const SpanishPixel = () => {
  useEffect(() => {
    // Pixel is already initialized in index.html — only track PageView here
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackSingle', ES_PIXEL_ID, 'PageView');
      console.log('[Meta ES Pixel] PageView tracked for pixel:', ES_PIXEL_ID);
    }
  }, []);

  return (
    <noscript>
      <img 
        height="1" 
        width="1" 
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${ES_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
};
