const hottok = "nePhewzo3QPQVIi8QU5IjqE56EktAi1940697";
const url = "https://zdjtcwtakgizbsbbwtgc.supabase.co/functions/v1/hotmart-webhook";

const payload = {
  event: "PURCHASE_APPROVED",
  data: {
    buyer: {
      name: "Lucas Prova Definitiva",
      email: "arquivoslucashenrique+testebrabo@gmail.com"
    },
    product: {
      id: 7876791,
      name: "Canva Viagem Elite"
    },
    purchase: {
      transaction: "HP999" + Date.now().toString().slice(-6),
      status: "APPROVED",
      price: {
        value: 197.00,
        currency_code: "BRL"
      }
    }
  }
};

async function test() {
  console.log("Enviando webhook de teste para:", url);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hotmart-hottok": hottok
      },
      body: JSON.stringify(payload)
    });
    
    console.log("Status HTTP:", response.status);
    const text = await response.text();
    console.log("Resposta do Servidor:", text);
  } catch(e) {
    console.log("Erro:", e.message);
  }
}

test();
