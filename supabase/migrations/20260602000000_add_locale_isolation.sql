-- Camada 5 de Segurança: Isolamento de Linguagem
-- Adiciona tags de locale para evitar vazamento de dados de projetos e leads

ALTER TABLE public.public_sites 
ADD COLUMN IF NOT EXISTS locale VARCHAR(10) DEFAULT 'pt-BR';

-- Se já existirem sites antes dessa migração, consideramos pt-BR
UPDATE public.public_sites SET locale = 'pt-BR' WHERE locale IS NULL;

-- Criar um index para optimizar as queries filtradas por idioma
CREATE INDEX IF NOT EXISTS idx_public_sites_locale ON public.public_sites (locale);

-- Para leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS locale VARCHAR(10) DEFAULT 'pt-BR';

UPDATE public.leads SET locale = 'pt-BR' WHERE locale IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_locale ON public.leads (locale);
