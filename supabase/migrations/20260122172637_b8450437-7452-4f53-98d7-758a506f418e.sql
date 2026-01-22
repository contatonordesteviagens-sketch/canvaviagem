-- =====================================================
-- CMS DATABASE SCHEMA - CANVATRIP
-- =====================================================

-- 1. ENUM PARA ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. TABELA DE ROLES (RBAC)
CREATE TABLE public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles (user_id);

-- 3. FUNÇÕES DE SEGURANÇA (Security Definer - evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 4. TABELA CONTENT_ITEMS (Templates, Vídeos, Stories, Feed)
CREATE TABLE public.content_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  url text NOT NULL,
  type text NOT NULL CHECK (type IN ('video', 'feed', 'story', 'seasonal', 'weekly-story', 'resource', 'download')),
  category text,
  subcategory text,
  image_url text,
  icon text DEFAULT '🎬',
  description text,
  is_new boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_content_items_type ON public.content_items (type);
CREATE INDEX idx_content_items_category ON public.content_items (category);
CREATE INDEX idx_content_items_is_active ON public.content_items (is_active);
CREATE INDEX idx_content_items_display_order ON public.content_items (display_order);

CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. TABELA CAPTIONS (Legendas)
CREATE TABLE public.captions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  destination text NOT NULL,
  text text NOT NULL,
  hashtags text NOT NULL,
  category text CHECK (category IN ('nacional', 'internacional')),
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_captions_category ON public.captions (category);
CREATE INDEX idx_captions_is_active ON public.captions (is_active);

CREATE TRIGGER update_captions_updated_at
  BEFORE UPDATE ON public.captions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. TABELA MARKETING_TOOLS (Ferramentas de IA)
CREATE TABLE public.marketing_tools (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  url text NOT NULL,
  icon text DEFAULT '🤖',
  description text,
  is_new boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TRIGGER update_marketing_tools_updated_at
  BEFORE UPDATE ON public.marketing_tools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. TABELA CONTENT_CLICKS (Rastreamento de Cliques)
CREATE TABLE public.content_clicks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  clicked_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX idx_content_clicks_content_id ON public.content_clicks (content_id);
CREATE INDEX idx_content_clicks_clicked_at ON public.content_clicks (clicked_at);
CREATE INDEX idx_content_clicks_content_type ON public.content_clicks (content_type);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- RLS para user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- RLS para content_items
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active content" ON public.content_items
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can read all content" ON public.content_items
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert content" ON public.content_items
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update content" ON public.content_items
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete content" ON public.content_items
  FOR DELETE USING (public.is_admin());

-- RLS para captions
ALTER TABLE public.captions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active captions" ON public.captions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can read all captions" ON public.captions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert captions" ON public.captions
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update captions" ON public.captions
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete captions" ON public.captions
  FOR DELETE USING (public.is_admin());

-- RLS para marketing_tools
ALTER TABLE public.marketing_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active tools" ON public.marketing_tools
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can read all tools" ON public.marketing_tools
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert tools" ON public.marketing_tools
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update tools" ON public.marketing_tools
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete tools" ON public.marketing_tools
  FOR DELETE USING (public.is_admin());

-- RLS para content_clicks
ALTER TABLE public.content_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own clicks" ON public.content_clicks
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can read all clicks" ON public.content_clicks
  FOR SELECT USING (public.is_admin());