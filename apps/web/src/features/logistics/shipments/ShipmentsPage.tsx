import React from 'react';
import { useShipments, useCreateShipment } from './useShipments';
import { ShipmentsTable } from './ShipmentsTable';
import { ShipmentForm } from './ShipmentForm';

export function ShipmentsPage() {
    const { data: shipments, isLoading, error } = useShipments();
    const createShipment = useCreateShipment();

    const handleCreate = async (payload) => {
        await createShipment.mutateAsync(payload);
    };

    if (isLoading) return <div>Loading shipments...</div>;
    if (error) return <div>Error loading shipments: {error.message}</div>;

    return (
        <div>
            <h1>Shipments</h1>
            <ShipmentForm onSubmit={handleCreate} />
            <ShipmentsTable shipments={shipments || []} />
        </div>
    );
}
