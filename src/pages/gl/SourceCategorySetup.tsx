import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Database, Loader2 } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";

export default function SourceCategorySetup() {
    const { toast } = useToast();

    const { data: sources = [], isLoading: sourcesLoading } = useQuery<any[]>({
        queryKey: ["/api/gl/config/sources"],
    });

    const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({
        queryKey: ["/api/gl/config/categories"],
    });

    const updateSourcesMutation = useMutation({
        mutationFn: async (data: any[]) => {
            // Mock API call for bulk update
            return new Promise(resolve => setTimeout(resolve, 500));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/config/sources"] });
            toast({ title: "Sources Saved", description: "Journal sources have been successfully updated." });
        },
    });

    const updateCategoriesMutation = useMutation({
        mutationFn: async (data: any[]) => {
            // Mock API call for bulk update
            return new Promise(resolve => setTimeout(resolve, 500));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/gl/config/categories"] });
            toast({ title: "Categories Saved", description: "Journal categories have been successfully updated." });
        },
    });

    const sourceColumns = useMemo(() => [
        { id: "sourceName", label: "Source Name", type: "text" as const, required: true },
        { id: "description", label: "Description", type: "text" as const },
        { id: "importJournalLines", label: "Import Lines (API)", type: "boolean" as const },
        { id: "freezeJournals", label: "Freeze Once Imported", type: "boolean" as const },
        { id: "requireApproval", label: "Approval Required", type: "boolean" as const },
        { id: "isActive", label: "Status", type: "boolean" as const, defaultValue: true }
    ], []);

    const categoryColumns = useMemo(() => [
        { id: "categoryName", label: "Category Name", type: "text" as const, required: true },
        { id: "description", label: "Description", type: "text" as const },
        { id: "isActive", label: "Status", type: "boolean" as const, defaultValue: true }
    ], []);

    if (sourcesLoading || categoriesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <StandardPage
            title="Sources & Categories"
            description="Standard Origins: Manual, Spreadsheet, Intercompany, Payables, Receivables"
        >
            <Tabs defaultValue="sources" className="space-y-4">
                <TabsList className="bg-muted p-1">
                    <TabsTrigger value="sources" className="flex items-center gap-2">
                        <Database className="h-4 w-4" /> Journal Sources
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Journal Categories
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sources" className="space-y-4">
                    <Card className="border-none shadow-md overflow-hidden">
                        <div className="h-[600px] p-4">
                            <InteractiveSpreadsheet
                                data={sources}
                                columns={sourceColumns}
                                onSave={(data) => updateSourcesMutation.mutate(data)}
                                isSaving={updateSourcesMutation.isPending}
                                containerHeight="550px"
                            />
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="categories" className="space-y-4">
                    <Card className="border-none shadow-md overflow-hidden">
                        <div className="h-[600px] p-4">
                            <InteractiveSpreadsheet
                                data={categories}
                                columns={categoryColumns}
                                onSave={(data) => updateCategoriesMutation.mutate(data)}
                                isSaving={updateCategoriesMutation.isPending}
                                containerHeight="550px"
                            />
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
