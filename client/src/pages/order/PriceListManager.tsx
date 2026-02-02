
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StandardTable } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";

// Real API Fetcher
const fetchPriceLists = async () => {
    const res = await fetch("/api/order-management/pricelists");
    return res.json();
};


export function PriceListManager() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: priceLists, isLoading } = useQuery({ queryKey: ["om-pricelists"], queryFn: fetchPriceLists });

    const columns: any[] = [
        { header: "Price List Name", accessorKey: "name" },
        { header: "Currency", accessorKey: "currency" },
        { header: "Items", accessorKey: "items" },
        {
            header: "Status", accessorKey: "status", cell: (info: any) => (
                <Badge variant={info.getValue() === "Active" ? "default" : "secondary"}>
                    {info.getValue()}
                </Badge>
            )
        },
        {
            id: "actions",
            cell: (info: any) => (
                <Button size="sm" variant="ghost">Edit</Button>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Price List Management</h1>
                    <p className="text-muted-foreground">Manage Price Lists, Items, and Discounts.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Price List
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search Price Lists..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <StandardTable data={priceLists || []} columns={columns} isLoading={isLoading} />
                </CardContent>
            </Card>
        </div>
    );
}
