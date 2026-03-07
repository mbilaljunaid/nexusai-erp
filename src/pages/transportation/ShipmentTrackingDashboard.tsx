import { formatDateTime } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
    MapPin, TrendingUp, AlertTriangle, CheckCircle2, Truck, Clock, Navigation, Target, Download
} from "lucide-react";
import { exportToExcel, exportToCSV } from "@/lib/exportUtils";
import { StandardPage } from "@/components/layout/StandardPage";
import { EmptyState } from "@/components/shared/EmptyState";


interface ShipmentTracking {
    id: string;
    shipmentId: string;
    currentStatus: string;
    latitude: string;
    longitude: string;
    lastUpdate: string;
    estimatedDelivery: string;
    confidencePercent: number;
    currentLocation?: string;
}

interface TrackingMilestone {
    id: string;
    shipmentId: string;
    milestoneType: string;
    location: string;
    timestamp: string;
    notes?: string;
}

interface TrackingAlert {
    id: string;
    shipmentId: string;
    alertType: string;
    severity: string;
    message: string;
    createdAt: string;
    acknowledgedAt?: string;
    acknowledgedBy?: string;
    resolvedAt?: string;
}

interface ActiveShipment {
    shipmentId: string;
    origin: string;
    destination: string;
    status: string;
    estimatedDelivery: string;
    confidencePercent: number;
}

export default function ShipmentTrackingDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
    const [filterSeverity, setFilterSeverity] = useState<string>("all");

    // Fetch active shipments
    const { data: activeShipments = [], isLoading: loadingShipments } = useQuery<ActiveShipment[]>({
        queryKey: ["/api/shipment-tracking/active"],
    });

    // Fetch alerts
    const { data: alerts = [] } = useQuery<TrackingAlert[]>({
        queryKey: ["/api/shipment-tracking/alerts", filterSeverity],
        queryFn: async () => {
            const params = filterSeverity !== "all" ? `?severity=${filterSeverity}` : "";
            const res = await fetch(`/api/shipment-tracking/alerts${params}`);
            if (!res.ok) return [];
            return res.json();
        },
    });

    // Acknowledge alert mutation
    const acknowledgeAlertMutation = useMutation({
        mutationFn: async (alertId: string) => {
            const res = await fetch(`/api/shipment-tracking/alerts/${alertId}/acknowledge`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: "current-user" }),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/shipment-tracking/alerts"] });
            toast({ title: "Alert Acknowledged", description: "Alert has been marked as seen" });
        },
    });

    // Resolve alert mutation
    const resolveAlertMutation = useMutation({
        mutationFn: async (alertId: string) => {
            const res = await fetch(`/api/shipment-tracking/alerts/${alertId}/resolve`, {
                method: "POST",
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/shipment-tracking/alerts"] });
            toast({ title: "Alert Resolved", description: "Alert issue has been resolved" });
        },
    });

    const activeCount = activeShipments.length;
    const onTimeCount = activeShipments.filter((s) => s.confidencePercent >= 80).length;
    const delayedCount = activeShipments.filter((s) => s.confidencePercent < 60).length;
    const unresolvedAlerts = alerts.filter((a) => !a.resolvedAt).length;

    const shipmentColumns = [
        { key: "shipmentId", label: "Shipment ID" },
        { key: "origin", label: "Origin" },
        { key: "destination", label: "Destination" },
        {
            key: "status",
            label: "Status",
            render: (val: string) => (
                <Badge variant={val === "IN_TRANSIT" ? "default" : "secondary"}>{val}</Badge>
            ),
        },
        {
            key: "estimatedDelivery",
            label: "ETA",
            render: (val: string) => {
                const eta = new Date(val);
                const now = new Date();
                const hoursRemaining = Math.max(0, (eta.getTime() - now.getTime()) / (1000 * 60 * 60));
                return (
                    <StandardPage title="Shipment Tracking">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{Math.round(hoursRemaining)}h</span>
                    </StandardPage>
                );
            },
        },
        {
            key: "confidencePercent",
            label: "Confidence",
            render: (val: number) => (
                <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden flex">
                        <svg width={`${Number(val)}%`} height="100%">
                            <rect width="100%" height="100%" className={val >= 80 ? "fill-green-500" : val >= 60 ? "fill-amber-500" : "fill-red-500"} />
                        </svg>
                    </div>
                    <span className="text-xs text-muted-foreground">{val}%</span>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div>

                <p className="text-muted-foreground">Real-time shipment monitoring and ETA management</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="map">Live Map</TabsTrigger>
                    <TabsTrigger value="shipments">Shipments</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts {unresolvedAlerts > 0 && `(${unresolvedAlerts})`}</TabsTrigger>
                </TabsList>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
                                <Truck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{activeCount}</div>
                                <p className="text-xs text-muted-foreground">Currently in transit</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">On-Time</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{onTimeCount}</div>
                                <p className="text-xs text-muted-foreground">
                                    {activeCount > 0 ? Math.round((onTimeCount / activeCount) * 100) : 0}% confidence ≥80%
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">At Risk</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-600">{delayedCount}</div>
                                <p className="text-xs text-muted-foreground">Confidence {'<'}60%</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                                <TrendingUp className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{unresolvedAlerts}</div>
                                <p className="text-xs text-muted-foreground">Require attention</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Shipments</CardTitle>
                            <CardDescription>Active shipments with ETA and confidence</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingShipments ? (
                                <p className="text-center py-8 text-muted-foreground">Loading shipments...</p>
                            ) : activeShipments.length === 0 ? (
                                <EmptyState compact title="No active shipments" />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {shipmentColumns.map((col) => (
                                                <TableHead key={col.key}>{col.label}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activeShipments.slice(0, 10).map((shipment) => (
                                            <TableRow
                                                key={shipment.shipmentId}
                                                className="cursor-pointer hover:bg-slate-500/10"
                                                onClick={() => setSelectedShipment(shipment.shipmentId)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                            >
                                                {shipmentColumns.map((col) => (
                                                    <TableCell key={col.key}>
                                                        {col.render ? (col as any).render(shipment[col.key as keyof ActiveShipment]) : shipment[col.key as keyof ActiveShipment] as any}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Map Tab */}
                <TabsContent value="map" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Live Shipment Map</CardTitle>
                            <CardDescription>Real-time GPS tracking of all active shipments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                                <div className="text-center space-y-2">
                                    <MapPin className="h-12 w-12 text-slate-400 mx-auto" />
                                    <p className="text-sm font-medium text-slate-600">Map Integration</p>
                                    <p className="text-xs text-muted-foreground max-w-sm">
                                        Install react-leaflet or mapbox-gl for interactive map
                                        <br />
                                        Display shipment markers with tooltips showing ID, status, ETA
                                    </p>
                                    <div className="pt-4 space-y-2">
                                        <p className="text-xs font-mono text-slate-500">
                                            npm install react-leaflet leaflet
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {activeCount} shipments ready to display
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Shipments Tab */}
                <TabsContent value="shipments" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">All Active Shipments</h2>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportToExcel(activeShipments, 'active_shipments', 'Shipments')}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                            <Button variant="outline" size="sm">
                                <Navigation className="mr-2 h-4 w-4" />
                                Refresh Locations
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            {loadingShipments ? (
                                <p className="text-center py-8 text-muted-foreground">Loading shipments...</p>
                            ) : activeShipments.length === 0 ? (
                                <EmptyState compact title="No active shipments" />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {shipmentColumns.map((col) => (
                                                <TableHead key={col.key}>{col.label}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activeShipments.map((shipment) => (
                                            <TableRow
                                                key={shipment.shipmentId}
                                                className="cursor-pointer hover:bg-slate-500/10"
                                                onClick={() => setSelectedShipment(shipment.shipmentId)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                            >
                                                {shipmentColumns.map((col) => (
                                                    <TableCell key={col.key}>
                                                        {col.render ? (col as any).render(shipment[col.key as keyof ActiveShipment]) : shipment[col.key as keyof ActiveShipment] as any}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Alerts Tab */}
                <TabsContent value="alerts" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Tracking Alerts</h2>
                        <div className="flex gap-2">
                            <Button
                                variant={filterSeverity === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterSeverity("all")}
                            >
                                All
                            </Button>
                            <Button
                                variant={filterSeverity === "CRITICAL" ? "destructive" : "outline"}
                                size="sm"
                                onClick={() => setFilterSeverity("CRITICAL")}
                            >
                                Critical
                            </Button>
                            <Button
                                variant={filterSeverity === "WARNING" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterSeverity("WARNING")}
                            >
                                Warning
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {alerts.length === 0 ? (
                            <Card className="col-span-2">
                                <CardContent className="pt-6">
                                    <EmptyState icon={CheckCircle2} title="No active alerts" description="All clear — no tracking issues detected." />
                                </CardContent>
                            </Card>
                        ) : (
                            alerts.map((alert) => (
                                <Card key={alert.id} className={alert.resolvedAt ? "opacity-60" : ""}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        alert.severity === "CRITICAL"
                                                            ? "destructive"
                                                            : alert.severity === "WARNING"
                                                                ? "default"
                                                                : "secondary"
                                                    }
                                                >
                                                    {alert.severity}
                                                </Badge>
                                                <span className="text-sm font-medium">{alert.alertType}</span>
                                            </div>
                                            {alert.resolvedAt && (
                                                <Badge variant="outline" className="text-green-600">
                                                    Resolved
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-base mt-2">{alert.message}</CardTitle>
                                        <CardDescription>Shipment: {alert.shipmentId}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Created:</span>
                                                <span>{formatDateTime(alert.createdAt)}</span>
                                            </div>
                                            {alert.acknowledgedAt && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Acknowledged:</span>
                                                    <span className="text-green-600">
                                                        {formatDateTime(alert.acknowledgedAt)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {!alert.resolvedAt && (
                                            <div className="flex gap-2 mt-4">
                                                {!alert.acknowledgedAt && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                                                        disabled={acknowledgeAlertMutation.isPending}
                                                    >
                                                        <Target className="mr-2 h-3 w-3" />
                                                        Acknowledge
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => resolveAlertMutation.mutate(alert.id)}
                                                    disabled={resolveAlertMutation.isPending}
                                                >
                                                    <CheckCircle2 className="mr-2 h-3 w-3" />
                                                    Resolve
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Shipment Detail Modal (placeholder) */}
            {selectedShipment && (
                <Dialog open={!!selectedShipment} onOpenChange={() => setSelectedShipment(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Shipment Details: {selectedShipment}</DialogTitle>
                            <DialogDescription>Timeline and tracking information</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Detailed shipment view with milestone timeline and mini-map
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Implementation: Fetch milestones and ETA breakdown for selected shipment
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedShipment(null)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
