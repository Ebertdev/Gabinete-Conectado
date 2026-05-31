-- Execute no SQL Editor do Supabase para corrigir perfis de usuário

CREATE TABLE IF NOT EXISTS gabinetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL DEFAULT 'Meu Gabinete',
  plano TEXT NOT NULL DEFAULT 'Essencial',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'Assessor',
  gabinete_id UUID REFERENCES gabinetes(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE gabinetes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_select_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_insert_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_own" ON usuarios;
DROP POLICY IF EXISTS "gabinetes_select" ON gabinetes;

CREATE POLICY "usuarios_select_own" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "usuarios_insert_own" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "usuarios_update_own" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "gabinetes_select" ON gabinetes
  FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nome, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, ''), '@', 1), 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Assessor')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
