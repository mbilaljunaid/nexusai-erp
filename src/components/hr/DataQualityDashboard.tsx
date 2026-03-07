import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Users, Building } from "lucide-react";

export function DataQualityDashboard() {
    const { data: analytics, isLoading } = useQuery({
        queryKey: ["hr-analytics"],
        queryFn: () => api.hr.persons.getAnalytics(),
        refetchInterval: 30000
    });

    if (isLoading) return <div>Loading Analytics...</div>;

    const { quality, headcount } = analytics || { quality: {}, headcount: [] };
    const totalWorkers = quality.totalActiveWorker || 1; // Avoid div by zero

    // Calculations
    const missingNidPct = Math.round((quality.missingNationalId / totalWorkers) * 100);
    const missingMgrPct = Math.round((quality.missingManager / totalWorkers) * 100);
    const healthScore = 100 - Math.round((missingNidPct + missingMgrPct) / 2);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Health Score */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Overall Data Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {healthScore}%
                            {healthScore > 80 ? <CheckCircle className="text-green-500 h-5 w-5" /> : <AlertTriangle className="text-amber-500 h-5 w-5" />}
                        </div>
                        <Progress value={healthScore} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-2">Based on completeness of NID and Manager fields.</p>
                    </CardContent>
                </Card>

                {/* Missing NID */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Missing National ID</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{quality.missingNationalId}</div>
                        <p className="text-xs text-muted-foreground">Workers with incomplete bio-data.</p>
                        <div className="mt-4 text-xs font-medium text-red-500">
                            {missingNidPct}% of Workforce
                        </div>
                    </CardContent>
                </Card>

                {/* Missing Manager */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Orphaned Workers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{quality.missingManager}</div>
                        <p className="text-xs text-muted-foreground">Active workers without a Line Manager.</p>
                        <div className="mt-4 text-xs font-medium text-amber-500">
                            {missingMgrPct}% of Workforce
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Headcount Chart (Simple List for V1) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Headcount by Department</CardTitle>
                    <CardDescription>Distribution of active assignments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {headcount?.map((dept: any) => (
                            <div key={dept.dept || "Unassigned"} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{dept.dept || "Unassigned Department"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{dept.count}</span>
                                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            // eslint-disable-next-line react-dom/no-unsafe-styles
                                            style={{ width: `${(dept.count / totalWorkers) * 100}%`}}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
