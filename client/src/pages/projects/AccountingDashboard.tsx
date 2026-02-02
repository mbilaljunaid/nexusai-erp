import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, PieChart, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";

export default function AccountingDashboard() {
    const { data: summary } = useQuery<any>({
        queryKey: ['/api/ppm/accounting/summary'],
        // Mock data for now until API endpoint is created/verified
        initialData: {
            uncostedItems: 12,
            pendingBurden: 5,
            cipBalance: 1250000,
            revenueRecognized: 4500000,
            margin: 18.5,
            alerts: [
                { id: 1, type: "critical", message: "12 Uncosted Labor Items > 10 days" },
                { id: 2, type: "warning", message: "Burden Schedule 'FY26-Corp' expires in 15 days" }
            ]
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Project Accounting</h1>
                    <p className="text-muted-foreground">Financial control center for project portfolio</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Period Close</Button>
                    <Button>Create Adjustment</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Uncosted Expend.</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.uncostedItems}</div>
                        <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CIP Balance</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${summary.cipBalance.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue (ITD)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${summary.revenueRecognized.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Inception to Date</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Portfolio Margin</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.margin}%</div>
                        <p className="text-xs text-muted-foreground">+1.2% year over year</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Cost Trends</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md border border-dashed border-muted">
                            Cost Transaction Volume Chart Placeholder
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Accounting Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {summary.alerts.map((alert: any) => (
                                <div key={alert.id} className="flex items-start gap-4 rounded-md border p-3">
                                    <AlertTriangle className={`mt-0.5 h-5 w-5 ${alert.type === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{alert.type === 'critical' ? 'Critical Action' : 'Warning'}</p>
                                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
