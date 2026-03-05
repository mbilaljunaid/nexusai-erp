import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Download } from "lucide-react";
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

export default function LeaseScheduleViewer() {
    const { data: schedule } = useQuery<any>({
        queryKey: ["/api/leases/schedule/1"],
        queryFn: () => apiRequest("GET", "/api/leases/schedule/1").then(res => res.json()),
    });

    const scheduleColumns: SpreadsheetColumn<any>[] = [
        { id: "period", header: "Period", width: "100px", cell: (row) => <span>{row.period}</span> },
        { id: "payment", header: "Payment", width: "150px", cell: (row) => <span className="font-medium text-right block">${row.amount?.toLocaleString()}</span> },
        { id: "principal", header: "Principal", width: "150px", cell: (row) => <span className="text-right block">${row.principal?.toLocaleString()}</span> },
        { id: "interest", header: "Interest", width: "150px", cell: (row) => <span className="text-right block">${row.interest?.toLocaleString()}</span> },
        { id: "balance", header: "Balance", width: "150px", cell: (row) => <span className="text-right block">${row.balance?.toLocaleString()}</span> }
    ];

    return (
        <StandardPage
            title="Lease Payment Schedule"
            description="View amortization and payment schedules"
            actions={
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Schedule
                </Button>
            }
        >
            <Card>
                <CardHeader>
                    <CardTitle>Payment Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="min-h-[300px] h-full border border-gray-200 rounded-lg">
                        <InteractiveSpreadsheet
                            columns={scheduleColumns}
                            data={schedule?.payments || []}
                            onChange={() => { }}
                            containerHeight="400px"
                        />
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
