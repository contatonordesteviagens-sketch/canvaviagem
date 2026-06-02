import React from 'react';
import { Helmet } from 'react-helmet-async';

interface MetaPixelProps {
  isPurchase?: boolean;
}

export const MetaPixel916689227676142 = ({ isPurchase = false }: MetaPixelProps) => {
  return (
    <Helmet>
      {/* Meta Pixel Code */}
      <script>{`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '916689227676142');
        fbq('track', 'PageView');
        ${isPurchase ? `fbq('track', 'Purchase');` : ''}
      `}</script>
      <noscript>{`
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=916689227676142&ev=PageView&noscript=1"
        />
        ${isPurchase ? `
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=916689227676142&ev=Purchase&noscript=1"
        />
        ` : ''}
      `}</noscript>
      {/* End Meta Pixel Code */}
    </Helmet>
  );
};
