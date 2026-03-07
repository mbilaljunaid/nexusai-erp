import { useLocation } from "wouter";
import ModuleLayout from "@/components/layouts/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Sparkles, Box } from "lucide-react";

const formatPathToTitle = (path: string) => {
    // e.g., /finance/expense-management -> Expense Management
    const parts = path.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    if (!lastPart) return "Module";

    return lastPart.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export function GenericModuleDashboard() {
    const [location] = useLocation();
    const title = formatPathToTitle(location);

    return (
        <ModuleLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-gray-200">{title}</h1>
                <p className="text-muted-foreground mt-2">{title} functionality is part of the NexusAI Enterprise Platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-dashed border-2 bg-slate-500/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Wrench className="h-5 w-5" />
                            Module Under Construction
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            Welcome to the <strong>{title}</strong> preview page.
                            This module is scheduled for implementation in the next deployment phase.
                        </p>
                        <p>
                            The NexusAI team is actively building out full functional capabilities for this domain, including advanced analytics, automated workflows, and AI-driven insights.
                        </p>
                        <div className="flex items-center gap-4 pt-4">
                            <div className="flex items-center gap-2 bg-blue-500/10 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                <Sparkles className="h-4 w-4" />
                                AI Copilot Support Planned
                            </div>
                            <div className="flex items-center gap-2 bg-muted text-foreground/90 px-3 py-1 rounded-full text-sm font-medium">
                                <Box className="h-4 w-4" />
                                Enterprise Modules
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ModuleLayout>
    );
}

export default GenericModuleDashboard;
