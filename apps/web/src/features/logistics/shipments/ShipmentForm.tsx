import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ShipmentFormProps {
    onSubmit: (data: any) => void;
}

export const ShipmentForm: React.FC<ShipmentFormProps> = ({ onSubmit }) => {
    const { register, handleSubmit, reset } = useForm();

    const onSubmitForm = (data: any) => {
        // Format data to match Shipment interface with JSON fields
        const payload = {
            tenantId: 'default-tenant', // Mock
            origin: { address: data.originAddress },
            destination: { address: data.destinationAddress },
            status: 'PLANNED',
            weightKg: parseFloat(data.weightKg),
            volumeM3: parseFloat(data.volumeM3),
            scheduledPickup: data.scheduledPickup,
            scheduledDelivery: data.scheduledDelivery,
        };
        onSubmit(payload);
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 mb-8 p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="originAddress">Origin Address</Label>
                    <Input id="originAddress" {...register("originAddress", { required: true })} placeholder="123 Start St" />
                </div>
                <div>
                    <Label htmlFor="destinationAddress">Destination Address</Label>
                    <Input id="destinationAddress" {...register("destinationAddress", { required: true })} placeholder="456 End Ln" />
                </div>
                <div>
                    <Label htmlFor="weightKg">Weight (kg)</Label>
                    <Input id="weightKg" type="number" step="0.1" {...register("weightKg", { required: true })} />
                </div>
                <div>
                    <Label htmlFor="volumeM3">Volume (m3)</Label>
                    <Input id="volumeM3" type="number" step="0.01" {...register("volumeM3", { required: true })} />
                </div>
                <div>
                    <Label htmlFor="scheduledPickup">Pickup Date</Label>
                    <Input id="scheduledPickup" type="datetime-local" {...register("scheduledPickup", { required: true })} />
                </div>
                <div>
                    <Label htmlFor="scheduledDelivery">Delivery Date</Label>
                    <Input id="scheduledDelivery" type="datetime-local" {...register("scheduledDelivery", { required: true })} />
                </div>
            </div>
            <Button type="submit">Create Shipment</Button>
        </form>
    );
};
