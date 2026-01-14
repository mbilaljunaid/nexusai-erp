import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign, Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function BillingDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Billing Command Center</h1>
                    <p className="text-muted-foreground">Real-time overview of billing performance and exceptions.</p>
                </div>
                <Link href="/finance/billing/workbench">
                    <Button className="gap-2">
                        Go to Workbench <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unbilled Revenue</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$124,592.00</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Invoiced (MTD)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$450,200.00</div>
                        <p className="text-xs text-muted-foreground">98% of target</p>
                    </CardContent>
                </Card>
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-destructive">Billing Suspense</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">3 Items</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Auto-Invoice Success</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">99.8%</div>
                        <p className="text-xs text-muted-foreground">Last batch: 10 mins ago</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Billing Trend</CardTitle>
                        <CardDescription>30-day billing volume vs. target</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center border-dashed border-2 rounded-md m-4">
                        <span className="text-muted-foreground">Chart Component Placeholder</span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link href="/finance/billing/workbench">
                            <Button variant="outline" className="w-full justify-start">Run Auto-Invoice</Button>
                        </Link>
                        <Button variant="outline" className="w-full justify-start">Create Manual Event</Button>
                        <Button variant="outline" className="w-full justify-start">Manage Rules</Button>
                        <Button variant="outline" className="w-full justify-start">View Batches</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
