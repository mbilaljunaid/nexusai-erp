import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { TrendingDown, DollarSign, Download } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function RevenueWaterfall() {
    const { data: waterfall } = useQuery({
        queryKey: ["/api/billing/revenue-waterfall"],
        queryFn: () => apiRequest("/api/billing/revenue-waterfall"),
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Revenue Waterfall Visualization</h1>
                    <p className="text-muted-foreground">Track revenue from booking to recognition</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            </div>

            <div className="grid grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Booked</div>
                        <div className="text-2xl font-bold mt-1">${waterfall?.booked?.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Billed</div>
                        <div className="text-2xl font-bold mt-1">${waterfall?.billed?.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Recognized</div>
                        <div className="text-2xl font-bold mt-1">${waterfall?.recognized?.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Deferred</div>
                        <div className="text-2xl font-bold mt-1 text-orange-600">${waterfall?.deferred?.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Unbilled</div>
                        <div className="text-2xl font-bold mt-1 text-blue-600">${waterfall?.unbilled?.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Revenue Flow (Last 12 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={waterfall?.monthlyFlow || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="booked" stackId="1" stroke="#8884d8" fill="#8884d8" />
                            <Area type="monotone" dataKey="recognized" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                            <Area type="monotone" dataKey="deferred" stackId="1" stroke="#ffc658" fill="#ffc658" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
