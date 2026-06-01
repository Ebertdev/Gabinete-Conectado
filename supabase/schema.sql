-- Habilita a extensão PostGIS para dados geoespaciais
CREATE EXTENSION IF NOT EXISTS postgis;

-- Criação da tabela de Usuários (Assessores/Vereadores)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'assessor', -- 'vereador', 'assessor'
  permissions JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Cidadãos
CREATE TABLE citizens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  address TEXT,
  neighborhood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sequência para o número de protocolo (reiniciada anualmente, se necessário)
CREATE SEQUENCE IF NOT EXISTS demand_protocol_seq START 1;

-- Função para gerar o número do protocolo ex: CAM-2026-0001
CREATE OR REPLACE FUNCTION generate_protocol_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  next_val INT;
  protocol TEXT;
BEGIN
  current_year := to_char(now(), 'YYYY');
  next_val := nextval('demand_protocol_seq');
  protocol := 'CAM-' || current_year || '-' || lpad(next_val::TEXT, 4, '0');
  RETURN protocol;
END;
$$ LANGUAGE plpgsql;

-- Tabela de Demandas
CREATE TABLE demands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  citizen_id UUID REFERENCES citizens(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- Ex: 'Infraestrutura', 'Saúde', 'Educação'
  status TEXT NOT NULL DEFAULT 'Registrada', -- 'Registrada', 'Em Análise', 'Encaminhada', 'Resolvida', 'Arquivada'
  protocol_number TEXT UNIQUE NOT NULL DEFAULT generate_protocol_number(),
  
  -- Localização
  location_lat NUMERIC(10, 7),
  location_lon NUMERIC(10, 7),
  location_geom GEOMETRY(Point, 4326), -- PostGIS Point (Longitude, Latitude)
  location_address TEXT,
  neighborhood TEXT, -- Denormalizado para agilizar busca por bairro
  
  -- Controle de Datas
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expected_resolution_date TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  internal_notes TEXT,
  created_by UUID REFERENCES users(id)
);

-- Trigger/Função para atualizar a geometria (location_geom) automaticamente a partir da Lat/Lon
CREATE OR REPLACE FUNCTION update_demand_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location_lat IS NOT NULL AND NEW.location_lon IS NOT NULL THEN
    NEW.location_geom = ST_SetSRID(ST_MakePoint(NEW.location_lon, NEW.location_lat), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_demand_geom
BEFORE INSERT OR UPDATE ON demands
FOR EACH ROW EXECUTE FUNCTION update_demand_geom();

-- Criação de Índices Otimizados para o cenário de "Demandas por Bairro" e Mapas
CREATE INDEX idx_demands_neighborhood ON demands(neighborhood);
CREATE INDEX idx_demands_status ON demands(status);
CREATE INDEX idx_demands_geom ON demands USING GIST(location_geom); -- Índice Espacial

-- Tabela de Anexos (Fotos do Supabase Storage)
CREATE TABLE demand_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demand_id UUID REFERENCES demands(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT, -- Ex: 'image', 'video'
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Secretarias (Para Encaminhamentos)
CREATE TABLE secretariats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Encaminhamentos
CREATE TABLE demand_forwardings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demand_id UUID REFERENCES demands(id) ON DELETE CASCADE,
  forwarded_to_id UUID REFERENCES secretariats(id),
  forwarded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  forwarded_by UUID REFERENCES users(id)
);

-- Segurança Row Level Security (RLS) básica (Exemplo)
ALTER TABLE demands ENABLE ROW LEVEL SECURITY;
-- (Políticas específicas de CQRS/RLS iriam aqui, dependendo das permissões desejadas)
