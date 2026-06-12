import{j as n,H as o}from"./index-DdJ-CSjm.js";const i="1560736461820497",r=(e,t="USD")=>{typeof window<"u"&&window.fbq&&(window.fbq("trackSingle",i,"Purchase",{value:e,currency:t}),console.log(`[Meta ES Pixel] Purchase tracked: ${e} ${t}`))},a=(e,t="USD",s)=>{typeof window<"u"&&window.fbq&&(window.fbq("trackSingle",i,"Subscribe",{value:e,currency:t,predicted_ltv:s||e*12}),console.log(`[Meta ES Pixel] Subscribe tracked: ${e} ${t}, LTV: ${s||e*12}`))},f=({isPurchase:e=!1})=>n.jsxs(o,{children:[n.jsx("script",{children:`
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
        ${e?"fbq('track', 'Purchase');":""}
      `}),n.jsx("noscript",{children:`
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=916689227676142&ev=PageView&noscript=1"
        />
        ${e?`
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=916689227676142&ev=Purchase&noscript=1"
        />
        `:""}
      `})]});export{f as M,a,r as t};
