import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getShipments, createShipment, predictShipmentEta } from './shipments.api';
import { Shipment } from '@contracts/logistics/logistics.models';

export const useShipments = () => {
    return useQuery({
        queryKey: ['shipments'],
        queryFn: getShipments,
    });
};

export const useCreateShipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createShipment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
        },
    });
};

export const usePredictEta = () => {
    return useMutation({
        mutationFn: predictShipmentEta,
    });
};
