const crypto = require('crypto');

async function checkLiveWebhook() {
  const url = "https://zdjtcwtakgizbsbbwtgc.supabase.co/functions/v1/hotmart-webhook";
  
  // Generating a completely unique test email for this final validation
  const testEmail = "lucas.teste.garantia.final" + Math.floor(Math.random() * 1000) + "@gmail.com";
  
  const payload = {
    event: "PURCHASE_APPROVED",
    data: {
      buyer: {
        email: testEmail,
        name: "Lucas Teste Garantia"
      },
      product: {
        id: 7876791, // Elite Plan Product ID
        name: "Canva Viagem Elite"
      },
      purchase: {
        transaction: "TESTE-FINAL-" + crypto.randomUUID().substring(0,6),
        status: "APPROVED",
        price: { value: 197.00, currency_code: "BRL" },
        approved_date: new Date().toISOString()
      }
    }
  };

  console.log(" Enviando teste real para o Webhook ao vivo na nuvem...");
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hotmart-hottok': 'SEU_NOVO_HOTTOK_AQUI' 
      },
      body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    console.log(" Status Code da Resposta:", res.status);
    console.log(" Mensagem da Resposta:", text);
    
    if (res.status === 200 && text.includes("ok")) {
       console.log("✅ SUCESSO ABSOLUTO! O servidor processou a compra e ativou o Plano Elite corretamente.");
    } else {
       console.log("❌ Ocorreu algum problema inesperado na resposta.");
    }
    
  } catch(e) {
    console.error("❌ Falha de rede ao conectar com o Webhook:", e);
  }
}

checkLiveWebhook();
