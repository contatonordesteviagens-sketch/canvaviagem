import { Helmet } from "react-helmet-async";

interface SeoMetadataProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: "website" | "article";
}

const SeoMetadata = ({
    title,
    description,
    keywords,
    image,
    url = "https://canvaviagem.com/",
    type = "website",
}: SeoMetadataProps) => {
    const baseTitle = "Canva Viagem | IA e Marketing para Agências de Viagens";
    const candidate = title ? `${title} | Canva Viagem` : baseTitle;
    const fullTitle = candidate.length > 60 && title ? title : candidate;
    const defaultDesc = "Crie anúncios com IA, páginas de venda, vídeos, artes, legendas e organize leads em uma plataforma feita para agências de viagens venderem mais.";

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDesc} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDesc} />
            {image && <meta property="og:image" content={image} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || defaultDesc} />
            {image && <meta name="twitter:image" content={image} />}

            <link rel="canonical" href={url} />
        </Helmet>
    );
};

export default SeoMetadata;
