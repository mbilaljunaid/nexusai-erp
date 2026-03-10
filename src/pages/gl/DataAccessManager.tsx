import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardTitle, CardDescription, CardHeader } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";

export default function DataAccessManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: sets = [], isLoading: setsLoading } = useQuery<any>({
        queryKey: ["/api/gl/access-sets"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/gl/access-sets");
            return res.json();
        }
    });

    const { data: ledgers = [], isLoading: ledgersLoading } = useQuery<any>({
        queryKey: ["/api/finance/gl/ledgers"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/finance/gl/ledgers");
            return res.json();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any[]) => {
            // Mock API call for bulk update
            return new Promise(resolve => setTimeout(resolve, 500));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/access-sets"] });
            toast({ title: "Policies Saved", description: "Data Access Sets updated successfully." });
        }
    });

    const columns = useMemo(() => {
        const ledgerOptions = ledgers.map((l: any) => ({
            value: l.id,
            label: l.name
        }));

        return [
            { id: "name", label: "Set Name", type: "text" as const, required: true },
            {
                id: "accessLevel",
                label: "Access Level",
                type: "select" as const,
                options: [
                    { value: "Read", label: "Read Only" },
                    { value: "Write", label: "Read & Write" }
                ],
                required: true,
                defaultValue: "Read"
            },
            {
                id: "ledgerId",
                label: "Target Ledger",
                type: "select" as const,
                options: ledgerOptions,
                required: true
            }
        ];
    }, [ledgers]);

    if (setsLoading || ledgersLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <StandardPage
            title="Data Access Sets"
            description="Define security policies to restrict user access to specific Ledgers or Segment Values."
        >
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" /> Security Definitions
                        </CardTitle>
                        <CardDescription>Manage ledger-level and segment-level data security policies</CardDescription>
                    </CardHeader>
                    <div className="h-[600px] p-4 border-t">
                        <InteractiveSpreadsheet
                            data={sets}
                            columns={columns}
                            onSave={(data) => updateMutation.mutate(data)}
                            isSaving={updateMutation.isPending}
                            containerHeight="550px"
                        />
                    </div>
                </Card>
            </div>
        </StandardPage>
    );
}
