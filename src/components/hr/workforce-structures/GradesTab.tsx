import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function GradesTab() {
    const { data: grades, isLoading } = useQuery({
        queryKey: ["hr-grades"],
        queryFn: () => api.hr.structures.grades.list(),
    });

    const columns = [
        { key: "code", header: "Code", sortable: true, filterable: true },
        { key: "name", header: "Name", sortable: true, filterable: true },
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
                <h3 className="text-lg font-medium">Grades</h3>
                {/* TODO: Add Create Button */}
            </div>
            <DataTable
                data={grades || []}
                columns={columns}
                isLoading={isLoading}
                searchPlaceholder="Search grades..."
            />
        </div>
    );
}
