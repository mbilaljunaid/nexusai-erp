import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, TrendingUp, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function RollingForecast() {
    const { data: forecast } = useQuery({
        queryKey: ["/api/epm/rolling-forecast"],
        queryFn: () => apiRequest("/api/epm/rolling-forecast"),
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Rolling Forecast</h1>
                    <p className="text-muted-foreground">Continuous 12-month planning horizon</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Rolling 12-Month Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={forecast?.months || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="forecast" stroke="#8884d8" strokeWidth={2} />
                            <Line type="monotone" dataKey="actual" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
