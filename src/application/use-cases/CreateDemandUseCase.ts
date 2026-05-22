import { Demand } from '@/core/domain/Demand';
import { DemandRepository } from '@/core/repositories/DemandRepository';

export class CreateDemandUseCase {
  constructor(private demandRepository: DemandRepository) {}

  async execute(demandData: Omit<Demand, 'id' | 'status'>): Promise<Demand> {
    // Basic validation
    if (!demandData.citizen.name || !demandData.citizen.phone) {
      throw new Error('Citizen name and phone are required');
    }
    if (!demandData.description) {
      throw new Error('Demand description is required');
    }
    if (!demandData.location.latitude || !demandData.location.longitude) {
      throw new Error('Location is required');
    }

    const demandToCreate: Demand = {
      ...demandData,
      status: 'Registrada', // Default initial status
    };

    return this.demandRepository.create(demandToCreate);
  }
}
