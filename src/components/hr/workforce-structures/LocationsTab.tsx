import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CreateLocationDialog } from "./CreateLocationDialog";

export function LocationsTab() {
    const { data: locations, isLoading } = useQuery({
        queryKey: ["hr-locations"],
        queryFn: () => api.hr.structures.locations.list(),
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
        { key: "city", header: "City", sortable: true, filterable: true },
        { key: "country", header: "Country", sortable: true, filterable: true },
        {
            key: "createdAt",
            header: "Created At",
            render: (value: string) => value ? format(new Date(value), "PP") : "-"
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Locations</h3>
                <CreateLocationDialog />
            </div>
            <DataTable
                data={locations || []}
                columns={columns}
                isLoading={isLoading}
                searchPlaceholder="Search locations..."
            />
        </div>
    );
}
