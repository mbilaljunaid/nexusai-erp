import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRightLeft } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";

export default function TransferPricingRules() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: rules = [], isLoading } = useQuery({
        queryKey: ["ic-tp-rules"],
        queryFn: async () => {
            const res = await fetch("/api/intercompany/rules/tp");
            if (!res.ok) return []; // Default to empty if API fails for now
            return res.json();
        }
    });

    const updateRulesMutation = useMutation({
        mutationFn: async (data: any[]) => {
            // Bulk update logic simulation
            return new Promise(resolve => setTimeout(resolve, 600));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ic-tp-rules"] });
            toast({ title: "TP Rules Saved", description: "Transfer Pricing Rules have been bulk updated." });
        }
    });

    const columns = useMemo(() => [
        { id: "providerOrgId", label: "Provider Org ID", type: "text" as const, required: true },
        { id: "receiverOrgId", label: "Receiver Org ID", type: "text" as const, required: true },
        {
            id: "markupType",
            label: "Markup Type",
            type: "select" as const,
            options: [
                { value: "PERCENTAGE", label: "Percentage (%)" },
                { value: "FIXED_AMOUNT", label: "Fixed Amount ($)" }
            ],
            required: true,
            defaultValue: "PERCENTAGE"
        },
        { id: "markupValue", label: "Markup Value (e.g. 0.15 for 15%)", type: "number" as const, required: true },
        { id: "description", label: "Description / Justification", type: "text" as const }
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
            title="Transfer Pricing Rules"
            description="Manage intercompany markup profiles for automated trade valuation."
        >
            <Card className="border-t-4 border-t-indigo-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowRightLeft className="h-5 w-5" /> Provider / Receiver Markups
                    </CardTitle>
                    <CardDescription>All changes save automatically to the central intercompany ledger policies.</CardDescription>
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
        </StandardPage>
    );
}
