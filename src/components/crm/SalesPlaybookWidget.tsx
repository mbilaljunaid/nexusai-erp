import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, ListTodo, AlertCircle } from "lucide-react";

export function SalesPlaybookWidget({ stage }: { stage: string }) {
    const { data: playbooks = [], isLoading } = useQuery({
        queryKey: ["/api/crm/playbooks"],
    });

    const playbooksList = playbooks as any[];

    // Find if there's an active playbook for the current stage
    const activePlaybook = playbooksList.find((pb: any) => pb.stageRule === stage && pb.isActive);

    if (isLoading) {
        return <div className="animate-pulse h-32 bg-muted/20 rounded-xl" />;
    }

    if (!activePlaybook) {
        return null; // No playbook for this stage
    }

    return (
        <Card className="border-primary/20 shadow-sm bg-primary/5">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-primary/10">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                    <BookOpen className="h-4 w-4" />
                    Stage Playbook: {activePlaybook.name}
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-primary/60" />
            </CardHeader>
            <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-4">{activePlaybook.description}</p>
                <div className="space-y-3">
                    {/* Hardcoded tasks for demonstration since playbook tasks are not fully seeded. */}
                    <div className="flex items-start gap-2">
                        <div className="mt-0.5 line-through opacity-50"><ListTodo className="h-4 w-4 text-green-600" /></div>
                        <span className="text-sm line-through opacity-50">Review Account History</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="mt-0.5"><ListTodo className="h-4 w-4 text-amber-500" /></div>
                        <span className="text-sm font-medium">Identify Economic Buyer</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="mt-0.5"><ListTodo className="h-4 w-4 text-amber-500" /></div>
                        <span className="text-sm font-medium">Confirm Budget Allocation</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
