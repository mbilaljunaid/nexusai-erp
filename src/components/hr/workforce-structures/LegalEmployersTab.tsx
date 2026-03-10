import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CreateLegalEmployerDialog } from "./CreateLegalEmployerDialog";

export function LegalEmployersTab() {
    const { data: orgs, isLoading } = useQuery({
        queryKey: ["hr-organizations", "LEGAL_EMPLOYER"],
        queryFn: () => api.hr.structures.organizations.list("LEGAL_EMPLOYER"),
    });

    const legalEmployers = orgs || [];

    const columns = [
        { key: "name", header: "Legal Name", sortable: true, filterable: true },
        { key: "registrationNumber", header: "Reg. Number", sortable: true, filterable: true },
        { key: "taxId", header: "Tax ID", sortable: true, filterable: true },
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
                <h3 className="text-lg font-medium">Legal Employers</h3>
                <CreateLegalEmployerDialog />
            </div>
            <DataTable
                data={legalEmployers}
                columns={columns}
                isLoading={isLoading}
                searchPlaceholder="Search legal employers..."
            />
        </div>
    );
}
