import { useEffect } from "react";

const NEW_PIXEL_ID = "2120347238758199";

interface MetaPixelNewProps {
  isPurchasePage?: boolean;
}

export const MetaPixelNew = ({ isPurchasePage = false }: MetaPixelNewProps) => {
  useEffect(() => {
    // Pixel is already initialized in index.html — only track events here
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackSingle', NEW_PIXEL_ID, 'PageView');
      
      if (isPurchasePage) {
        window.fbq('trackSingle', NEW_PIXEL_ID, 'Purchase', {
          value: 29.00,
          currency: 'BRL'
        });
        console.log('[Meta New Pixel] Purchase tracked for pixel:', NEW_PIXEL_ID);
      }
      
      console.log('[Meta New Pixel] PageView tracked for pixel:', NEW_PIXEL_ID);
    }
  }, [isPurchasePage]);

  return (
    <noscript>
      <img 
        height="1" 
        width="1" 
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${NEW_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
      {isPurchasePage && (
        <img 
          height="1" 
          width="1" 
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${NEW_PIXEL_ID}&ev=Purchase&noscript=1`}
          alt=""
        />
      )}
    </noscript>
  );
};
