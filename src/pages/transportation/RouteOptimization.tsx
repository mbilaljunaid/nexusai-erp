import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Navigation, TrendingDown, Clock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StandardPage } from "@/components/layout/StandardPage";


export default function RouteOptimization() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedRegion, setSelectedRegion] = useState("");
    const [optimizationMode, setOptimizationMode] = useState<'DISTANCE' | 'TIME' | 'COST'>('DISTANCE');

    const { data: routes } = useQuery<any>({
        queryKey: ["/api/transportation/routes", selectedRegion],
        queryFn: () => apiRequest("GET", `/api/transportation/routes?region=${selectedRegion}`).then(res => res.json()),
        enabled: !!selectedRegion,
    });

    const optimizeMutation = useMutation({
        mutationFn: async (params: any) => {
            const res = await apiRequest("POST", "/api/transportation/optimize-routes", params);
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Success",
                description: `Routes optimized. Savings: ${data.savingsPercent}% (${data.distance} miles saved)`,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/transportation/routes"] });
        },
    });

    const runOptimization = () => {
        optimizeMutation.mutate({
            region: selectedRegion,
            optimizationMode,
            includeTraffic: true,
        });
    };

    const columns: SpreadsheetColumn<any>[] = [
        { id: "routeNumber", header: "Route ID", width: "150px", cell: (route: any) => <span className="font-medium">{route.routeNumber}</span> },
        {
            id: "originDest", header: "Origin → Destination", width: "300px", cell: (route: any) => (
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    {route.origin}
                    <span className="text-muted-foreground">→</span>
                    <MapPin className="h-4 w-4 text-red-600" />
                    {route.destination}
                </div>
            )
        },
        { id: "stops", header: "Stops", width: "100px", cell: (route: any) => <span>{route.stops}</span> },
        { id: "distance", header: "Distance", width: "120px", cell: (route: any) => <span>{route.distance} mi</span> },
        {
            id: "estTime", header: "Est. Time", width: "120px", cell: (route: any) => (
                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {route.estimatedTime}
                </div>
            )
        },
        {
            id: "status", header: "Status", width: "120px", cell: (route: any) => (
                <Badge variant={route.optimized ? "default" : "secondary"}>
                    {route.optimized ? "Optimized" : "Pending"}
                </Badge>
            )
        }
    ];

    return (
        <StandardPage title="Route Optimization Engine">
            <div className="flex justify-between items-center">
                <div>

                    <p className="text-muted-foreground">AI-powered route planning and optimization</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={runOptimization} disabled={!selectedRegion || optimizeMutation.isPending}>
                        <Navigation className="h-4 w-4 mr-2" />
                        Optimize Routes
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-medium">Region</label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NORTHEAST">Northeast</SelectItem>
                            <SelectItem value="SOUTHEAST">Southeast</SelectItem>
                            <SelectItem value="MIDWEST">Midwest</SelectItem>
                            <SelectItem value="SOUTHWEST">Southwest</SelectItem>
                            <SelectItem value="WEST">West</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium">Optimization Mode</label>
                    <Select value={optimizationMode} onValueChange={(v: any) => setOptimizationMode(v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DISTANCE">Minimize Distance</SelectItem>
                            <SelectItem value="TIME">Minimize Time</SelectItem>
                            <SelectItem value="COST">Minimize Cost</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {routes && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">Total Routes</div>
                                <div className="text-3xl font-bold mt-1">{routes.totalRoutes}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">Total Miles</div>
                                <div className="text-3xl font-bold mt-1">{routes.totalMiles?.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">Avg Miles/Route</div>
                                <div className="text-3xl font-bold mt-1">{routes.avgMilesPerRoute?.toFixed(0)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">Optimization Potential</div>
                                <div className="text-3xl font-bold mt-1 text-green-600">{routes.optimizationPotential}%</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Planned Routes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg">
                                <InteractiveSpreadsheet
                                    data={routes.routes || []}
                                    columns={columns}
                                    virtualized={true}
                                    containerHeight="400px"
                                    onChange={() => { }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {routes.optimizationSuggestions && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <TrendingDown className="h-5 w-5 mr-2 text-green-600" />
                                    Optimization Suggestions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {routes.optimizationSuggestions.map((suggestion: any, i: number) => (
                                        <div key={i} className="border rounded-lg p-4 bg-green-50">
                                            <div className="font-semibold">{suggestion.title}</div>
                                            <div className="text-sm text-muted-foreground mt-1">{suggestion.description}</div>
                                            <div className="mt-2 text-sm">
                                                Potential savings: <span className="font-bold text-green-600">{suggestion.savings}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </StandardPage>
    );
}
