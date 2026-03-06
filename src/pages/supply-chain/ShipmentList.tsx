import React from 'react';
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Plus, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";

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
            id: "carrier",
            header: "Carrier",
            width: "150px",
            cell: (row: Shipment) => (
                <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span>{row.carrier}</span>
                </div>
            )
        },
        {
            id: "origin",
            header: "Origin",
            width: "150px",
            cell: (row: Shipment) => <span>{row.destination}</span>
        },
        {
            id: "shipmentNumber",
            header: "Shipment #",
            width: "150px",
            cell: (row: Shipment) => <span className="font-semibold text-blue-600">{row.number}</span>
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
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
            id: "eta",
            header: "ETA",
            width: 150,
            cell: (row: Shipment) => <span>{row.eta}</span>
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
            <Card className="overflow-hidden shadow-sm">
                <InteractiveSpreadsheet
                    data={shipments}
                    columns={columns}
                    onChange={() => { }}
                    virtualized={true}
                    containerHeight="600px"
                />
            </Card>
        </StandardPage>
    );
}
