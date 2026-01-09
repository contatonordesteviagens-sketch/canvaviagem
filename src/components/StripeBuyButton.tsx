import { useEffect, useRef } from "react";

interface StripeBuyButtonProps {
  buyButtonId: string;
  publishableKey: string;
  customerEmail?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'buy-button-id': string;
        'publishable-key': string;
        'customer-email'?: string;
      }, HTMLElement>;
    }
  }
}

export const StripeBuyButton = ({ buyButtonId, publishableKey, customerEmail }: StripeBuyButtonProps) => {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]');
    if (existingScript) {
      scriptLoaded.current = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);
    scriptLoaded.current = true;

    return () => {
      // Don't remove the script on unmount as it might be used by other components
    };
  }, []);

  return (
    <div className="flex justify-center w-full">
      <stripe-buy-button
        buy-button-id={buyButtonId}
        publishable-key={publishableKey}
        customer-email={customerEmail}
      />
    </div>
  );
};
