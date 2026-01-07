import { api } from '@shared/api';
import { Shipment } from '@contracts/logistics/logistics.models';

export const getShipments = async (): Promise<Shipment[]> => {
    const response = await api.get('/shipments');
    return response.data;
};

export const createShipment = async (data: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shipment> => {
    const response = await api.post('/shipments', data);
    return response.data;
};

export const predictShipmentEta = async (id: string): Promise<any> => {
    const response = await api.post(`/shipments/${id}/predict-eta`);
    return response.data;
};
