import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AuditLogView() {
    const { data: transactions, isLoading } = useQuery({
        queryKey: ["hr-transactions"],
        queryFn: () => api.hr.persons.getTransactions(),
    });

    const columns = [
        {
            key: "updatedAt",
            header: "Date",
            render: (_: any, row: any) => format(new Date(row.updatedAt), "PP p")
        },
        {
            key: "personName",
            header: "Person",
            render: (_: any, row: any) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.personName}</span>
                    <span className="text-xs text-muted-foreground">ID: {row.personId.slice(0, 8)}...</span>
                </div>
            )
        },
        {
            key: "action",
            header: "Action", // Infer action from data
            render: (_: any, row: any) => {
                if (row.assignmentStatus !== "ACTIVE") return <Badge variant="destructive">Termination / Inactive</Badge>;
                if (row.assignmentNumber.includes("-")) return <Badge variant="secondary">Transfer / Update</Badge>;
                return <Badge variant="outline">Update</Badge>;
            }
        },
        { key: "updatedBy", header: "Actor" },
        {
            key: "details",
            header: "Details",
            render: (_: any, row: any) => (
                <span className="text-sm text-muted-foreground">
                    {row.job} • {row.dept}
                </span>
            )
        }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Global Transaction Log</CardTitle>
                <CardDescription>Recent HR transactions across the organization.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable
                    data={transactions || []}
                    columns={columns}
                    isLoading={isLoading}
                />
            </CardContent>
        </Card>
    );
}
