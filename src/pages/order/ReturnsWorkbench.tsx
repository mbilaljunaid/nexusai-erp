
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StandardTable } from "@/components/ui/StandardTable";
import { Link } from "wouter";

// Mock API
const fetchRMAs = async () => {
    return [
        { id: "1", orderNumber: "RMA-ORD-1001-9922", originalOrder: "ORD-1001", status: "AWAITING_RECEIPT", date: "2024-02-01" },
    ];
};

export function ReturnsWorkbench() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: rmas, isLoading } = useQuery({ queryKey: ["om-rmas"], queryFn: fetchRMAs });

    const columns: any[] = [
        { header: "RMA #", accessorKey: "orderNumber" },
        { header: "Original Order", accessorKey: "originalOrder" },
        { header: "Date", accessorKey: "date" },
        {
            header: "Status", accessorKey: "status", cell: (info: any) => (
                <Badge variant="outline">
                    {info.getValue()}
                </Badge>
            )
        },
        {
            id: "actions",
            cell: (info: any) => (
                <Button size="sm" variant="ghost">View</Button>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Returns Management (RMA)</h1>
                    <p className="text-muted-foreground">Process Returns and Refunds.</p>
                </div>
                <Button>
                    <RefreshCw className="mr-2 h-4 w-4" /> Create RMA
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search RMAs..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <StandardTable
                        data={rmas || []}
                        columns={columns}
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
