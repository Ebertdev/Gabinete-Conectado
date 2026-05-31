import { Demand } from '../domain/Demand';

export interface DemandRepository {
  create(demand: Demand): Promise<Demand>;
  findById(id: string): Promise<Demand | null>;
  findAll(filters?: unknown): Promise<Demand[]>;
  updateStatus(id: string, status: string): Promise<void>;
}
