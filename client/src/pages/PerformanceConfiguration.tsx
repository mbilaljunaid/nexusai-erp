import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface PerfTemplate {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

export default function PerformanceConfiguration() {
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

    const createTemplate = () => {
        const name = prompt("Template Name:");
        if (!name) return;

        // Mock Create
        toast({ title: "Template Created (Mock)", description: `Created template: ${name}` });
        // fetch("/api/performance/templates", { method: "POST", ... })
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-semibold">Performance Configuration</h1>
                    <p className="text-muted-foreground">Manage appraisal templates and periods.</p>
                </div>
                <Button onClick={createTemplate}><Plus className="w-4 h-4 mr-2" /> New Template</Button>
            </div>

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
        </div>
    );
}
