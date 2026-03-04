import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";

export default function CVRManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const ledgerId = "PRIMARY"; // Context

    const { data: rules = [], isLoading } = useQuery({
        queryKey: ["/api/gl/cvr", ledgerId],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/gl/cvr?ledgerId=${ledgerId}`);
            return res.json();
        }
    });

    const updateRulesMutation = useMutation({
        mutationFn: async (data: any[]) => {
            // Bulk update logic simulation
            return new Promise(resolve => setTimeout(resolve, 800));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/cvr"] });
            toast({ title: "Rules Saved", description: "Cross-Validation Rules updated successfully." });
        }
    });

    const columns = useMemo(() => [
        { id: "ruleName", label: "Rule Name", type: "text" as const, required: true },
        { id: "includeFilter", label: "Condition (Include) e.g. Seg2=100", type: "text" as const, required: true },
        { id: "excludeFilter", label: "Validation (Exclude Block) e.g. Seg3=5000", type: "text" as const, required: true },
        { id: "errorMessage", label: "Error Message to User", type: "text" as const, required: true },
        { id: "isEnabled", label: "Active Status", type: "boolean" as const, defaultValue: true }
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
            title="Cross-Validation Rules"
            description="Prevent invalid account combinations (e.g., Cost Center 100 cannot use Account 5000) directly inline."
        >
            <div className="grid gap-6">
                <Card className="border-t-4 border-t-rose-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5" /> Active Rules
                        </CardTitle>
                        <CardDescription>Rules are evaluated in top-down order during journal entry.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        <div className="h-[600px] border-t">
                            <InteractiveSpreadsheet
                                data={rules}
                                columns={columns}
                                onSave={(data) => updateRulesMutation.mutate(data)}
                                isSaving={updateRulesMutation.isPending}
                                containerHeight="550px"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
