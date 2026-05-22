import { Demand } from '@/core/domain/Demand';
import { DemandRepository } from '@/core/repositories/DemandRepository';
import { supabase } from '@/infrastructure/supabase/client';

export class SupabaseDemandRepository implements DemandRepository {
  async create(demand: Demand): Promise<Demand> {
    // 1. First, create or find the citizen
    const { data: citizenData, error: citizenError } = await supabase
      .from('citizens')
      .upsert(
        {
          name: demand.citizen.name,
          phone: demand.citizen.phone,
          address: demand.citizen.address,
        },
        { onConflict: 'phone' }
      )
      .select('id')
      .single();

    if (citizenError) throw new Error(`Citizen Error: ${citizenError.message}`);

    // 2. Insert the Demand
    const { data: demandData, error: demandError } = await supabase
      .from('demands')
      .insert({
        citizen_id: citizenData.id,
        description: demand.description,
        type: demand.type,
        status: demand.status || 'Registrada',
        location_lat: demand.location.latitude,
        location_lon: demand.location.longitude,
        location_address: demand.location.address,
        neighborhood: demand.location.neighborhood,
      })
      .select('*')
      .single();

    if (demandError) throw new Error(`Demand Error: ${demandError.message}`);

    // 3. Handle Attachments if any
    if (demand.attachments && demand.attachments.length > 0) {
      const attachmentsToInsert = demand.attachments.map((url) => ({
        demand_id: demandData.id,
        file_url: url,
        file_type: 'image', // simplified
      }));

      const { error: attachError } = await supabase
        .from('demand_attachments')
        .insert(attachmentsToInsert);

      if (attachError) throw new Error(`Attachment Error: ${attachError.message}`);
    }

    return {
      ...demand,
      id: demandData.id,
      protocolNumber: demandData.protocol_number,
      registeredAt: demandData.registered_at,
    };
  }

  async findById(id: string): Promise<Demand | null> {
    throw new Error('Method not implemented.');
  }

  async findAll(filters?: any): Promise<Demand[]> {
    throw new Error('Method not implemented.');
  }

  async updateStatus(id: string, status: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
