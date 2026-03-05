import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";

export default function BusinessUnits() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: businessUnits = [], isLoading } = useQuery<any>({
        queryKey: ["/api/enterprise/business-units"],
        queryFn: async () => {
            const res = await fetch("/api/enterprise/business-units");
            if (!res.ok) return [];
            return res.json();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any[]) => {
            // Simulated bulk update API
            return new Promise(resolve => setTimeout(resolve, 600));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/enterprise/business-units"] });
            toast({ title: "Business Units Saved", description: "Operational node hierarchy updated successfully." });
        },
        onError: (err: any) => {
            toast({ title: "Update Failed", description: err.message, variant: "destructive" });
        }
    });

    const columns = useMemo(() => [
        { id: "code", label: "Unique Code", type: "text" as const, required: true },
        { id: "name", label: "Business Unit Name", type: "text" as const, required: true },
        { id: "description", label: "Description Area", type: "text" as const },
        {
            id: "status",
            label: "Node Status",
            type: "select" as const,
            options: [
                { value: "Active", label: "Actively Trading" },
                { value: "Inactive", label: "Inactive Hierarchy" },
                { value: "Draft", label: "Draft Stage" }
            ],
            required: true,
            defaultValue: "Active"
        }
    ], []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
        );
    }

    return (
        <StandardPage
            title="Business Units"
            description="Rapidly define and manage Operational nodes, Regions, and reporting Segments inline."
            breadcrumbs={[
                { label: "Company Setup", href: "/company-setup" },
                { label: "Business Units" }
            ]}
        >
            <Card className="border-t-4 border-t-amber-500 rounded-lg shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" /> Operational Nodes
                    </CardTitle>
                    <CardDescription>
                        Declare nodes representing independent operational entities or ledgers across your enterprise.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <div className="h-[600px] border-t">
                        <InteractiveSpreadsheet
                            data={businessUnits}
                            columns={columns}
                            onSave={(data) => updateMutation.mutate(data)}
                            isSaving={updateMutation.isPending}
                            containerHeight="550px"
                        />
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
