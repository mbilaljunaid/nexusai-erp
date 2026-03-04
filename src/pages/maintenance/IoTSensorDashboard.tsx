import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { Activity, Thermometer, Gauge, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";


export default function IoTSensorDashboard() {
    const [assetId, setAssetId] = useState("");
    const [timeRange, setTimeRange] = useState("24H");

    const { data: assets } = useQuery({
        queryKey: ["/api/maintenance/assets"],
        queryFn: () => apiRequest("/api/maintenance/assets"),
    });

    const { data: sensorData } = useQuery({
        queryKey: ["/api/maintenance/iot-data", assetId, timeRange],
        queryFn: () => apiRequest(`/api/maintenance/iot-data?assetId=${assetId}&timeRange=${timeRange}`),
        enabled: !!assetId,
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    return (
        <StandardPage title="IoT Sensor Dashboard">
            <div className="flex justify-between items-center">
                <div>
                    
                    <p className="text-muted-foreground">Real-time asset monitoring and telemetry</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-medium">Asset</label>
                    <Select value={assetId} onValueChange={setAssetId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent>
                            {assets?.map((asset: any) => (
                                <SelectItem key={asset.id} value={asset.id.toString()}>
                                    {asset.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium">Time Range</label>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1H">Last Hour</SelectItem>
                            <SelectItem value="24H">Last 24 Hours</SelectItem>
                            <SelectItem value="7D">Last 7 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {sensorData && (
                <>
                    <div className="grid grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Temperature</div>
                                        <div className="text-3xl font-bold mt-1">{sensorData.currentTemp}°C</div>
                                    </div>
                                    <Thermometer className="h-8 w-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Vibration</div>
                                        <div className="text-3xl font-bold mt-1">{sensorData.currentVibration} Hz</div>
                                    </div>
                                    <Activity className="h-8 w-8 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Pressure</div>
                                        <div className="text-3xl font-bold mt-1">{sensorData.currentPressure} PSI</div>
                                    </div>
                                    <Gauge className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">Status</div>
                                <div className="text-2xl font-bold mt-1">{sensorData.status}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Temperature Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={sensorData.temperatureHistory || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="timestamp" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Vibration Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={sensorData.vibrationHistory || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="timestamp" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </StandardPage>
    );
}
