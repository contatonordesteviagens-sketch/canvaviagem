-- Adicionar coluna is_featured para marcar mídias em destaque
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Adicionar coluna language para idioma
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt';

-- Índice para consultas de destaque
CREATE INDEX IF NOT EXISTS idx_content_items_featured 
ON content_items(is_featured) WHERE is_featured = true;

-- Índice para consultas por idioma
CREATE INDEX IF NOT EXISTS idx_content_items_language 
ON content_items(language);