-- Migration para habilitar permissões unitárias por usuário

ALTER TABLE IF EXISTS usuarios
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT NULL;
