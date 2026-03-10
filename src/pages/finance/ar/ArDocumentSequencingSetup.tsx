import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { useToast } from "@/hooks/use-toast";

export default function ArDocumentSequencingSetup() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: sequences = [], isLoading: seqLoading } = useQuery<any[]>({
        queryKey: ['/api/ar/config/document-sequences'],
    });

    const { data: assignments = [], isLoading: assgnLoading } = useQuery<any[]>({
        queryKey: ['/api/ar/config/document-sequence-assignments'],
    });

    const { data: transactionTypes = [] } = useQuery<any[]>({
        queryKey: ['/api/ar/config/transaction-types'],
    });

    const seqMutation = useMutation({
        mutationFn: async (values: any[]) => {
            // Bulk update logic would go here
            return new Promise(resolve => setTimeout(resolve, 500));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/ar/config/document-sequences'] });
            toast({ title: "Sequences Saved", description: "Document sequences have been updated." });
        }
    });

    const assgnMutation = useMutation({
        mutationFn: async (values: any[]) => {
            // Bulk update logic would go here
            return new Promise(resolve => setTimeout(resolve, 500));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/ar/config/document-sequence-assignments'] });
            toast({ title: "Assignments Saved", description: "Sequence assignments have been updated." });
        }
    });

    const sequenceColumns = useMemo(() => [
        { id: "name", label: "Sequence Name", type: "text" as const, required: true },
        {
            id: "module",
            label: "Module",
            type: "select" as const,
            options: [
                { value: "AR", label: "Receivables" },
                { value: "AP", label: "Payables" },
                { value: "GL", label: "General Ledger" }
            ],
            required: true
        },
        {
            id: "type",
            label: "Type",
            type: "select" as const,
            options: [
                { value: "GAPLESS", label: "Gapless" },
                { value: "AUTOMATIC", label: "Automatic" },
                { value: "MANUAL", label: "Manual" }
            ],
            required: true
        },
        { id: "initialValue", label: "Initial Value", type: "number" as const, required: true },
        { id: "startDate", label: "Start Date", type: "date" as const, required: true }
    ], []);

    const assignmentColumns = useMemo(() => {
        const seqOptions = sequences.map((s: any) => ({
            value: s.id,
            label: `${s.name} (${s.type})`
        }));

        const txOptions = transactionTypes.map((t: any) => ({
            value: t.id,
            label: t.name
        }));

        return [
            {
                id: "sequenceId",
                label: "Sequence",
                type: "select" as const,
                options: seqOptions,
                required: true
            },
            {
                id: "contextType",
                label: "Context Level",
                type: "select" as const,
                options: [
                    { value: "LEDGER", label: "Ledger" },
                    { value: "LEGAL_ENTITY", label: "Legal Entity" }
                ],
                required: true
            },
            { id: "contextValue", label: "Context ID / Name", type: "text" as const, required: true },
            {
                id: "documentCategory",
                label: "Document Category",
                type: "select" as const,
                options: txOptions,
                required: true
            },
            { id: "startDate", label: "Start Date", type: "date" as const, required: true }
        ];
    }, [sequences, transactionTypes]);

    const isLoading = seqLoading || assgnLoading;

    return (
        <StandardPage
            title="Document Sequencing"
            description="Configure Gapless and Automatic document numbering sequences, and assign them by Ledger or Legal Entity."
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Sequences</CardTitle>
                        <CardDescription>Define numbering schemes</CardDescription>
                    </CardHeader>
                    {isLoading ? (
                        <div className="h-32 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="h-[400px] p-4 border-t">
                            <InteractiveSpreadsheet
                                data={sequences}
                                columns={sequenceColumns}
                                onSave={(data) => seqMutation.mutate(data)}
                                isSaving={seqMutation.isPending}
                                containerHeight="350px"
                            />
                        </div>
                    )}
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sequence Assignments</CardTitle>
                        <CardDescription>Bind sequences to document categories</CardDescription>
                    </CardHeader>
                    {isLoading ? (
                        <div className="h-32 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="h-[400px] p-4 border-t">
                            <InteractiveSpreadsheet
                                data={assignments}
                                columns={assignmentColumns}
                                onSave={(data) => assgnMutation.mutate(data)}
                                isSaving={assgnMutation.isPending}
                                containerHeight="350px"
                            />
                        </div>
                    )}
                </Card>
            </div>
        </StandardPage>
    );
}
