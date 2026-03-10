
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Truck, Filter, Search, MoreHorizontal, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { StandardPage } from "@/components/layout/StandardPage";

// Mock API for Shipments
const fetchShipments = async () => {
    return [
        { id: "1", orderNumber: "ORD-1001", status: "AWAITING_SHIPPING", warehouse: "Main WH", items: 5 },
        { id: "2", orderNumber: "ORD-1003", status: "PICKED", warehouse: "East WH", items: 20 },
    ];
};

export function ShipmentWorkbench() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: shipments, isLoading } = useQuery<any>({ queryKey: ["om-shipments"], queryFn: fetchShipments });

    const columns: any[] = [
        { header: "Order #", accessorKey: "orderNumber" },
        { header: "Warehouse", accessorKey: "warehouse" },
        { header: "Lines", accessorKey: "items", cell: (info: any) => info.getValue() },
        {
            header: "Status", accessorKey: "status", cell: (info: any) => (
                <Badge variant={info.getValue() === "SHIPPED" ? "default" : "secondary"}>
                    {info.getValue()}
                </Badge>
            )
        },
        {
            id: "actions",
            cell: (info: any) => (
                <Button size="sm" variant="outline">
                    <Package className="mr-2 h-4 w-4" /> Process
                </Button>
            ),
        },
    ];

    return (
        <StandardPage title="Shipment Workbench">
            <div className="flex justify-between items-center">
                <div>
                    
                    <p className="text-muted-foreground">Pick, Pack, and Ship Orders.</p>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search shipments..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="vanguard-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                    <div>
                        <CardTitle>Shipment Queue</CardTitle>
                        <CardDescription>View and manage pending shipments</CardDescription>
                    </div>
                    <Button size="sm">
                        <Truck className="mr-2 h-4 w-4" /> Pick Wave
                    </Button>
                </CardHeader>
                <CardContent className="h-[500px] p-0">
                    <InteractiveSpreadsheet
                        data={shipments || []}
                        columns={columns}
                        onChange={() => { }}
                        virtualized={true}
                        containerHeight="500px"
                    />
                </CardContent>
            </Card>
        </StandardPage>
    );
}
