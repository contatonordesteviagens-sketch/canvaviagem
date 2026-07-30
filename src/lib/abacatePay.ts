export const ABACATE_URL = "https://api.abacatepay.com/v1";

export const ABACATE_PLANS = {
    monthly: "bill_yUw05raaAtRTPQQafx4peM4s",
    annual: "bill_w2ma2BcnfRfyWmr3Ly3quhB2",
};

export async function createAbacateCheckout(planType: "monthly" | "annual", customerData?: { name?: string, email?: string, taxId?: string }) {
    const planId = ABACATE_PLANS[planType];
    console.log(`[AbacatePay] Iniciando criação de checkout para o plano: ${planType} (${planId})`);

    // AbacatePay exige taxId (CPF/CNPJ) válido. 
    // Usaremos um placeholder que passe na validação de formato se não fornecido.
    const customer = {
        name: customerData?.name || "Agente de Viagem",
        email: customerData?.email || "contato@canvaviagem.com.br",
        taxId: customerData?.taxId || "95147485038", // CPF válido para passar na validação de formato da API
    };

    try {
        console.log("[AbacatePay] Enviando payload:", { planId, customer });
        
        const response = await fetch("/api/abacate/checkouts/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                items: [
                    {
                        id: planId,
                        quantity: 1,
                    },
                ],
                customer,
                methods: ["PIX"],
                returnUrl: `${window.location.origin}/planos`,
                completionUrl: `${window.location.origin}/obrigado?email=${customer.email}&source=checkout`,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            console.error("[AbacatePay] Erro na requisição:", errorText);
            throw new Error(`Erro AbacatePay: ${errorText}`);
        }

        const result = await response.json();
        console.log("[AbacatePay] Resultado da API:", result);

        if (result.data && result.data.url) {
            console.log("[AbacatePay] URL de checkout gerada com sucesso:", result.data.url);
            return result.data.url;
        }

        console.error("[AbacatePay] URL não encontrada no resultado da API:", result);
        throw new Error("URL de checkout não retornada pela API.");
    } catch (error) {
        console.error("[AbacatePay] Falha na criação do checkout:", error);
        throw error;
    }
}
