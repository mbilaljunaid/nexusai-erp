import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { PromptDialog } from "@/components/shared/PromptDialog";

interface PerfTemplate {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

export default function PerformanceConfiguration() {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const { data: templates = [], refetch } = useQuery<PerfTemplate[]>({
        queryKey: ["/api/performance/templates"],
        // In real app, we'd need to mock or implement this endpoint
        queryFn: async () => {
            // Mock data since endpoint isn't fully wired or exposed yet for GET
            return [
                { id: "1", name: "Annual Review 2025", description: "Standard annual appraisal", isActive: true },
                { id: "2", name: "Probation Review", description: "3-month check-in", isActive: true }
            ];
        }
    });

    const createTemplate = (name: string) => {
        // Mock Create
        toast({ title: "Template Created (Mock)", description: `Created template: ${name}` });
        // fetch("/api/performance/templates", { method: "POST", ... })
    };

    return (
        <StandardPage
            title="Performance Configuration"
            description="Manage appraisal templates and periods."
            actions={
                <Button onClick={() => setCreateDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Template</Button>
            }
        >

            <div className="grid grid-cols-1 gap-4">
                {templates.map(t => (
                    <Card key={t.id} className="hover-elevate">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold">{t.name}</h3>
                                <p className="text-sm text-muted-foreground">{t.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <PromptDialog
                open={createDialogOpen}
                title="New Performance Template"
                label="Template Name"
                placeholder="e.g. Annual Review 2026"
                confirmLabel="Create"
                onConfirm={(name) => { setCreateDialogOpen(false); createTemplate(name); }}
                onCancel={() => setCreateDialogOpen(false)}
            />
        </StandardPage>
    );
}
