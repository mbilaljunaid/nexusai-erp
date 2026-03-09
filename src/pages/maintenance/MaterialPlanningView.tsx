import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { materialService } from "@/services/maintenance.service";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Package,
    AlertTriangle,
    TrendingDown,
    ShoppingCart,
    FileText,
    CheckCircle2,
    Clock,
    Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

interface MaterialItem {
    id: string;
    itemCode: string;
    description: string;
    uom: string;
    onHand: number;
    reserved: number;
    available: number;
    reorderPoint: number;
    reorderQty: number;
    leadTimeDays: number;
    status: "OK" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";
    lastPurchasePrice: number;
    avgMonthlyUsage: number;
}

interface PurchaseRequisition {
    id: string;
    prNumber: string;
    itemCode: string;
    description: string;
    quantity: number;
    uom: string;
    estimatedCost: number;
    requestedBy: string;
    status: "DRAFT" | "SUBMITTED" | "APPROVED" | "ORDERED";
    createdDate: string;
    approvedDate?: string;
}

interface MaterialReservation {
    id: string;
    woNumber: string;
    itemCode: string;
    description: string;
    quantityReserved: number;
    uom: string;
    reservedBy: string;
    reservedDate: string;
    status: "ACTIVE" | "ISSUED" | "CANCELLED";
}

export function MaterialPlanningView() {
    const [materials, setMaterials] = useState<MaterialItem[]>([]);
    const [purchaseReqs, setPurchaseReqs] = useState<PurchaseRequisition[]>([]);
    const [reservations, setReservations] = useState<MaterialReservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        loadMaterialData();
    }, []);

    const loadMaterialData = async () => {
        setLoading(true);
        try {
            // ✅ LIVE API CALLS - Get material inventory, purchase reqs, and reservations
            const [apiMaterials, apiPRs, apiReservations] = await Promise.all([
                materialService.getMaterials(),
                materialService.getPurchaseRequisitions(),
                materialService.getReservations()
            ]);

            setMaterials(apiMaterials);
            setPurchaseReqs(apiPRs);
            setReservations(apiReservations);
        } catch (error) {
            // Fallback to empty arrays
            setMaterials([]);
            setPurchaseReqs([]);
            setReservations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePR = async (materialId: string) => {
        try {
            // ✅ LIVE API CALL - Generate purchase requisition
            const newPR = await materialService.generatePR(materialId);

            // Refresh data to show new PR
            await loadMaterialData();

            toast({
                title: "PR Generated",
                description: `Purchase Requisition generated for material.`
            });
        } catch (error: any) {
            toast({
                title: "PR Generation Failed",
                description: error.message || "An error occurred.",
                variant: "destructive"
            });
        }
    };

    const handleSubmitPR = async (prId: string) => {
        try {
            // ✅ LIVE API CALL - Submit purchase requisition
            await materialService.submitPR(prId);

            // Refresh data to show updated status
            await loadMaterialData();

            toast({
                title: "PR Submitted",
                description: `Purchase Requisition has been submitted for approval.`
            });
        } catch (error: any) {
            toast({
                title: "Submission Failed",
                description: error.message || "An error occurred.",
                variant: "destructive"
            });
        }
    };

    const getStatusConfig = (status: MaterialItem["status"]) => {
        switch (status) {
            case "OK":
                return { color: "bg-green-100 text-green-800", icon: CheckCircle2, label: "OK", priority: 4 };
            case "LOW":
                return { color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle, label: "Low Stock", priority: 3 };
            case "CRITICAL":
                return { color: "bg-orange-100 text-orange-800", icon: AlertTriangle, label: "Critical", priority: 2 };
            case "OUT_OF_STOCK":
                return { color: "bg-red-100 text-red-800", icon: TrendingDown, label: "Out of Stock", priority: 1 };
        }
    };

    const getPRStatusConfig = (status: PurchaseRequisition["status"]) => {
        switch (status) {
            case "ORDERED":
                return { color: "bg-green-100 text-green-800", icon: CheckCircle2, label: "Ordered" };
            case "APPROVED":
                return { color: "bg-blue-100 text-blue-800", icon: CheckCircle2, label: "Approved" };
            case "SUBMITTED":
                return { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Submitted" };
            case "DRAFT":
                return { color: "bg-muted text-foreground", icon: FileText, label: "Draft" };
        }
    };

    const filteredMaterials = materials
        .filter(mat => statusFilter === "all" || mat.status === statusFilter)
        .filter(mat =>
            searchTerm === "" ||
            mat.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mat.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => getStatusConfig(a.status).priority - getStatusConfig(b.status).priority);

    const criticalCount = materials.filter(m => m.status === "CRITICAL" || m.status === "OUT_OF_STOCK").length;
    const lowStockCount = materials.filter(m => m.status === "LOW").length;

    // Chart data for inventory status
    const chartData = materials.map(m => ({
        name: m.itemCode,
        onHand: m.onHand,
        reserved: m.reserved,
        available: m.available,
        reorderPoint: m.reorderPoint
    }));

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Material Planning</h1>
                <p className="text-muted-foreground">Manage inventory levels, reorder points, and procurement</p>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-muted-foreground">Total Items</div>
                            <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold">{materials.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-muted-foreground">Critical/Out</div>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
                        <div className="text-xs text-muted-foreground mt-1">Require immediate action</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-muted-foreground">Low Stock</div>
                            <TrendingDown className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="text-3xl font-bold text-yellow-600">{lowStockCount}</div>
                        <div className="text-xs text-muted-foreground mt-1">Below reorder point</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-muted-foreground">Active PRs</div>
                            <ShoppingCart className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-3xl font-bold text-green-600">{purchaseReqs.length}</div>
                        <div className="text-xs text-muted-foreground mt-1">Purchase requisitions</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="inventory" className="w-full">
                <TabsList>
                    <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
                    <TabsTrigger value="reorder">Reorder Dashboard</TabsTrigger>
                    <TabsTrigger value="pr">Purchase Requisitions</TabsTrigger>
                    <TabsTrigger value="reservations">Reservations</TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Search by item code or description..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                                        <SelectItem value="CRITICAL">Critical</SelectItem>
                                        <SelectItem value="LOW">Low Stock</SelectItem>
                                        <SelectItem value="OK">OK</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Material Cards */}
                    <div className="space-y-3">
                        {filteredMaterials.map(material => {
                            const statusConfig = getStatusConfig(material.status);
                            const StatusIcon = statusConfig.icon;
                            const stockPercent = material.reorderPoint > 0 ? (material.available / material.reorderPoint) * 100 : 100;

                            return (
                                <Card key={material.id} className={cn(material.status === "CRITICAL" || material.status === "OUT_OF_STOCK" ? "border-l-4 border-l-red-500" : "")}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-mono font-bold">{material.itemCode}</span>
                                                    <Badge variant="outline" className={statusConfig.color}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {statusConfig.label}
                                                    </Badge>
                                                </div>
                                                <div className="font-medium mb-1">{material.description}</div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-4 gap-4 mb-3 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">On Hand:</span>
                                                <div className="font-bold">{material.onHand} {material.uom}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Reserved:</span>
                                                <div className="font-bold">{material.reserved} {material.uom}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Available:</span>
                                                <div className="font-bold text-green-600">{material.available} {material.uom}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Reorder Point:</span>
                                                <div className="font-bold">{material.reorderPoint} {material.uom}</div>
                                            </div>
                                        </div>

                                        {/* Stock Level Bar */}
                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                <span>Stock Level</span>
                                                <span>{stockPercent.toFixed(0)}% of reorder point</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full transition-all",
                                                        stockPercent >= 100 ? "bg-green-600" :
                                                            stockPercent >= 50 ? "bg-yellow-600" :
                                                                "bg-red-600"
                                                    )}
                                                    style={{ width: `${Math.min(stockPercent, 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-sm border-t pt-3">
                                            <div className="text-muted-foreground">
                                                Avg Usage: {material.avgMonthlyUsage}/{material.uom}/mo • Lead Time: {material.leadTimeDays} days • Last Price: ${material.lastPurchasePrice}
                                            </div>
                                            {(material.status === "CRITICAL" || material.status === "OUT_OF_STOCK" || material.status === "LOW") && (
                                                <Button size="sm" onClick={() => handleGeneratePR(material.id)}>
                                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                                    Generate PR
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="reorder" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Inventory Levels vs. Reorder Points</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="available" fill="#22c55e" name="Available" />
                                    <Bar dataKey="reserved" fill="#eab308" name="Reserved" />
                                    <Bar dataKey="reorderPoint" fill="#3b82f6" name="Reorder Point" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-4">
                        {materials.filter(m => m.status !== "OK").map(material => {
                            const daysOfStock = material.avgMonthlyUsage > 0 ? (material.available / material.avgMonthlyUsage) * 30 : 999;
                            return (
                                <Card key={material.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="font-mono text-sm font-bold mb-1">{material.itemCode}</div>
                                                <div className="text-sm">{material.description}</div>
                                            </div>
                                            <Badge variant="outline" className={getStatusConfig(material.status).color}>
                                                {getStatusConfig(material.status).label}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Days of Stock Remaining:</span>
                                                <span className="font-bold">{daysOfStock < 999 ? Math.floor(daysOfStock) : "∞"} days</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Suggested Order Qty:</span>
                                                <span className="font-bold">{material.reorderQty} {material.uom}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Estimated Cost:</span>
                                                <span className="font-bold">${(material.reorderQty * material.lastPurchasePrice).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="pr" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Purchase Requisitions ({purchaseReqs.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {purchaseReqs.map(pr => {
                                    const statusConfig = getPRStatusConfig(pr.status);
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <div key={pr.id} className="border rounded p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="font-mono font-bold">{pr.prNumber}</span>
                                                        <Badge variant="outline" className={statusConfig.color}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {statusConfig.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="font-medium mb-1">{pr.description}</div>
                                                    <div className="text-sm text-muted-foreground">Item: {pr.itemCode}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-green-600">${pr.estimatedCost}</div>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-3 gap-3 text-sm mb-3">
                                                <div>
                                                    <span className="text-muted-foreground">Quantity:</span> {pr.quantity} {pr.uom}
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Requested By:</span> {pr.requestedBy}
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Created:</span> {pr.createdDate}
                                                </div>
                                            </div>

                                            {pr.status === "DRAFT" && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => handleSubmitPR(pr.id)}>
                                                        Submit for Approval
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        Edit
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reservations" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Material Reservations ({reservations.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {reservations.map(reservation => (
                                    <div key={reservation.id} className="border rounded p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-mono font-bold">{reservation.woNumber}</span>
                                                    <Badge variant="outline" className={
                                                        reservation.status === "ISSUED" ? "bg-green-100 text-green-800" :
                                                            reservation.status === "CANCELLED" ? "bg-muted text-foreground" :
                                                                "bg-blue-100 text-blue-800"
                                                    }>
                                                        {reservation.status === "ACTIVE" && <Lock className="h-3 w-3 mr-1" />}
                                                        {reservation.status}
                                                    </Badge>
                                                </div>
                                                <div className="font-medium mb-1">{reservation.description}</div>
                                                <div className="text-sm text-muted-foreground">Item: {reservation.itemCode}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold">{reservation.quantityReserved} {reservation.uom}</div>
                                                <div className="text-xs text-muted-foreground">Reserved</div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground border-t pt-2">
                                            Reserved by: {reservation.reservedBy} • Date: {reservation.reservedDate}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default MaterialPlanningView;
