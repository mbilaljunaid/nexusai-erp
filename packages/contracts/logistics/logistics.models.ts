export interface Shipment {
  id: string;
  tenantId: string;
  origin: {
    address: string;
    lat?: number;
    lng?: number;
  };
  destination: {
    address: string;
    lat?: number;
    lng?: number;
  };
  status: 'PLANNED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'EXCEPTION';
  carrierId?: string;
  vehicleId?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Route {
  id: string;
  tenantId: string;
  vehicleId: string;
  stops: any[];
}
