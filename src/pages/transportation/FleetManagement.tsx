import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { Truck, Gauge, Wrench, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

export default function FleetManagement() {
    const [filterStatus, setFilterStatus] = useState("ALL");

    const { data: fleet } = useQuery({
        queryKey: ["/api/transportation/fleet", filterStatus],
        queryFn: () => apiRequest(`/api/transportation/fleet?status=${filterStatus}`),
    });

    const getStatusBadge = (status: string) => {
        const configs: Record<string, any> = {
            ACTIVE: { variant: "default", label: "Active" },
            MAINTENANCE: { variant: "secondary", label: "Maintenance" },
            IDLE: { variant: "outline", label: "Idle" },
            OUT_OF_SERVICE: { variant: "destructive", label: "Out of Service" },
        };
        const config = configs[status] || configs.IDLE;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Fleet Management Dashboard</h1>
                    <p className="text-muted-foreground">Vehicle tracking, utilization, and maintenance</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Fleet Data
                </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-muted-foreground">Total Vehicles</div>
                                <div className="text-3xl font-bold mt-1">{fleet?.totalVehicles}</div>
                            </div>
                            <Truck className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Active</div>
                        <div className="text-3xl font-bold mt-1 text-green-600">{fleet?.activeVehicles}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">In Maintenance</div>
                        <div className="text-3xl font-bold mt-1 text-orange-600">{fleet?.maintenanceVehicles}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Avg Utilization</div>
                        <div className="text-3xl font-bold mt-1">{fleet?.avgUtilization}%</div>
                    </CardContent>
                </Card>
            </div>

            <div>
                <label className="text-sm font-medium">Filter by Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-64">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Vehicles</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="MAINTENANCE">In Maintenance</SelectItem>
                        <SelectItem value="IDLE">Idle</SelectItem>
                        <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Fleet Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {fleet?.vehicles?.map((vehicle: any) => (
                            <div key={vehicle.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <Truck className="h-5 w-5 text-blue-600" />
                                            <div className="font-semibold text-lg">{vehicle.vehicleNumber}</div>
                                            {getStatusBadge(vehicle.status)}
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {vehicle.make} {vehicle.model} • {vehicle.year}
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 mt-3">
                                            <div>
                                                <div className="text-xs text-muted-foreground">Mileage</div>
                                                <div className="font-medium">{vehicle.mileage?.toLocaleString()} mi</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Fuel Efficiency</div>
                                                <div className="font-medium">{vehicle.mpg} MPG</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Last Service</div>
                                                <div className="font-medium">
                                                    {vehicle.lastService ? new Date(vehicle.lastService).toLocaleDateString() : "N/A"}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Next Service</div>
                                                <div className="font-medium">
                                                    {vehicle.nextService ? new Date(vehicle.nextService).toLocaleDateString() : "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Utilization</span>
                                                <span className="font-medium">{vehicle.utilization}%</span>
                                            </div>
                                            <Progress value={vehicle.utilization} className="h-2" />
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline">
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
