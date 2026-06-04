import { Demand } from '@/core/domain/Demand';
import { DemandRepository } from '@/core/repositories/DemandRepository';
import { supabase } from '@/infrastructure/supabase/client';

type PublicGabineteResponse = string | null;

function generateProtocol() {
  return `CAM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

export class SupabaseDemandRepository implements DemandRepository {
  private async getPublicGabineteId() {
    const envGabineteId = process.env.NEXT_PUBLIC_DEFAULT_GABINETE_ID;
    if (envGabineteId) return envGabineteId;

    const { data, error } = await supabase.rpc('get_public_gabinete_id');
    if (error) {
      throw new Error(`Gabinete Error: ${error.message}`);
    }

    const gabineteId = data as PublicGabineteResponse;
    if (!gabineteId) {
      throw new Error('Nenhum gabinete padrão encontrado para registrar a demanda.');
    }

    return gabineteId;
  }

  async create(demand: Demand): Promise<Demand> {
    const gabineteId = await this.getPublicGabineteId();
    const protocolNumber = generateProtocol();
    const cleanPhone = demand.citizen.phone.replace(/\D/g, '');

    const { error: citizenError } = await supabase
      .from('cidadaos')
      .insert({
        gabinete_id: gabineteId,
        nome: demand.citizen.name,
        telefone: cleanPhone,
        bairro: demand.location.neighborhood || 'Não informado',
        endereco: demand.citizen.address || demand.location.address || '',
        lgpd_consentimento: true,
        anotacoes: [
          {
            id: 'public-form',
            date: new Date().toLocaleDateString('pt-BR'),
            author: 'Voz de Camaçari',
            content: 'Cadastro criado automaticamente pelo formulário público.',
          },
        ],
      });

    if (citizenError) throw new Error(`Citizen Error: ${citizenError.message}`);

    const { error: demandError } = await supabase
      .from('demandas')
      .insert({
        gabinete_id: gabineteId,
        protocolo: protocolNumber,
        nome_cidadao: demand.citizen.name,
        telefone_cidadao: cleanPhone,
        tipo: demand.type,
        bairro: demand.location.neighborhood || 'Não informado',
        status: demand.status || 'Registrada',
        descricao: demand.description,
        endereco: demand.location.address || demand.citizen.address || '',
        anexos: demand.attachments || [],
        arquivado: false,
      });

    if (demandError) throw new Error(`Demand Error: ${demandError.message}`);

    return {
      ...demand,
      protocolNumber,
      registeredAt: new Date(),
    };
  }

  async findById(_id: string): Promise<Demand | null> {
    throw new Error('Method not implemented.');
  }

  async findAll(_filters?: unknown): Promise<Demand[]> {
    throw new Error('Method not implemented.');
  }

  async updateStatus(_id: string, _status: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
