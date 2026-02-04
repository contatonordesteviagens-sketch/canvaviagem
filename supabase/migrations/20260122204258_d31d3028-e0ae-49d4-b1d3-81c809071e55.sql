-- Tabela de histórico de alterações (audit log)
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_rolled_back BOOLEAN DEFAULT false
);

-- Índices para consultas rápidas
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_record_id ON audit_log(record_id);

-- RLS: Apenas admins podem ver e gerenciar o histórico
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit log"
ON audit_log FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can update audit log"
ON audit_log FOR UPDATE
USING (public.is_admin());

CREATE POLICY "System can insert audit log"
ON audit_log FOR INSERT
WITH CHECK (true);

-- Função genérica de auditoria
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  v_user_id := auth.uid();
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, user_id, user_email)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', NULL, to_jsonb(NEW), v_user_id, v_user_email);
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, user_id, user_email)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), v_user_id, v_user_email);
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, user_id, user_email)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), NULL, v_user_id, v_user_email);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers para cada tabela
CREATE TRIGGER audit_content_items
AFTER INSERT OR UPDATE OR DELETE ON content_items
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_captions
AFTER INSERT OR UPDATE OR DELETE ON captions
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_marketing_tools
AFTER INSERT OR UPDATE OR DELETE ON marketing_tools
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();