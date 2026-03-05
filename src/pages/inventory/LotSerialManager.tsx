import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, QrCode, Barcode } from "lucide-react";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EnterpriseContextSwitcher, buildScopeHeaders } from "@/components/enterprise/EnterpriseContextSwitcher";
import { StandardPage } from '@/components/layout/StandardPage';

export function LotSerialManager() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("lots");
    const [lotPage, setLotPage] = useState(1);
    const [serialPage, setSerialPage] = useState(1);
    const [pageSize] = useState(100);
    const [search, setSearch] = useState("");
    const [activeInvOrgId, setActiveInvOrgId] = useState<string | undefined>(undefined);

    const scopeHeaders = buildScopeHeaders({
        'inventory-org': activeInvOrgId,
    });

    // Queries
    const { data: lotsData, isLoading: lotsLoading } = useQuery<any>({
        queryKey: ["/api/inventory/lots", lotPage, pageSize, search, activeInvOrgId],
        queryFn: async () => {
            const query = new URLSearchParams();
            query.append("limit", pageSize.toString());
            query.append("offset", ((lotPage - 1) * pageSize).toString());
            if (search) query.append("search", search);

            const res = await fetch(`/api/inventory/lots?${query.toString()}`, {
                headers: { 'Content-Type': 'application/json', ...scopeHeaders }
            });
            if (!res.ok) throw new Error("Failed to fetch lots");
            return res.json();
        }
    });

    const { data: serialsData, isLoading: serialsLoading } = useQuery<any>({
        queryKey: ["/api/inventory/serials", serialPage, pageSize, search, activeInvOrgId],
        queryFn: async () => {
            const query = new URLSearchParams();
            query.append("limit", pageSize.toString());
            query.append("offset", ((serialPage - 1) * pageSize).toString());
            if (search) query.append("search", search);

            const res = await fetch(`/api/inventory/serials?${query.toString()}`, {
                headers: { 'Content-Type': 'application/json', ...scopeHeaders }
            });
            if (!res.ok) throw new Error("Failed to fetch serials");
            return res.json();
        }
    });

    const { data: items = [] } = useQuery<any>({
        queryKey: ["/api/inventory/items", activeInvOrgId],
        queryFn: async () => {
            const res = await fetch(`/api/inventory/products`, {
                headers: { 'Content-Type': 'application/json', ...scopeHeaders }
            });
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();
            return data.data || [];
        }
    });

    // Mutations
    const handleSaveLots = (rows: any[]) => {
        // Mock bulk save
        rows.forEach(row => {
            if (row.lotNumber && row.inventoryId && !row.id) {
                api.inventory.lots.create({
                    inventoryId: row.inventoryId,
                    lotNumber: row.lotNumber,
                    quantity: parseFloat(row.quantity) || 0
                });
            }
        });
        toast({ title: "Lots Updated", description: "Successfully saved bulk lots data." });
        queryClient.invalidateQueries({ queryKey: ["/api/inventory/lots"] });
    };

    const handleSaveSerials = (rows: any[]) => {
        // Mock bulk save
        rows.forEach(row => {
            if (row.serialNumber && row.inventoryId && !row.id) {
                api.inventory.serials.create({
                    inventoryId: row.inventoryId,
                    serialNumber: row.serialNumber
                });
            }
        });
        toast({ title: "Serials Updated", description: "Successfully saved bulk serials data." });
        queryClient.invalidateQueries({ queryKey: ["/api/inventory/serials"] });
    };

    const itemOptions = items.map((i: any) => ({ label: `${i.itemName} (${i.sku})`, value: i.id }));

    const handleAddLot = () => {
        const newRow = { id: `temp-${Date.now()}`, lotNumber: "", inventoryId: "", status: "Active", quantity: 0, expirationDate: "" };
        const oldLots = (lotsData?.data || []).map((lot: any) => ({ ...lot, inventoryId: lot.item?.id || lot.inventoryId }));
        queryClient.setQueryData(["/api/inventory/lots"], { ...lotsData, data: [...oldLots, newRow] });
    };

    const handleAddSerial = () => {
        const newRow = { id: `temp-${Date.now()}`, serialNumber: "", inventoryId: "", status: "Active", currentLocatorId: "" };
        const oldSerials = (serialsData?.data || []).map((serial: any) => ({ ...serial, inventoryId: serial.item?.id || serial.inventoryId }));
        queryClient.setQueryData(["/api/inventory/serials"], { ...serialsData, data: [...oldSerials, newRow] });
    };

    const handleUpdateLotData = (newData: any[]) => {
        queryClient.setQueryData(["/api/inventory/lots"], { ...lotsData, data: newData });
    };

    const handleUpdateSerialData = (newData: any[]) => {
        queryClient.setQueryData(["/api/inventory/serials"], { ...serialsData, data: newData });
    };

    const lotColumns = [
        {
            id: "lotNumber",
            header: "Lot Number *",
            width: "200px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input className="h-9 w-full bg-transparent border-0" value={row.lotNumber || ""} onChange={e => updateRow("lotNumber", e.target.value)} placeholder="L-2024..." />
            )
        },
        {
            id: "inventoryId",
            header: "Item *",
            width: "250px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Select value={row.inventoryId} onValueChange={(val) => updateRow("inventoryId", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue placeholder="Select Item" />
                    </SelectTrigger>
                    <SelectContent>
                        {itemOptions.map((o: any) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "status",
            header: "Status",
            width: "120px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Select value={row.status || "Active"} onValueChange={(val) => updateRow("status", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {["Active", "Hold", "Expired"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "quantity",
            header: "Quantity",
            width: "120px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input type="number" className="h-9 w-full bg-transparent border-0" value={row.quantity || ""} onChange={e => updateRow("quantity", e.target.value)} />
            )
        },
        {
            id: "expirationDate",
            header: "Expiration Date",
            width: "150px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input type="date" className="h-9 w-full bg-transparent border-0" value={row.expirationDate ? new Date(row.expirationDate).toISOString().split('T')[0] : ""} onChange={e => updateRow("expirationDate", e.target.value)} />
            )
        }
    ];

    const serialColumns = [
        {
            id: "serialNumber",
            header: "Serial Number *",
            width: "250px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input className="h-9 w-full bg-transparent border-0" value={row.serialNumber || ""} onChange={e => updateRow("serialNumber", e.target.value)} placeholder="SN..." />
            )
        },
        {
            id: "inventoryId",
            header: "Item *",
            width: "250px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Select value={row.inventoryId} onValueChange={(val) => updateRow("inventoryId", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue placeholder="Select Item" />
                    </SelectTrigger>
                    <SelectContent>
                        {itemOptions.map((o: any) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Select value={row.status || "Active"} onValueChange={(val) => updateRow("status", val)}>
                    <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {["Active", "Defective", "In Transit"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "currentLocatorId",
            header: "Locator",
            width: "150px",
            cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
                <Input className="h-9 w-full bg-transparent border-0" value={row.currentLocatorId || ""} onChange={e => updateRow("currentLocatorId", e.target.value)} />
            )
        }
    ];

    return (
        <StandardPage
            title="Lot & Serial Operations"
            description="Manage granular inventory tracking and expiration."
            actions={
                <div className="flex items-center gap-4">
                    <EnterpriseContextSwitcher
                        type="inventory-org"
                        value={activeInvOrgId}
                        onChange={setActiveInvOrgId}
                    />
                </div>
            }
        >
            <div className="space-y-4">



                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="lots" className="flex items-center gap-2">
                            <Barcode className="h-4 w-4" /> Lot Control
                        </TabsTrigger>
                        <TabsTrigger value="serials" className="flex items-center gap-2">
                            <QrCode className="h-4 w-4" /> Serial Tracking
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-4 flex items-center gap-2 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={`Search ${activeTab}...`}
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <TabsContent value="lots" className="mt-0">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Active Lots</CardTitle>
                                <CardDescription>Expiration and quantity tracking by lot.</CardDescription>
                            </CardHeader>
                            <div className="flex justify-between items-center px-4 py-2 border-t">
                                <Button variant="outline" size="sm" onClick={handleAddLot}><Plus className="w-4 h-4 mr-2" /> Add Lot</Button>
                                <Button size="sm" onClick={() => handleSaveLots((lotsData?.data || []).map((lot: any) => ({ ...lot, inventoryId: lot.item?.id || lot.inventoryId })))}>Save Lots</Button>
                            </div>
                            <CardContent className="h-[500px] p-0 border-t">
                                <InteractiveSpreadsheet
                                    data={(lotsData?.data || []).map((lot: any) => ({
                                        ...lot,
                                        inventoryId: lot.item?.id || lot.inventoryId
                                    }))}
                                    columns={lotColumns}
                                    onChange={handleUpdateLotData}
                                    virtualized={true}
                                    containerHeight="500px"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="serials" className="mt-0">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Serial Registry</CardTitle>
                                <CardDescription>Individual unit tracking and lifecycle.</CardDescription>
                            </CardHeader>
                            <div className="flex justify-between items-center px-4 py-2 border-t">
                                <Button variant="outline" size="sm" onClick={handleAddSerial}><Plus className="w-4 h-4 mr-2" /> Add Serial</Button>
                                <Button size="sm" onClick={() => handleSaveSerials((serialsData?.data || []).map((serial: any) => ({ ...serial, inventoryId: serial.item?.id || serial.inventoryId })))}>Save Serials</Button>
                            </div>
                            <CardContent className="h-[500px] p-0 border-t">
                                <InteractiveSpreadsheet
                                    data={(serialsData?.data || []).map((serial: any) => ({
                                        ...serial,
                                        inventoryId: serial.item?.id || serial.inventoryId
                                    }))}
                                    columns={serialColumns}
                                    onChange={handleUpdateSerialData}
                                    virtualized={true}
                                    containerHeight="500px"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div >
        </StandardPage >
    );
}
