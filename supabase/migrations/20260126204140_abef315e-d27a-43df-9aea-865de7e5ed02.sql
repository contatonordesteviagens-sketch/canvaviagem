-- Adicionar campo language na tabela profiles com check constraint
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language text DEFAULT 'pt' 
CHECK (language IN ('pt', 'en', 'es'));

-- Criar índices para performance de consultas por idioma e email
CREATE INDEX IF NOT EXISTS idx_profiles_language ON profiles(language);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Criar índice em subscriptions por stripe_customer_id (já pode existir)
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);