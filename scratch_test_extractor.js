const test = async () => {
  console.log("Iniciando teste da API Edge Function...");
  try {
    const response = await fetch("https://mgdsjxasolxoclchyqdx.supabase.co/functions/v1/fabrica-extract-business-info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "text",
        content: "A agência Viaje Feliz oferece pacotes para Paris por R$ 5000,00 incluindo café da manhã e passagens, e pacotes para Roma por R$ 4000,00."
      })
    });
    
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Resultado da Extração:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Erro ao testar:", err);
  }
};

test();
