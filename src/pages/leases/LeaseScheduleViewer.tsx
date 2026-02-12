import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Download } from "lucide-react";

export default function LeaseScheduleViewer() {
    const { data: schedule } = useQuery({
        queryKey: ["/api/leases/schedule/1"],
        queryFn: () => apiRequest("/api/leases/schedule/1"),
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Lease Payment Schedule</h1>
                    <p className="text-muted-foreground">View amortization and payment schedules</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Schedule
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="text-left p-3">Period</th>
                                    <th className="text-right p-3">Payment</th>
                                    <th className="text-right p-3">Principal</th>
                                    <th className="text-right p-3">Interest</th>
                                    <th className="text-right p-3">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule?.payments?.map((payment: any, i: number) => (
                                    <tr key={i} className="border-t">
                                        <td className="p-3">{payment.period}</td>
                                        <td className="p-3 text-right font-medium">${payment.amount?.toLocaleString()}</td>
                                        <td className="p-3 text-right">${payment.principal?.toLocaleString()}</td>
                                        <td className="p-3 text-right">${payment.interest?.toLocaleString()}</td>
                                        <td className="p-3 text-right">${payment.balance?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
