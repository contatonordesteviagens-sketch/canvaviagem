export interface ContentLibraryItem {
    id: string;
    category: 'offer' | 'ranking' | 'script' | 'cta';
    title: string;
    text: string;
    isPremium: boolean;
    tags: string[];
}

export const contentLibraryES: ContentLibraryItem[] = [
    // --- OFERTAS (3 Gratis, el resto Premium) ---
    {
        id: 'off-es-01',
        category: 'offer',
        title: 'Río de Janeiro - Paquete Completo',
        text: `Descubre las maravillas de Río con Aéreo + Hotel + Cristo Redentor. 
    ¡12 cuotas de R$ 57.83 sin interés!`,
        isPremium: false,
        tags: ['Destino Top', 'Playa']
    },
    {
        id: 'off-es-02',
        category: 'offer',
        title: 'Cancún - Paraíso All Inclusive',
        text: `Disfruta de las mejores playas del Caribe con todo incluido.
    ¡Oferta exclusiva para agencias!`,
        isPremium: false,
        tags: ['Caribe', 'Lujo']
    },
    {
        id: 'off-es-03',
        category: 'offer',
        title: 'Punta Cana - Relax Total',
        text: `Paquete completo con traslados y hotel frente al mar.
    ¡Consulta condiciones especiales!`,
        isPremium: false,
        tags: ['Caribe', 'Familia']
    },
    {
        id: 'off-es-04',
        category: 'offer',
        title: 'Orlando - Disney & Universal',
        text: `8 días de pura diversión con soporte en español garantizado.
    ¡Vive la magia!`,
        isPremium: true,
        tags: ['Internacional', 'Parques']
    },
    // --- RANKINGS ---
    {
        id: 'rank-es-01',
        category: 'ranking',
        title: 'Top 10 Destinos más Vendidos 2024',
        text: `1. Cancún\n2. Punta Cana\n3. Orlando\n4. Río de Janeiro\n5. Madrid`,
        isPremium: true,
        tags: ['Tendencia']
    },
    // --- SCRIPTS ---
    {
        id: 'script-es-01',
        category: 'script',
        title: 'Manejo de Objeciones: "Es muy caro"',
        text: `Entiendo perfectamente. Valor y precio son conceptos diferentes. En nuestro paquete tienes seguridad 24h y hotel central, lo que te ahorra tiempo y transporte...`,
        isPremium: true,
        tags: ['Ventas']
    },
    // --- CTAs ---
    {
        id: 'cta-es-01',
        category: 'cta',
        title: 'Frase de Impacto para Stories',
        text: `El mundo es demasiado grande para quedarse en un solo lugar. ¿Cuál es tu próximo destino? ✈️`,
        isPremium: true,
        tags: ['Engagement']
    }
];
