import React from 'react';
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Plus, Users, MapPin } from "lucide-react";
import { openFormInNewWindow } from "@/lib/formUtils";

interface Partner {
    id: string;
    name: string;
    type: string;
    location: string;
    status?: string;
}

export default function PartnerList() {
    const { data: partners = [] } = useQuery<Partner[]>({
        queryKey: ["/api/supply-chain/partners"],
        queryFn: async () => {
            // Mock fallback
            return [
                { id: "1", name: "Acme Logistics", type: "Carrier", location: "New York, USA", status: "Active" },
                { id: "2", name: "Global Supplies Inc", type: "Supplier", location: "Shanghai, CN", status: "Active" },
                { id: "3", name: "FastTrack Delivery", type: "Carrier", location: "London, UK", status: "Inactive" },
                { id: "4", name: "TechParts Ltd", type: "Supplier", location: "Berlin, DE", status: "Active" },
            ];
        }
    });

    const columns: any[] = [
        {
            id: "name",
            header: "Name",
            width: "200px",
            cell: (row: Partner) => (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-blue-600">{row.name}</span>
                </div>
            )
        },
        {
            id: "type",
            header: "Type",
            width: "150px",
            cell: (row: Partner) => <Badge variant="outline">{row.type}</Badge>
        },
        {
            id: "location",
            header: "Location",
            width: "200px",
            cell: (row: Partner) => (
                <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>{row.location}</span>
                </div>
            )
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (row: Partner) => (
                <Badge variant={row.status === 'Active' ? 'secondary' : 'destructive'} className="text-xs">
                    {row.status}
                </Badge>
            )
        }
    ];

    return (
        <StandardPage
            title="Supply Chain Partners"
            breadcrumbs={[{ label: "Supply Chain", href: "/supply-chain" }, { label: "Partners" }]}
            actions={
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Partner
                </Button>
            }
        >
            <div className="bg-white rounded-md shadow-sm border">
                <InteractiveSpreadsheet
                    data={partners}
                    columns={columns}
                    onChange={() => { }}
                    virtualized={true}
                    containerHeight="600px"
                />
            </div>
        </StandardPage>
    );
}
