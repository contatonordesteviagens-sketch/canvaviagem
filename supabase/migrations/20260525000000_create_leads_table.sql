-- Criação da tabela de leads (Mini SDR)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    destino_interesse TEXT,
    numero_viajantes INTEGER,
    data_ida DATE,
    data_volta DATE,
    observacoes TEXT,
    status TEXT DEFAULT 'novo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- Permitir que o site gerado insira novos leads via anon key (desde que o user_id esteja presente)
CREATE POLICY "Enable insert for everyone" ON public.leads
    FOR INSERT WITH CHECK (true);

-- Permitir que o dono da agência veja seus próprios leads
CREATE POLICY "Enable select for users based on user_id" ON public.leads
    FOR SELECT USING (auth.uid() = user_id);

-- Permitir que o dono da agência atualize seus próprios leads (ex: mudar status)
CREATE POLICY "Enable update for users based on user_id" ON public.leads
    FOR UPDATE USING (auth.uid() = user_id);

-- Permitir que o dono da agência exclua seus próprios leads
CREATE POLICY "Enable delete for users based on user_id" ON public.leads
    FOR DELETE USING (auth.uid() = user_id);
