import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Navigation, TrendingDown, Clock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RouteOptimization() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedRegion, setSelectedRegion] = useState("");
    const [optimizationMode, setOptimizationMode] = useState<'DISTANCE' | 'TIME' | 'COST'>('DISTANCE');

    const { data: routes } = useQuery({
        queryKey: ["/api/transportation/routes", selectedRegion],
        queryFn: () => apiRequest(`/api/transportation/routes?region=${selectedRegion}`),
        enabled: !!selectedRegion,
    });

    const optimizeMutation = useMutation({
        mutationFn: (params: any) =>
            apiRequest("/api/transportation/optimize-routes", {
                method: "POST",
                body: JSON.stringify(params),
            }),
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

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Route Optimization Engine</h1>
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
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-3">Route ID</th>
                                            <th className="text-left p-3">Origin → Destination</th>
                                            <th className="text-right p-3">Stops</th>
                                            <th className="text-right p-3">Distance</th>
                                            <th className="text-right p-3">Est. Time</th>
                                            <th className="text-left p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {routes.routes?.map((route: any) => (
                                            <tr key={route.id} className="border-t hover:bg-accent">
                                                <td className="p-3 font-medium">{route.routeNumber}</td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-green-600" />
                                                        {route.origin}
                                                        <span className="text-muted-foreground">→</span>
                                                        <MapPin className="h-4 w-4 text-red-600" />
                                                        {route.destination}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-right">{route.stops}</td>
                                                <td className="p-3 text-right">{route.distance} mi</td>
                                                <td className="p-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {route.estimatedTime}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant={route.optimized ? "default" : "secondary"}>
                                                        {route.optimized ? "Optimized" : "Pending"}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
        </div>
    );
}
