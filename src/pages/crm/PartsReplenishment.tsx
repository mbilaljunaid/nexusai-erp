import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PackageOpen, Truck, RefreshCw, AlertTriangle, ArrowUpRight, Search, Settings2, PackageCheck } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export default function PartsReplenishment() {

    const inventory = [
        { id: "ITEM-912", name: "HVAC Filter AC-99", sku: "SK-00192", category: "Consumables", currentStock: 4, minThreshold: 10, unitCost: 22.50, status: "Critical" },
        { id: "ITEM-844", name: "Compressor Valve Set", sku: "SK-00441", category: "Critical Parts", currentStock: 12, minThreshold: 15, unitCost: 145.00, status: "Warning" },
        { id: "ITEM-721", name: "Wiring Harness 15ft", sku: "SK-00890", category: "Electrical", currentStock: 45, minThreshold: 20, unitCost: 18.00, status: "Healthy" },
        { id: "ITEM-650", name: "Coolant Tank 5Gal", sku: "SK-01005", category: "Fluids", currentStock: 2, minThreshold: 5, unitCost: 85.00, status: "Critical" },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Critical": return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none"><AlertTriangle className="h-3 w-3 mr-1" /> Order Now</Badge>;
            case "Warning": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none"><RefreshCw className="h-3 w-3 mr-1" /> Restock Soon</Badge>;
            case "Healthy": return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none"><PackageCheck className="h-3 w-3 mr-1" /> Sufficient</Badge>;
            default: return null;
        }
    };

    return (
        <StandardPage
            title="Van Stock Parts & Replenishment"
            description="Bridge the gap between Field Service execution and Supply Chain inventory management."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Field Service", href: "/crm/field-service" },
                { label: "Parts Replenishment" }
            ]}
            actions={
                <Button>
                    <ArrowUpRight className="h-4 w-4 mr-2" /> Generate Transfer Orders
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-l-4 border-l-primary bg-primary/5 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-primary mb-1">Active Tech Vans</p>
                        <p className="text-3xl font-black text-slate-800">42</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Critical Stock Alerts</p>
                        <p className="text-3xl font-black text-red-600">8</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Pending Transfers</p>
                        <p className="text-3xl font-black text-amber-600">14</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Payload Value</p>
                        <p className="text-3xl font-black text-slate-700">{formatCurrency(145000)}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border shadow-sm">
                    <CardHeader className="pb-4 border-b">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <PackageOpen className="h-5 w-5 text-primary" /> Aggregate Fleet Inventory
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead>Part / SKU</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-center">Current Stock</TableHead>
                                <TableHead className="text-center">Min Threshold</TableHead>
                                <TableHead>Health Strategy</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventory.map(item => (
                                <TableRow key={item.id} className="hover:bg-muted/10">
                                    <TableCell>
                                        <p className="font-bold text-slate-800">{item.name}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-slate-50">{item.category}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-lg">
                                        <span className={item.currentStock < item.minThreshold ? "text-red-600" : "text-emerald-600"}>{item.currentStock}</span>
                                    </TableCell>
                                    <TableCell className="text-center text-slate-500 font-medium">{item.minThreshold}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2 w-[120px]">
                                            {getStatusBadge(item.status)}
                                            <Progress
                                                value={(item.currentStock / (item.minThreshold * 2)) * 100}
                                                className={`h-1.5 ${item.status === 'Critical' ? 'bg-red-100' : 'bg-slate-100'}`}
                                                indicatorClassName={item.status === 'Critical' ? 'bg-red-500' : item.status === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <Card className="border shadow-sm bg-slate-50/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Truck className="h-5 w-5 text-primary" /> Auto-Replenishment Engine
                        </CardTitle>
                        <CardDescription>Rules triggering internal transfer orders from Main Warehouse to Fleet Sub-inventories.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border shadow-sm space-y-3 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-primary w-1.5 h-full"></div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-sm">Nightly Min-Max Run</h3>
                                <Badge className="bg-primary/10 text-primary border-none text-[10px]">Active</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Automatically scan all van sub-inventories at <b>23:00</b> local time. Draft Transfer Orders for any part below threshold.</p>
                            <Button variant="outline" size="sm" className="w-full text-xs h-7"><Settings2 className="h-3 w-3 mr-1" /> Rule Settings</Button>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border shadow-sm space-y-3 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-amber-500 w-1.5 h-full"></div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-sm">Priority Allocation</h3>
                                <Badge className="bg-amber-100 text-amber-800 border-none text-[10px]">Warning</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">If Main Warehouse stock is insufficient for all vans, allocate to technicians with Highest Scheduled Utilization first.</p>
                            <Button variant="outline" size="sm" className="w-full text-xs h-7"><Settings2 className="h-3 w-3 mr-1" /> Rule Settings</Button>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
