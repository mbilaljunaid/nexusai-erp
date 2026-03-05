import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Save, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";


interface RCAAnalysis {
    id?: number;
    failureId: number;
    failureDescription: string;
    rootCauses: RootCause[];
    correctiveActions: CorrectiveAction[];
    status: 'IN_PROGRESS' | 'COMPLETE';
}

interface RootCause {
    id: string;
    category: '5WHY' | 'FISHBONE' | 'FTA';
    description: string;
    likelihood: number;
    impact: number;
}

interface CorrectiveAction {
    id: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    assignee?: string;
    dueDate?: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETE';
}

export default function RCAWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedFailure, setSelectedFailure] = useState("");
    const [rootCauses, setRootCauses] = useState<RootCause[]>([]);
    const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>([]);

    const { data: failures } = useQuery<any>({
        queryKey: ["/api/maintenance/failures"],
        queryFn: () => apiRequest("GET", "/api/maintenance/failures?status=OPEN").then(res => res.json()),
    });

    const { data: rcaData } = useQuery<any>({
        queryKey: ["/api/maintenance/rca", selectedFailure],
        queryFn: () => apiRequest("GET", `/api/maintenance/rca/${selectedFailure}`).then(res => res.json()),
        enabled: !!selectedFailure,
    });

    const saveMutation = useMutation({
        mutationFn: (data: RCAAnalysis) =>
            apiRequest("POST", "/api/maintenance/rca", data),
        onSuccess: () => {
            toast({ title: "Success", description: "RCA analysis saved" });
            queryClient.invalidateQueries({ queryKey: ["/api/maintenance/rca"] });
        },
    });

    const addRootCause = () => {
        setRootCauses([
            ...rootCauses,
            {
                id: `rc-${Date.now()}`,
                category: '5WHY',
                description: "",
                likelihood: 5,
                impact: 5,
            },
        ]);
    };

    const addCorrectiveAction = () => {
        setCorrectiveActions([
            ...correctiveActions,
            {
                id: `ca-${Date.now()}`,
                description: "",
                priority: 'MEDIUM',
                status: 'OPEN',
            },
        ]);
    };

    const updateRootCause = (id: string, updates: Partial<RootCause>) => {
        setRootCauses(rootCauses.map((rc) => (rc.id === id ? { ...rc, ...updates } : rc)));
    };

    const updateCorrectiveAction = (id: string, updates: Partial<CorrectiveAction>) => {
        setCorrectiveActions(correctiveActions.map((ca) => (ca.id === id ? { ...ca, ...updates } : ca)));
    };

    const saveRCA = () => {
        const failure = failures?.find((f: any) => f.id.toString() === selectedFailure);
        if (!failure) return;

        saveMutation.mutate({
            failureId: failure.id,
            failureDescription: failure.description,
            rootCauses,
            correctiveActions,
            status: 'IN_PROGRESS',
        });
    };

    return (
        <StandardPage title="Root Cause Analysis Workbench">
            <div className="flex justify-between items-center">
                <div>
                    
                    <p className="text-muted-foreground">Systematic failure analysis and corrective actions</p>
                </div>
                <Button onClick={saveRCA} disabled={saveMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Analysis
                </Button>
            </div>

            <div>
                <label className="text-sm font-medium">Select Failure Event</label>
                <Select value={selectedFailure} onValueChange={setSelectedFailure}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select failure to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                        {failures?.map((failure: any) => (
                            <SelectItem key={failure.id} value={failure.id.toString()}>
                                {failure.assetName} - {failure.description}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedFailure && (
                <div className="grid grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Root Causes</CardTitle>
                                <Button size="sm" onClick={addRootCause}>
                                    Add Cause
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {rootCauses.map((rc) => (
                                <Card key={rc.id}>
                                    <CardContent className="pt-4 space-y-3">
                                        <Select
                                            value={rc.category}
                                            onValueChange={(value: any) => updateRootCause(rc.id, { category: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5WHY">5 Whys</SelectItem>
                                                <SelectItem value="FISHBONE">Fishbone Diagram</SelectItem>
                                                <SelectItem value="FTA">Fault Tree Analysis</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Textarea
                                            value={rc.description}
                                            onChange={(e) => updateRootCause(rc.id, { description: e.target.value })}
                                            placeholder="Describe the root cause..."
                                            rows={3}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs text-muted-foreground">Likelihood (1-10)</label>
                                                <Select
                                                    value={rc.likelihood.toString()}
                                                    onValueChange={(value) => updateRootCause(rc.id, { likelihood: parseInt(value) })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[...Array(10)].map((_, i) => (
                                                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                                {i + 1}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground">Impact (1-10)</label>
                                                <Select
                                                    value={rc.impact.toString()}
                                                    onValueChange={(value) => updateRootCause(rc.id, { impact: parseInt(value) })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[...Array(10)].map((_, i) => (
                                                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                                {i + 1}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="text-sm">
                                            Risk Score: <span className="font-bold">{rc.likelihood * rc.impact}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Corrective Actions</CardTitle>
                                <Button size="sm" onClick={addCorrectiveAction}>
                                    Add Action
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {correctiveActions.map((ca) => (
                                <Card key={ca.id}>
                                    <CardContent className="pt-4 space-y-3">
                                        <Textarea
                                            value={ca.description}
                                            onChange={(e) => updateCorrectiveAction(ca.id, { description: e.target.value })}
                                            placeholder="Describe corrective action..."
                                            rows={2}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs text-muted-foreground">Priority</label>
                                                <Select
                                                    value={ca.priority}
                                                    onValueChange={(value: any) => updateCorrectiveAction(ca.id, { priority: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="HIGH">High</SelectItem>
                                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                                        <SelectItem value="LOW">Low</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground">Status</label>
                                                <Select
                                                    value={ca.status}
                                                    onValueChange={(value: any) => updateCorrectiveAction(ca.id, { status: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="OPEN">Open</SelectItem>
                                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                        <SelectItem value="COMPLETE">Complete</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}
        </StandardPage>
    );
}
