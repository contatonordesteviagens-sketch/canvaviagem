-- Add language column to captions table
ALTER TABLE public.captions 
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt';

-- Add language column to marketing_tools table
ALTER TABLE public.marketing_tools 
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt';

-- Update existing rows to 'pt' if null
UPDATE public.captions SET language = 'pt' WHERE language IS NULL;
UPDATE public.marketing_tools SET language = 'pt' WHERE language IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_captions_language ON public.captions(language);
CREATE INDEX IF NOT EXISTS idx_marketing_tools_language ON public.marketing_tools(language);