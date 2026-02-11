import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Battery, MapPin, Gauge, Clock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Equipment {
    id: string;
    equipmentNumber: string;
    type: string;
    model: string;
    status: "ACTIVE" | "IDLE" | "MAINTENANCE" | "OFFLINE";
    location: string;
    operator?: string;
    hoursToday: number;
    fuelLevel: number;
    utilization: number;
    alerts?: string[];
}

interface MobileEquipmentCardProps {
    equipment: Equipment;
    onSelect?: (equipment: Equipment) => void;
}

export function MobileEquipmentCard({ equipment, onSelect }: MobileEquipmentCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const statusConfig = {
        ACTIVE: { color: "bg-green-100 text-green-800 border-green-300", label: "Active", icon: Gauge },
        IDLE: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", label: "Idle", icon: Clock },
        MAINTENANCE: { color: "bg-orange-100 text-orange-800 border-orange-300", label: "Maintenance", icon: AlertTriangle },
        OFFLINE: { color: "bg-gray-100 text-gray-800 border-gray-300", label: "Offline", icon: AlertTriangle }
    };

    const config = statusConfig[equipment.status];
    const StatusIcon = config.icon;

    const getFuelColor = (level: number) => {
        if (level < 20) return "text-red-600";
        if (level < 50) return "text-orange-600";
        return "text-green-600";
    };

    return (
        <Card
            className={cn(
                "border-2 transition-all",
                equipment.alerts && equipment.alerts.length > 0 && "border-orange-400"
            )}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <CardContent className="p-4">
                {/* Compact View */}
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg truncate">{equipment.equipmentNumber}</h3>
                            <p className="text-sm text-muted-foreground truncate">{equipment.type} • {equipment.model}</p>
                        </div>
                        <Badge variant="outline" className={cn("ml-2 flex-shrink-0", config.color)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                        </Badge>
                    </div>

                    {/* Quick Stats - Always Visible */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-muted/50 rounded-lg p-2 text-center">
                            <div className="text-xs text-muted-foreground mb-1">Fuel</div>
                            <div className={cn("text-base font-bold flex items-center justify-center gap-1", getFuelColor(equipment.fuelLevel))}>
                                <Battery className="h-4 w-4" />
                                {equipment.fuelLevel}%
                            </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2 text-center">
                            <div className="text-xs text-muted-foreground mb-1">Hours</div>
                            <div className="text-base font-bold flex items-center justify-center gap-1">
                                <Clock className="h-4 w-4" />
                                {equipment.hoursToday}h
                            </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2 text-center">
                            <div className="text-xs text-muted-foreground mb-1">Usage</div>
                            <div className="text-base font-bold flex items-center justify-center gap-1">
                                <Gauge className="h-4 w-4" />
                                {equipment.utilization}%
                            </div>
                        </div>
                    </div>

                    {/* Alerts - Always Visible if Present */}
                    {equipment.alerts && equipment.alerts.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-orange-900">
                                    {equipment.alerts[0]}
                                    {equipment.alerts.length > 1 && (
                                        <span className="ml-1 font-semibold">+{equipment.alerts.length - 1} more</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Expand/Collapse Indicator */}
                    <div className="flex items-center justify-center pt-1 border-t">
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                    Show Less
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    Show More
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                        <div className="space-y-3 pt-3 border-t">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Location:</span>
                                    <span className="text-muted-foreground">{equipment.location}</span>
                                </div>
                                {equipment.operator && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Operator:</span>
                                        <span className="text-muted-foreground">{equipment.operator}</span>
                                    </div>
                                )}
                            </div>

                            {/* All Alerts */}
                            {equipment.alerts && equipment.alerts.length > 1 && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">All Alerts:</div>
                                    {equipment.alerts.map((alert, index) => (
                                        <div key={index} className="bg-orange-50 border border-orange-200 rounded p-2 text-xs text-orange-900">
                                            • {alert}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Action Button */}
                            {onSelect && (
                                <Button
                                    className="w-full h-12 text-base"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelect(equipment);
                                    }}
                                >
                                    View Details
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

interface MobileEquipmentListProps {
    projectId?: string;
}

export function MobileEquipmentList({ projectId }: MobileEquipmentListProps) {
    // Mock data - in production would fetch from API
    const equipment: Equipment[] = [
        {
            id: "1",
            equipmentNumber: "EXC-001",
            type: "Excavator",
            model: "CAT 320",
            status: "ACTIVE",
            location: "Zone A - Foundation",
            operator: "John Martinez",
            hoursToday: 6.5,
            fuelLevel: 75,
            utilization: 85,
            alerts: []
        },
        {
            id: "2",
            equipmentNumber: "DOZ-003",
            type: "Bulldozer",
            model: "CAT D6",
            status: "ACTIVE",
            location: "Zone B - Grading",
            operator: "Sarah Chen",
            hoursToday: 7.2,
            fuelLevel: 45,
            utilization: 92,
            alerts: ["Fuel level below 50%"]
        },
        {
            id: "3",
            equipmentNumber: "CRN-005",
            type: "Tower Crane",
            model: "Liebherr 630",
            status: "IDLE",
            location: "Central Lift Point",
            hoursToday: 3.5,
            fuelLevel: 90,
            utilization: 45,
            alerts: []
        },
        {
            id: "4",
            equipmentNumber: "LOD-008",
            type: "Front Loader",
            model: "CAT 950",
            status: "MAINTENANCE",
            location: "Equipment Yard",
            hoursToday: 0,
            fuelLevel: 15,
            utilization: 0,
            alerts: ["Scheduled maintenance in progress", "Fuel level critically low"]
        }
    ];

    const activeCount = equipment.filter(e => e.status === "ACTIVE").length;
    const alertCount = equipment.filter(e => e.alerts && e.alerts.length > 0).length;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-primary text-primary-foreground shadow-md">
                <div className="container max-w-2xl px-4 py-4">
                    <h1 className="text-xl font-bold">Equipment Status</h1>
                    <div className="flex gap-4 mt-2 text-sm">
                        <span>{activeCount} Active</span>
                        <span>•</span>
                        <span>{equipment.length} Total</span>
                        {alertCount > 0 && (
                            <>
                                <span>•</span>
                                <span className="text-orange-300">{alertCount} Alerts</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Equipment List */}
            <div className="container max-w-2xl px-4 py-6 space-y-4">
                {equipment.map(eq => (
                    <MobileEquipmentCard key={eq.id} equipment={eq} />
                ))}
            </div>
        </div>
    );
}
