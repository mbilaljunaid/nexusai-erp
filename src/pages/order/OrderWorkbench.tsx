import { formatDate } from "@/lib/dateUtils";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Filter, Search, MoreHorizontal, FileText, ArrowRight } from "lucide-react";
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

// Mock API for now - replace with real API call
const fetchOrders = async () => {
    const response = await fetch("/api/order-management/orders");
    if (!response.ok) throw new Error("Failed to fetch orders");
    return response.json();
};

export function OrderWorkbench() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: orders, isLoading } = useQuery<any>({ queryKey: ["om-orders"], queryFn: fetchOrders });

    const columns: any[] = [
        {
            header: "Order Number", accessorKey: "orderNumber", cell: (info: any) => (
                <Link href={`/order-management/${info.row.original.id}`} className="text-primary hover:underline font-medium">
                    {info.getValue()}
                </Link>
            )
        },
        { header: "Customer", accessorKey: "customerName" },
        { header: "Date", accessorKey: "orderedDate", cell: (info: any) => formatDate(info.getValue()) },
        { header: "Total", accessorKey: "totalAmount", cell: (info: any) => `$${Number(info.getValue()).toFixed(2)}` },
        {
            header: "Status", accessorKey: "status", cell: (info: any) => (
                <Badge variant={info.getValue() === "BOOKED" ? "default" : "secondary"}>
                    {info.getValue()}
                </Badge>
            )
        },
        {
            id: "actions",
            cell: (info: any) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Order</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <StandardPage title="Order Management">
            <div className="flex justify-between items-center">
                <div>
                    
                    <p className="text-muted-foreground">Manage Sales Orders, Fulfillment, and Pricing.</p>
                </div>
                <Link href="/order-management/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Order
                    </Button>
                </Link>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search orders..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="vanguard-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                    <div>
                        <CardTitle>Sales Orders</CardTitle>
                        <CardDescription>View and manage your order pipeline</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="h-[500px] p-0">
                    <InteractiveSpreadsheet
                        data={orders || []}
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
