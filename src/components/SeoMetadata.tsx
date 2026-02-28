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
    url = "https://canvaviagem.com.br/",
    type = "website",
}: SeoMetadataProps) => {
    const baseTitle = "Canva Viagem | Templates e IA para Agências";
    const fullTitle = title ? `${title} | Canva Viagem` : baseTitle;
    const defaultDesc = "Acelere suas vendas com templates profissionais e inteligência artificial especializada em turismo.";

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
