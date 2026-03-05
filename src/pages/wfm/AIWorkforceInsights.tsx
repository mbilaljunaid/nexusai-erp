import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { StandardPage } from "@/components/layout/StandardPage";


export default function AIWorkforceInsights() {
    const [date, setDate] = useState<Date>(new Date());
    // Mock department ID for V1
    const departmentId = "DEPT-001";
    const tenantId = "default_tenant";

    // Query Forecast
    const { data: forecast, isLoading: isForecastLoading } = useQuery<any>({
        queryKey: ["ai-forecast", departmentId, date],
        queryFn: async () => {
            const formattedDate = format(date, "yyyy-MM-dd");
            const res = await fetch(`/api/wfm/ai/forecast?tenantId=${tenantId}&departmentId=${departmentId}&date=${formattedDate}`);
            if (!res.ok) throw new Error("Failed to fetch forecast");
            return res.json();
        },
    });

    // Query Fatigue Risks (Mock scanning all employees for demo)
    // In real app, this would iterate a list or be a bulk endpoint
    const personId = "user_001"; // Demo user
    const { data: riskScan, isLoading: isRiskLoading } = useQuery<any>({
        queryKey: ["ai-risk", personId],
        queryFn: async () => {
            const res = await fetch(`/api/wfm/ai/risk-scan?tenantId=${tenantId}&personId=${personId}`);
            if (!res.ok) throw new Error("Failed to scan risks");
            return res.json();
        }
    });

    // Mock Forecast Data for Chart (visualizing the single point + context)
    const chartData = [
        { day: "Mon", projected: 45, actual: 42 },
        { day: "Tue", projected: 50, actual: 48 },
        { day: "Wed", projected: 48, actual: 51 },
        { day: "Thu", projected: 52, actual: 0 }, // Future
        { day: "Fri", projected: 45, actual: 0 },
    ];

    if (forecast) {
        // Inject our new forecast into the chart logic if needed, 
        // for now we use static shape + dynamic value display
    }

    return (
        <StandardPage title="Labor Intelligence">
            <div className="flex justify-between items-center">
                <div>
                    
                    <p className="text-muted-foreground">AI-driven workforce planning and risk prediction.</p>
                </div>
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* FORECAST CARD */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Demand Forecasting
                        </CardTitle>
                        <CardDescription>Predicted labor hours based on historical trends.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="projected" stroke="#2563eb" strokeWidth={2} name="Projected" />
                                    <Line type="monotone" dataKey="actual" stroke="#16a34a" strokeWidth={2} name="Actual" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg dark:bg-slate-900 border">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Prediction for {format(date, "MMM dd")}</span>
                                <span className="text-2xl font-bold text-blue-600">
                                    {isForecastLoading ? "..." : (forecast?.projectedHours || "--")} Hrs
                                </span>
                            </div>
                            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                                <span>Confidence Score</span>
                                <span>{forecast?.confidenceScore || 0}%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* RISK SCAN CARD */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Fatigue Risk Watchlist
                        </CardTitle>
                        <CardDescription>AI-detected burnout risks and pattern anomalies.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isRiskLoading ? (
                            <div>Scanning workforce...</div>
                        ) : (
                            <div className="space-y-4">
                                {riskScan?.status === "SAFE" ? (
                                    <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertTitle>All Clear</AlertTitle>
                                        <AlertDescription>No immediate fatigue risks detected for selected group.</AlertDescription>
                                    </Alert>
                                ) : (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>High Risk Detected</AlertTitle>
                                        <AlertDescription>
                                            <strong>Employee #{personId}</strong>: {riskScan?.riskReason}
                                            <div className="mt-2 text-xs opacity-90">Risk Score: {riskScan?.riskScore}/100</div>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold mb-2">Recent Scans</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm p-2 border rounded hover:bg-slate-50 dark:hover:bg-slate-900">
                                            <span>Engineering Dept</span>
                                            <span className="text-green-600">Safe</span>
                                        </div>
                                        <div className="flex justify-between text-sm p-2 border rounded hover:bg-slate-50 dark:hover:bg-slate-900">
                                            <span>Support Team</span>
                                            <span className="text-green-600">Safe</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
