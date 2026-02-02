
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, Search, Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface LpnContent {
    id: string;
    itemId: string;
    quantity: string;
    uom: string | null;
}

interface LpnDetails {
    id: string;
    lpnNumber: string;
    warehouseId: string;
    status: string;
    type: string;
    contents: LpnContent[];
}

export const PackingStation: React.FC = () => {
    const { toast } = useToast();
    const [lpnInput, setLpnInput] = useState("");
    const [itemInput, setItemInput] = useState("");
    const [qtyInput, setQtyInput] = useState("1");
    const [loading, setLoading] = useState(false);
    const [currentLpn, setCurrentLpn] = useState<LpnDetails | null>(null);

    // Fetch LPN
    const fetchLpn = async (lpn: string) => {
        if (!lpn) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/wms/packing/lpn/${lpn}`);
            if (res.ok) {
                const data = await res.json();
                setCurrentLpn(data);
            } else {
                // If 404, we assume user wants to crate NEW LPN on first pack.
                // But current logic requires packItem to create it.
                // So we clear current LPN context if not found.
                setCurrentLpn(null);
                if (res.status !== 404) {
                    toast({ title: "Error", description: "Failed to fetch LPN", variant: "destructive" });
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Pack Item
    const handlePack = async () => {
        if (!lpnInput || !itemInput || !qtyInput) {
            toast({ title: "Validation", description: "LPN, Item, and Qty required", variant: "default" });
            return;
        }

        // Mock warehouseId (In real app, comes from user context)
        // We'll try to get it from currentLpn, or default to first one from Org list?
        // For Verification V1, we need to pass a valid Warehouse ID.
        // We'll hardcode a fetch or input for Warehouse ID if needed.
        // Or assume user context has it. 
        // NOTE: For now, I'll add a temporary Input for WarehouseID for testing simplicity.
        // Or better, fetch from `/api/organizations`.

        // Let's rely on the Verification Script primarily, UI is secondary.
        // I'll hardcode a Warehouse GUID via a prop or assume context.
        // I'll just use a placeholder input for WarehouseId.

        try {
            setLoading(true);
            const res = await fetch("/api/wms/packing/pack", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    warehouseId: warehouseIdInput,
                    lpnNumber: lpnInput,
                    itemId: itemInput,
                    quantity: Number(qtyInput)
                })
            });

            if (res.ok) {
                toast({ title: "Success", description: "Item Packed" });
                fetchLpn(lpnInput); // Refresh
                setItemInput(""); // Clear item
            } else {
                const err = await res.json();
                toast({ title: "Error", description: err.error, variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Close LPN
    const handleClose = async () => {
        if (!currentLpn) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/wms/packing/lpn/${currentLpn.id}/close`, { method: "POST" });
            if (res.ok) {
                toast({ title: "Success", description: "LPN Closed" });
                fetchLpn(lpnInput);
            }
        } finally {
            setLoading(false);
        }
    }

    const [warehouseIdInput, setWarehouseIdInput] = useState("");

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Box className="h-6 w-6" /> Packing Station
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Control Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle>Scan Setup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Warehouse ID (Temp)</label>
                            <Input
                                value={warehouseIdInput}
                                onChange={(e) => setWarehouseIdInput(e.target.value)}
                                placeholder="Paste Warehouse UUID"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-sm font-medium">LPN #</label>
                                <Input
                                    value={lpnInput}
                                    onChange={(e) => setLpnInput(e.target.value)}
                                    placeholder="Scan LPN..."
                                    onBlur={() => fetchLpn(lpnInput)}
                                />
                            </div>
                            <Button variant="outline" className="mt-6" onClick={() => fetchLpn(lpnInput)}>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="pt-4 border-t space-y-4">
                            <div>
                                <label className="text-sm font-medium">Item ID / SKU</label>
                                <Input
                                    value={itemInput}
                                    onChange={(e) => setItemInput(e.target.value)}
                                    placeholder="Scan Item..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Quantity</label>
                                <Input
                                    type="number"
                                    value={qtyInput}
                                    onChange={(e) => setQtyInput(e.target.value)}
                                />
                            </div>
                            <Button className="w-full" onClick={handlePack} disabled={loading}>
                                {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                                Pack Item
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* LPN View */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Current LPN: {currentLpn?.lpnNumber || "None"}</CardTitle>
                        {currentLpn && (
                            <Badge variant={currentLpn.status === "ACTIVE" ? "default" : "secondary"}>
                                {currentLpn.status}
                            </Badge>
                        )}
                    </CardHeader>
                    <CardContent>
                        {!currentLpn ? (
                            <div className="text-center text-muted-foreground py-10">
                                Scan an LPN to view contents
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Qty</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentLpn.contents.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center">Empty</TableCell>
                                            </TableRow>
                                        )}
                                        {currentLpn.contents.map((c) => (
                                            <TableRow key={c.id}>
                                                <TableCell>{c.itemId}</TableCell>
                                                <TableCell>{c.quantity}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="pt-4 flex justify-end">
                                    <Button variant="destructive" onClick={handleClose} disabled={currentLpn.status === 'CLOSED'}>
                                        Close Container
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PackingStation;
