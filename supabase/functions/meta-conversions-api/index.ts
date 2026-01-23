import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PIXEL_IDS = [
  '1599242897762192',
  '1152272353771099',
  '4254631328136179'
];

interface EventData {
  event_name: string;
  event_time?: number;
  event_source_url?: string;
  user_data?: {
    em?: string; // hashed email
    ph?: string; // hashed phone
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // click ID
    fbp?: string; // browser ID
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_type?: string;
    predicted_ltv?: number;
  };
  action_source: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('META_CONVERSIONS_API_TOKEN');
    
    if (!accessToken) {
      console.error('META_CONVERSIONS_API_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { event_name, event_source_url, user_data, custom_data } = body;

    if (!event_name) {
      return new Response(
        JSON.stringify({ error: 'event_name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client info from headers
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || '';

    const eventData: EventData = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: event_source_url || 'https://canvaviagem.lovable.app',
      user_data: {
        ...user_data,
        client_ip_address: clientIp,
        client_user_agent: userAgent,
      },
      custom_data,
      action_source: 'website',
    };

    // Send to all pixel IDs
    const results = await Promise.allSettled(
      PIXEL_IDS.map(async (pixelId) => {
        const url = `https://graph.facebook.com/v18.0/${pixelId}/events`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: [eventData],
            access_token: accessToken,
          }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          console.error(`Meta API error for pixel ${pixelId}:`, result);
          throw new Error(`Failed for pixel ${pixelId}: ${JSON.stringify(result)}`);
        }

        console.log(`Event ${event_name} sent to pixel ${pixelId}:`, result);
        return { pixelId, result };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        event_name,
        pixels_sent: successful,
        pixels_failed: failed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in meta-conversions-api:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
