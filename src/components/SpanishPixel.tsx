import { useEffect } from "react";

const ES_PIXEL_ID = "1560736461820497";

export const SpanishPixel = () => {
  useEffect(() => {
    // Initialize and track PageView for ES pixel only
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('init', ES_PIXEL_ID);
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
