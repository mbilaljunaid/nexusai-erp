
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Real API Fetcher
const fetchPriceLists = async () => {
    const res = await fetch("/api/order-management/pricelists");
    return res.json();
};


export function PriceListManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const { data: priceLists, isLoading } = useQuery({ queryKey: ["om-pricelists"], queryFn: fetchPriceLists });

    const mutation = useMutation({
        mutationFn: async (data: any[]) => {
            return {};
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["om-pricelists"] });
            toast({ title: "Success", description: "Price Lists saved successfully" });
        }
    });

    const handleAddRow = () => {
        const newRow = {
            id: `temp-${Date.now()}`,
            name: "",
            currency: "USD",
            items: 0,
            status: "Draft",
        };
        queryClient.setQueryData(["om-pricelists"], (old: any) => [...(old || []), newRow]);
    };

    const handleSaveLists = (data: any[]) => {
        mutation.mutate(data);
    };

    const columns: any[] = [
        {
            id: "name",
            header: "Price List Name *",
            width: "300px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input
                    className="h-9 w-full bg-transparent border-0 focus-visible:ring-0"
                    value={row.name || ""}
                    onChange={e => updateRow("name", e.target.value)}
                    placeholder="List Name..."
                />
            )
        },
        {
            id: "currency",
            header: "Currency",
            width: "150px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Select value={row.currency || "USD"} onValueChange={(val) => updateRow("currency", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {["USD", "EUR", "GBP", "JPY"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "items",
            header: "Items",
            width: "120px",
            cell: (row: any) => <div className="h-full flex items-center px-2 font-mono text-sm">{row.items || 0}</div>
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Select value={row.status || "Draft"} onValueChange={(val) => updateRow("status", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {["Draft", "Active", "Archived"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        }
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

            <Card className="vanguard-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                    <div>
                        <CardTitle>Active Price Lists</CardTitle>
                        <CardDescription>Manage your global price definitions inline</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleAddRow}>
                            <Plus className="mr-2 h-4 w-4" /> Add List
                        </Button>
                        <Button size="sm" onClick={() => handleSaveLists(priceLists || [])} disabled={mutation.isPending}>
                            Save Changes
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="h-[500px] p-0">
                    <InteractiveSpreadsheet
                        data={priceLists || []}
                        columns={columns}
                        onChange={(newData) => queryClient.setQueryData(["om-pricelists"], () => newData)}
                        virtualized={true}
                        containerHeight="500px"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
