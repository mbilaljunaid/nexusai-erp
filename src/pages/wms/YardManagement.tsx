import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Truck, Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from '@/components/layout/StandardPage';

export default function YardManagement() {
    const { data: yard } = useQuery({
        queryKey: ["/api/wms/yard"],
        queryFn: () => apiRequest("/api/wms/yard"),
    });

    return (
        <StandardPage
            title="Yard Management Dashboard"
            description="Dock scheduling and trailer management"
        >
            <div className="space-y-6">            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Total Docks</div>
                        <div className="text-3xl font-bold mt-1">{yard?.totalDocks}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Occupied</div>
                        <div className="text-3xl font-bold mt-1 text-orange-600">{yard?.occupiedDocks}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Available</div>
                        <div className="text-3xl font-bold mt-1 text-green-600">{yard?.availableDocks}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Utilization</div>
                        <div className="text-3xl font-bold mt-1">{yard?.utilization}%</div>
                    </CardContent>
                </Card>
            </div>

                <div className="grid grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dock Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {yard?.dockSchedule?.map((slot: any) => (
                                <div key={slot.id} className="border rounded-lg p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            <span className="font-medium">Dock {slot.dockNumber}</span>
                                        </div>
                                        <Badge variant={slot.status === "OCCUPIED" ? "default" : "secondary"}>
                                            {slot.status}
                                        </Badge>
                                    </div>
                                    {slot.appointment && (
                                        <div className="text-sm">
                                            <div className="text-muted-foreground">Carrier: {slot.appointment.carrier}</div>
                                            <div className="text-muted-foreground">
                                                Time: {new Date(slot.appointment.time).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Yard Locations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {yard?.trailers?.map((trailer: any) => (
                                <div key={trailer.id} className="border rounded-lg p-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <Truck className="h-4 w-4" />
                                            <span className="font-medium">{trailer.trailerNumber}</span>
                                        </div>
                                        <Badge>{trailer.location}</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        {trailer.carrier} • {trailer.type}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPage>
    );
}
