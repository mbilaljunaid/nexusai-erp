import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Truck,
    Construction,
    Zap,
    AlertTriangle,
    Activity,
    MapPin,
    Clock,
    Gauge,
    Fuel,
    Settings,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface EquipmentStatus {
    id: string;
    equipmentNumber: string;
    type: string;
    model: string;
    status: "active" | "idle" | "maintenance" | "offline";
    location: string;
    operator?: string;
    hoursToday: number;
    fuelLevel: number;
    lastMaintenance: string;
    nextMaintenanceDue: string;
    utilization: number; // percentage
    alerts: Alert[];
}

interface Alert {
    id: string;
    severity: "info" | "warning" | "critical";
    message: string;
    timestamp: string;
}

interface EquipmentTelemetryProps {
    projectId?: string;
}

export function EquipmentTelemetry({ projectId }: EquipmentTelemetryProps) {
    const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

    const { data: equipment = [], isLoading } = useQuery<EquipmentStatus[]>({
        queryKey: ["construction-equipment", projectId],
        enabled: !!projectId,
        refetchInterval: 30000, // Refresh every 30 seconds for "real-time" feel
        queryFn: async () => {
            // Mock data - in production, this would connect to IoT telemetry
            return [
                {
                    id: "1",
                    equipmentNumber: "EQ-001",
                    type: "Excavator",
                    model: "CAT 320",
                    status: "active",
                    location: "Zone A - Foundation",
                    operator: "John Smith",
                    hoursToday: 5.2,
                    fuelLevel: 68,
                    lastMaintenance: "2026-02-01",
                    nextMaintenanceDue: "2026-02-15",
                    utilization: 87,
                    alerts: [
                        {
                            id: "a1",
                            severity: "warning",
                            message: "Fuel level below 70%",
                            timestamp: new Date().toISOString()
                        }
                    ]
                },
                {
                    id: "2",
                    equipmentNumber: "EQ-002",
                    type: "Crane",
                    model: "Liebherr LTM 1100",
                    status: "active",
                    location: "Zone B - Structural",
                    operator: "Maria Garcia",
                    hoursToday: 6.8,
                    fuelLevel: 92,
                    lastMaintenance: "2026-01-28",
                    nextMaintenanceDue: "2026-02-28",
                    utilization: 95,
                    alerts: [
                        {
                            id: "a2",
                            severity: "info",
                            message: "Operating at peak efficiency",
                            timestamp: new Date().toISOString()
                        }
                    ]
                },
                {
                    id: "3",
                    equipmentNumber: "EQ-003",
                    type: "Bulldozer",
                    model: "CAT D8T",
                    status: "idle",
                    location: "Staging Area",
                    hoursToday: 2.1,
                    fuelLevel: 45,
                    lastMaintenance: "2026-02-05",
                    nextMaintenanceDue: "2026-02-20",
                    utilization: 42,
                    alerts: [
                        {
                            id: "a3",
                            severity: "warning",
                            message: "Low utilization - 42% today",
                            timestamp: new Date().toISOString()
                        }
                    ]
                },
                {
                    id: "4",
                    equipmentNumber: "EQ-004",
                    type: "Loader",
                    model: "Volvo L120",
                    status: "maintenance",
                    location: "Maintenance Bay",
                    hoursToday: 0,
                    fuelLevel: 100,
                    lastMaintenance: "2026-02-11",
                    nextMaintenanceDue: "2026-03-11",
                    utilization: 0,
                    alerts: [
                        {
                            id: "a4",
                            severity: "critical",
                            message: "Scheduled maintenance in progress",
                            timestamp: new Date().toISOString()
                        }
                    ]
                },
                {
                    id: "5",
                    equipmentNumber: "EQ-005",
                    type: "Concrete Pump",
                    model: "Putzmeister M47",
                    status: "active",
                    location: "Zone C - Deck Pour",
                    operator: "David Chen",
                    hoursToday: 4.5,
                    fuelLevel: 78,
                    lastMaintenance: "2026-02-08",
                    nextMaintenanceDue: "2026-02-22",
                    utilization: 88,
                    alerts: []
                }
            ];
        }
    });

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "active":
                return { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2, label: "Active" };
            case "idle":
                return { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, label: "Idle" };
            case "maintenance":
                return { color: "bg-orange-100 text-orange-800 border-orange-200", icon: Settings, label: "Maintenance" };
            case "offline":
                return { color: "bg-muted text-foreground border-border", icon: XCircle, label: "Offline" };
            default:
                return { color: "bg-muted text-foreground border-border", icon: Activity, label: "Unknown" };
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical":
                return "text-red-600";
            case "warning":
                return "text-orange-600";
            case "info":
                return "text-blue-600";
            default:
                return "text-muted-foreground";
        }
    };

    const getAlertIcon = (severity: string) => {
        switch (severity) {
            case "critical":
                return XCircle;
            case "warning":
                return AlertTriangle;
            case "info":
                return Activity;
            default:
                return Activity;
        }
    };

    const stats = {
        total: equipment.length,
        active: equipment.filter(e => e.status === "active").length,
        idle: equipment.filter(e => e.status === "idle").length,
        maintenance: equipment.filter(e => e.status === "maintenance").length,
        avgUtilization: equipment.length > 0
            ? Math.round(equipment.reduce((sum, e) => sum + e.utilization, 0) / equipment.length)
            : 0
    };

    if (!projectId) {
        return (
            <Card className="h-96 flex items-center justify-center text-muted-foreground border-dashed">
                Select a project to view equipment telemetry
            </Card>
        );
    }

    if (isLoading) {
        return <Card className="h-96 flex items-center justify-center">Loading equipment data...</Card>;
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-muted-foreground">Total Equipment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Active
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-yellow-600 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Idle
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.idle}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-orange-600 flex items-center gap-1">
                            <Settings className="h-4 w-4" />
                            Maintenance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.maintenance}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-muted-foreground">Avg Utilization</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgUtilization}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Equipment Grid */}
            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">All ({equipment.length})</TabsTrigger>
                    <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
                    <TabsTrigger value="alerts">
                        Alerts ({equipment.filter(e => e.alerts.length > 0).length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {equipment.map((eq) => (
                            <EquipmentCard
                                key={eq.id}
                                equipment={eq}
                                isSelected={selectedEquipment === eq.id}
                                onClick={() => setSelectedEquipment(selectedEquipment === eq.id ? null : eq.id)}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="active" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {equipment.filter(e => e.status === "active").map((eq) => (
                            <EquipmentCard
                                key={eq.id}
                                equipment={eq}
                                isSelected={selectedEquipment === eq.id}
                                onClick={() => setSelectedEquipment(selectedEquipment === eq.id ? null : eq.id)}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {equipment.filter(e => e.alerts.length > 0).map((eq) => (
                            <EquipmentCard
                                key={eq.id}
                                equipment={eq}
                                isSelected={selectedEquipment === eq.id}
                                onClick={() => setSelectedEquipment(selectedEquipment === eq.id ? null : eq.id)}
                            />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

interface EquipmentCardProps {
    equipment: EquipmentStatus;
    isSelected: boolean;
    onClick: () => void;
}

function EquipmentCard({ equipment, isSelected, onClick }: EquipmentCardProps) {
    const statusConfig = {
        active: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
        idle: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
        maintenance: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: Settings },
        offline: { color: "bg-muted text-foreground border-border", icon: XCircle }
    }[equipment.status];

    const StatusIcon = statusConfig.icon;

    return (
        <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={onClick}>
        <Card
                    className={cn(
                        "hover:shadow-lg transition-all cursor-pointer",
                        isSelected && "ring-2 ring-blue-500"
                    )}
                >
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">{equipment.equipmentNumber}</CardTitle>
                                <div className="text-sm text-muted-foreground">{equipment.type} • {equipment.model}</div>
                            </div>
                            <Badge variant="outline" className={statusConfig.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {equipment.status.toUpperCase()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {/* Location & Operator */}
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{equipment.location}</span>
                        </div>
                        {equipment.operator && (
                            <div className="flex items-center gap-2 text-sm">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                <span>{equipment.operator}</span>
                            </div>
                        )}

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="text-muted-foreground text-xs mb-1">Hours Today</div>
                                <div className="font-mono font-semibold">{equipment.hoursToday.toFixed(1)}h</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-xs mb-1">Utilization</div>
                                <div className="font-mono font-semibold">{equipment.utilization}%</div>
                            </div>
                        </div>

                        {/* Fuel Level */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <Fuel className="h-3 w-3" />
                                    Fuel Level
                                </span>
                                <span className="font-semibold">{equipment.fuelLevel}%</span>
                            </div>
                            <Progress
                                value={equipment.fuelLevel}
                                className={cn(
                                    "h-2",
                                    equipment.fuelLevel < 30 ? "bg-red-200" :
                                        equipment.fuelLevel < 50 ? "bg-yellow-200" :
                                            "bg-green-200"
                                )}
                            />
                        </div>

                        {/* Alerts */}
                        {equipment.alerts.length > 0 && (
                            <div className="pt-2 border-t space-y-1">
                                {equipment.alerts.map(alert => {
                                    const AlertIcon = {
                                        critical: XCircle,
                                        warning: AlertTriangle,
                                        info: Activity
                                    }[alert.severity];
                                    const alertColor = {
                                        critical: "text-red-600",
                                        warning: "text-orange-600",
                                        info: "text-blue-600"
                                    }[alert.severity];

                                    return (
                                        <div key={alert.id} className={cn("flex items-start gap-2 text-xs", alertColor)}>
                                            <AlertIcon className="h-3 w-3 mt-0.5" />
                                            <span>{alert.message}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Expanded Details */}
                        {isSelected && (
                            <div className="pt-3 border-t space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Maintenance:</span>
                                    <span className="font-medium">{format(new Date(equipment.lastMaintenance), "MMM d, yyyy")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Next Due:</span>
                                    <span className="font-medium">{format(new Date(equipment.nextMaintenanceDue), "MMM d, yyyy")}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
        </Button>
    );
}
