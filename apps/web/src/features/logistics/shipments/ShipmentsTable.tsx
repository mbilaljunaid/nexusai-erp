import React from 'react';
import { Shipment } from '@contracts/logistics/logistics.models';
import { usePredictEta } from './useShipments';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface ShipmentsTableProps {
    shipments: Shipment[];
}

export const ShipmentsTable: React.FC<ShipmentsTableProps> = ({ shipments }) => {
    const predictEtaMutation = usePredictEta();

    const handlePredictEta = (id: string) => {
        predictEtaMutation.mutate(id, {
            onSuccess: (data) => {
                alert(`New ETA: ${data.predictedEta}\nReason: ${data.reasoning}`);
            }
        });
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                        <TableCell className="font-mono text-xs">{shipment.id.slice(0, 8)}</TableCell>
                        <TableCell>{shipment.origin?.address || 'N/A'}</TableCell>
                        <TableCell>{shipment.destination?.address || 'N/A'}</TableCell>
                        <TableCell>
                            <Badge variant={shipment.status === 'DELIVERED' ? 'default' : 'secondary'}>
                                {shipment.status}
                            </Badge>
                        </TableCell>
                        <TableCell>{shipment.estimatedArrival ? new Date(shipment.estimatedArrival).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePredictEta(shipment.id)}
                                disabled={predictEtaMutation.isPending}
                            >
                                {predictEtaMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Predict Delay'}
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
