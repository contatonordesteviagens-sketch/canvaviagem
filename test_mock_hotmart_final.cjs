const fetch = require('node-fetch');
const crypto = require('crypto');

async function testWebhook() {
  const url = "https://zdjtcwtakgizbsbbwtgc.supabase.co/functions/v1/hotmart-webhook";
  
  const payload = {
    event: "PURCHASE_APPROVED",
    data: {
      buyer: {
        email: "lucas.teste.final.agora@gmail.com",
        name: "Lucas Teste Final"
      },
      product: {
        id: 7876791,
        name: "Canva Viagem Elite"
      },
      purchase: {
        transaction: "TESTE-" + crypto.randomUUID().substring(0,8),
        status: "APPROVED",
        price: { value: 197.00, currency_code: "BRL" },
        approved_date: new Date().toISOString()
      }
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hotmart-hottok': 'SEU_NOVO_HOTTOK_AQUI' // The HOTTOK from .env
      },
      body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch(e) {
    console.error("Error:", e);
  }
}

testWebhook();
