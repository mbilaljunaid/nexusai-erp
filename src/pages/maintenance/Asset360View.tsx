import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AssetBOMEditor from "@/components/maintenance/AssetBOMEditor";
import { Badge } from "@/components/ui/badge";
import { Activity, Thermometer, Gauge, Zap, AlertTriangle, FileText, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useNexusAI } from "@/contexts/NexusAIContext";
import { StandardPage } from "@/components/layout/StandardPage";




export default function Asset360View() {
    const { open, sendMessage } = useNexusAI();
    // In real app, use assets ID from route
    const assetId = "ASSET-1001";

    // Fetch Asset Details
    const { data: asset } = useQuery({
        queryKey: ["/api/maintenance/assets", assetId],
        queryFn: async () => ({
            id: assetId,
            assetNumber: "CNC-MILL-01",
            description: "5-Axis CNC Milling Machine",
            status: "OPERATIONAL",
            healthScore: 82,
            location: "Production Line 1",
            lastMaintenance: "2023-10-15",
            nextMaintenance: "2023-11-15"
        })
    });

    const { data: telemetry = [] } = useQuery({
        queryKey: ["/api/maintenance/assets", assetId, "telemetry"],
        queryFn: async () => {
            const res = await fetch(`/api/maintenance/assets/${assetId}/telemetry`);
            if (!res.ok) return [];
            return res.json();
        }
    });

    return (
        <StandardPage title="{asset?.assetNumber || "Loading..."}">
            <div className="flex justify-between items-start">
                <div>
                    
                    <p className="text-muted-foreground">{asset?.description}</p>
                </div>
                <Badge className={(asset?.healthScore ?? 0) > 80 ? "bg-green-500" : "bg-yellow-500"}>
                    Health: {asset?.healthScore}%
                </Badge>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Asset Health</TabsTrigger>
                    <TabsTrigger value="bom">Bill of Materials</TabsTrigger>
                    <TabsTrigger value="history">Work History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-green-500" />
                                    {asset?.status}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Temperature</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold flex items-center gap-2">
                                    <Thermometer className="h-5 w-5 text-orange-500" />
                                    62°C
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Vibration</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-blue-500" />
                                    0.6 mm/s
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Utilization</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold flex items-center gap-2">
                                    <Gauge className="h-5 w-5 text-purple-500" />
                                    94%
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <Card className="col-span-2">
                            <CardHeader><CardTitle>Real-Time Telemetry</CardTitle></CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={telemetry}>
                                        <XAxis dataKey="time" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} name="Temp (°C)" />
                                        <Line type="monotone" dataKey="vibration" stroke="#3b82f6" strokeWidth={2} name="Vibration" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>AI Insights</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                                    <div className="flex items-center gap-2 font-semibold text-yellow-800 mb-1">
                                        <AlertTriangle className="h-4 w-4" /> Anomaly Detected
                                    </div>
                                    <p className="text-sm text-yellow-700">Vibration spike detected at 14:00. 85% probability of bearing wear.</p>
                                    <div className="flex flex-col gap-2 mt-2">
                                        <Button size="sm" variant="outline" className="w-full border-yellow-300 text-yellow-800 hover:bg-yellow-100">Schedule Inspection</Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="w-full text-yellow-900 hover:bg-yellow-100 gap-2 font-bold"
                                            onClick={() => {
                                                open();
                                                sendMessage(`Analyze asset telemetry for ${asset?.assetNumber || assetId}. A vibration spike (0.6 mm/s) was detected at 14:00. Evaluate the risk of bearing wear and provide recommended maintenance steps.`);
                                            }}
                                        >
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Deep AI Maintenance Analysis
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Recommended Actions</h4>
                                    <div className="flex items-center justify-between text-sm p-2 border rounded">
                                        <span className="flex items-center gap-2"><FileText className="h-3 w-3" /> Lubricate Bearings</span>
                                        <Button size="sm" variant="ghost" className="h-6 text-xs">Apply</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="bom">
                    <AssetBOMEditor assetId={assetId} />
                </TabsContent>

                <TabsContent value="history">
                    <Card><CardHeader><CardTitle>Work Order History</CardTitle></CardHeader><CardContent>Coming Soon...</CardContent></Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
