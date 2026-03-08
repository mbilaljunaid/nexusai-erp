import { Link } from "wouter";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Warehouse, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const warehouses = [
    { id: "WH-001", name: "Main East Warehouse", location: "Dubai, UAE", capacity: 82, zones: 4, skus: 3240, status: "Active" },
    { id: "WH-002", name: "West Distribution Centre", location: "Abu Dhabi, UAE", capacity: 65, zones: 3, skus: 1820, status: "Active" },
    { id: "WH-003", name: "Cross-Dock Terminal", location: "Jebel Ali, UAE", capacity: 45, zones: 2, skus: 580, status: "Active" },
    { id: "WH-004", name: "Returns Processing", location: "Sharjah, UAE", capacity: 30, zones: 1, skus: 420, status: "Operational" },
];

function capacityColor(pct: number) {
    if (pct > 80) return "text-red-500";
    if (pct > 65) return "text-amber-500";
    return "text-green-500";
}

export default function InventoryReplenishmentPage() {
    return (
        <StandardPage
            title="Warehouse & Replenishment"
            description="Warehouse allocation overview and advanced WMS operations"
            breadcrumbs={[{ label: "Inventory", href: "/inventory" }, { label: "Warehouses / Replenishment" }]}
        >
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Warehouses", value: warehouses.length },
                        { label: "Total SKUs", value: warehouses.reduce((s, w) => s + w.skus, 0).toLocaleString() },
                        { label: "Avg Utilisation", value: `${Math.round(warehouses.reduce((s, w) => s + w.capacity, 0) / warehouses.length)}%` },
                        { label: "Active Regions", value: "1" },
                    ].map(kpi => (
                        <Card key={kpi.label}>
                            <CardContent className="flex flex-col items-center justify-center p-4">
                                <p className="text-2xl font-bold">{kpi.value}</p>
                                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {warehouses.map(wh => (
                        <Card key={wh.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle className="text-sm font-semibold">{wh.name}</CardTitle>
                                    <p className="text-xs text-muted-foreground">{wh.location}</p>
                                </div>
                                <Badge variant="outline">{wh.status}</Badge>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Capacity</span>
                                    <span className={`font-bold ${capacityColor(wh.capacity)}`}>{wh.capacity}%</span>
                                </div>
                                <Progress value={wh.capacity} className="h-2" />
                                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                    <span>{wh.zones} zones</span>
                                    <span>{wh.skus.toLocaleString()} SKUs</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="bg-blue-600 border-none shadow-lg shadow-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-base text-white flex items-center gap-2">
                            <Warehouse className="h-5 w-5" /> WMS Operations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-blue-100 text-sm">Access advanced warehouse management — wave planning, LPN tracking, slotting, and yard management.</p>
                        <div className="flex gap-2">
                            <Button variant="secondary" className="bg-card text-blue-600 hover:bg-blue-500/10" asChild>
                                <Link to="/scm/wms/operations">Enter Operations Workbench</Link>
                            </Button>
                            <Button variant="outline" className="border-blue-400 text-white hover:bg-blue-500" asChild>
                                <Link to="/scm/wms/dashboard">WMS Dashboard</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
