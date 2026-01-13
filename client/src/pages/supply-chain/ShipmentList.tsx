import React from 'react';
import { StandardTable } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Plus, Truck } from "lucide-react";

interface Shipment {
    id: string;
    number: string;
    destination: string;
    status: "pending" | "in-transit" | "delivered" | "exception";
    carrier?: string;
    eta?: string;
}

export default function ShipmentList() {
    const { data: shipments = [] } = useQuery<Shipment[]>({
        queryKey: ["/api/supply-chain/shipments"],
        queryFn: async () => {
            // Mock fallback
            return [
                { id: "101", number: "SHP-001", destination: "Warehouse A", status: "in-transit", carrier: "Acme Logistics", eta: "2025-01-15" },
                { id: "102", number: "SHP-002", destination: "Retail Store 55", status: "pending", carrier: "Pending", eta: "2025-01-20" },
                { id: "103", number: "SHP-003", destination: "Distribution Center", status: "delivered", carrier: "FastTrack", eta: "2025-01-10" },
            ];
        }
    });

    const columns: any[] = [
        {
            header: "Shipment #",
            accessorKey: "number",
            cell: (row: Shipment) => (
                <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span className="font-mono font-bold">{row.number}</span>
                </div>
            )
        },
        {
            header: "Destination",
            accessorKey: "destination",
        },
        {
            header: "Carrier",
            accessorKey: "carrier",
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: Shipment) => {
                const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
                    "in-transit": "default",
                    "pending": "secondary",
                    "delivered": "outline",
                    "exception": "destructive"
                };
                return <Badge variant={variants[row.status] || "secondary"} className="capitalize">{row.status}</Badge>;
            }
        },
        {
            header: "ETA",
            accessorKey: "eta",
        }
    ];

    return (
        <StandardPage
            title="Active Shipments"
            breadcrumbs={[{ label: "Supply Chain", href: "/supply-chain" }, { label: "Shipments" }]}
            actions={
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Shipment
                </Button>
            }
        >
            <StandardTable
                data={shipments}
                columns={columns}
                keyExtractor={(item) => item.id}
                filterColumn="number"
                filterPlaceholder="Search shipment #..."
            />
        </StandardPage>
    );
}
