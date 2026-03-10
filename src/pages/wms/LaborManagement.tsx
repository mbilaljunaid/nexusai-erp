import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Users, TrendingUp, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StandardPage } from '@/components/layout/StandardPage';

export default function LaborManagement() {
    const { data: labor } = useQuery<any>({
        queryKey: ["/api/wms/labor"],
        queryFn: () => apiRequest("GET", "/api/wms/labor").then(res => res.json()),
    });

    return (
        <StandardPage
            title="Labor Management System"
            description="Task standards and productivity tracking"
            actions={
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                </Button>
            }
        >
            <div className="space-y-6">

                <div className="grid grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">Active Workers</div>
                            <div className="text-3xl font-bold mt-1">{labor?.activeWorkers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">Avg Productivity</div>
                            <div className="text-3xl font-bold mt-1">{labor?.avgProductivity}%</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">Tasks Completed</div>
                            <div className="text-3xl font-bold mt-1">{labor?.tasksCompleted}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-sm text-muted-foreground">Utilization</div>
                            <div className="text-3xl font-bold mt-1">{labor?.utilization}%</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Worker Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {labor?.workers?.map((worker: any) => (
                            <div key={worker.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-medium">{worker.name}</div>
                                        <div className="text-sm text-muted-foreground">{worker.role}</div>
                                    </div>
                                    <Badge
                                        variant={
                                            worker.productivity >= 100
                                                ? "default"
                                                : worker.productivity >= 80
                                                    ? "secondary"
                                                    : "destructive"
                                        }
                                    >
                                        {worker.productivity}% Productivity
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                                    <div>
                                        <div className="text-muted-foreground">Tasks Today</div>
                                        <div className="font-medium">{worker.tasksToday}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Units Picked</div>
                                        <div className="font-medium">{worker.unitsPicked}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Avg Time/Task</div>
                                        <div className="font-medium">{worker.avgTimePerTask}m</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Accuracy</div>
                                        <div className="font-medium">{worker.accuracy}%</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Daily Goal Progress</span>
                                        <span>{worker.goalProgress}%</span>
                                    </div>
                                    <Progress value={worker.goalProgress} className="h-2" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
