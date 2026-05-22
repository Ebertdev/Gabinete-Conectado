export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  neighborhood?: string;
}

export interface CitizenInfo {
  name: string;
  phone: string;
  address?: string;
}

export interface Demand {
  id?: string;
  citizen: CitizenInfo;
  description: string;
  type: string;
  status: string;
  protocolNumber?: string;
  location: Location;
  attachments?: string[];
  registeredAt?: Date;
}
