export interface ContentLibraryItem {
    id: string;
    category: 'offer' | 'ranking' | 'script' | 'cta';
    title: string;
    text: string;
    isPremium: boolean;
    tags: string[];
}

export const contentLibrary: ContentLibraryItem[] = [
    // --- OFERTAS (3 Grátis, o resto Premium) ---
    {
        id: 'off-01',
        category: 'offer',
        title: 'Rio de Janeiro (RJ) - Pacote Completo',
        text: `Descubra as maravilhas do Rio com Aéreo + Hotel + Cristo Redentor. 
    12x de R$ 57.83 sem juros!`,
        isPremium: false,
        tags: ['Nacional', 'Praia']
    },
    {
        id: 'off-02',
        category: 'offer',
        title: 'Gramado (RS) - Natal Luz',
        text: `Explore o Natal Luz com Café Colonial incluso.
    12x de R$ 104.17!`,
        isPremium: false,
        tags: ['Nacional', 'Serra']
    },
    {
        id: 'off-03',
        category: 'offer',
        title: 'Maceió (AL) - Resort Pé na Areia',
        text: `Piscinas Naturais de Pajuçara e conforto total.
    12x de R$ 111.83!`,
        isPremium: false,
        tags: ['Nacional', 'Nordeste']
    },
    {
        id: 'off-04',
        category: 'offer',
        title: 'Orlando (EUA) - Disney & Universal',
        text: `8 dias de pura diversão com suporte em português.
    12x de R$ 566.67!`,
        isPremium: true,
        tags: ['Internacional', 'Família']
    },
    // --- RANKINGS ---
    {
        id: 'rank-01',
        category: 'ranking',
        title: 'Top 5 Destinos Nacionais 2024',
        text: `1. Rio de Janeiro\n2. Gramado\n3. Maceió\n4. Porto Seguro\n5. Natal`,
        isPremium: true,
        tags: ['Tendência']
    },
    // --- SCRIPTS ---
    {
        id: 'script-01',
        category: 'script',
        title: 'Quebra de Objeção: "Tá caro"',
        text: `Entendo perfeitamente. Valor e preço são coisas diferentes. No nosso pacote você tem segurança 24h e hotel central, o que economiza tempo e transporte...`,
        isPremium: true,
        tags: ['Vendas']
    },
    // --- CTAs ---
    {
        id: 'cta-01',
        category: 'cta',
        title: 'Frase de Impacto para Stories',
        text: `O mundo é grande demais para você ficar apenas em um lugar. Qual o seu próximo destino? ✈️`,
        isPremium: true,
        tags: ['Engajamento']
    }
];
