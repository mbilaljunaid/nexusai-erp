import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function PositionsTab() {
    const { data: positions, isLoading } = useQuery({
        queryKey: ["hr-positions"],
        queryFn: () => api.hr.structures.positions.list(),
    });

    const columns = [
        { key: "code", header: "Code", sortable: true, filterable: true },
        { key: "name", header: "Name", sortable: true, filterable: true },
        { key: "jobId", header: "Job ID", sortable: true }, // Ideally fetch Job Name
        { key: "departmentId", header: "Department ID", sortable: true }, // Ideally fetch Dept Name
        { key: "headcount", header: "Headcount", sortable: true },
        { key: "hiringStatus", header: "Hiring Status", sortable: true },
        {
            key: "activeStatus",
            header: "Status",
            render: (value: string) => (
                <Badge variant={value === "ACTIVE" ? "default" : "secondary"}>
                    {value || "ACTIVE"}
                </Badge>
            )
        },
        {
            key: "createdAt",
            header: "Created At",
            render: (value: string) => value ? format(new Date(value), "PP") : "-"
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Positions</h3>
                {/* TODO: Add Create Button */}
            </div>
            <DataTable
                data={positions || []}
                columns={columns}
                isLoading={isLoading}
                searchPlaceholder="Search positions..."
            />
        </div>
    );
}
