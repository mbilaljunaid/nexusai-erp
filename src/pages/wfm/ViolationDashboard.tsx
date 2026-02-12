import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ViolationDashboard() {
    const { data: violations } = useQuery({
        queryKey: ["/api/wfm/violations"],
        queryFn: () => apiRequest("/api/wfm/violations"),
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Compliance Violation Dashboard</h1>
                    <p className="text-muted-foreground">Overtime alerts and compliance tracking</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Total Violations</div>
                        <div className="text-3xl font-bold mt-1 text-red-600">{violations?.totalViolations}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Overtime</div>
                        <div className="text-3xl font-bold mt-1">{violations?.overtime}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Break Violations</div>
                        <div className="text-3xl font-bold mt-1">{violations?.breakViolations}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Late Clock-ins</div>
                        <div className="text-3xl font-bold mt-1">{violations?.lateClockIns}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Violations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {violations?.recent?.map((violation: any) => (
                        <div key={violation.id} className="border rounded-lg p-3 bg-red-50">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                                    <div>
                                        <div className="font-medium">{violation.employeeName}</div>
                                        <div className="text-sm text-muted-foreground">{violation.description}</div>
                                    </div>
                                </div>
                                <Badge variant="destructive">{violation.type}</Badge>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
