import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function JobsTab() {
    const { data: jobs, isLoading } = useQuery({
        queryKey: ["hr-jobs"],
        queryFn: () => api.hr.structures.jobs.list(),
    });

    const columns = [
        { key: "code", header: "Code", sortable: true, filterable: true },
        { key: "name", header: "Name", sortable: true, filterable: true },
        { key: "fullTimeEquivalent", header: "FTE", sortable: true },
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
                <h3 className="text-lg font-medium">Jobs</h3>
                {/* TODO: Add Create Button */}
            </div>
            <DataTable
                data={jobs || []}
                columns={columns}
                isLoading={isLoading}
                searchPlaceholder="Search jobs..."
            />
        </div>
    );
}
