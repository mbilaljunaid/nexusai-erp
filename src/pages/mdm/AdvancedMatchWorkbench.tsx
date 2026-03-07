import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Merge, X, Check, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StandardPage } from "@/components/layout/StandardPage";


interface MatchCandidate {
    id: number;
    masterRecordId: number;
    candidateRecordId: number;
    matchScore: number;
    matchType: 'EXACT' | 'FUZZY' | 'PHONETIC' | 'RULE_BASED';
    matchedFields: string[];
    conflicts: MatchConflict[];
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface MatchConflict {
    field: string;
    masterValue: any;
    candidateValue: any;
    resolution?: 'KEEP_MASTER' | 'USE_CANDIDATE' | 'MANUAL';
}

export default function AdvancedMatchWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [entityType, setEntityType] = useState("CUSTOMER");
    const [matchThreshold, setMatchThreshold] = useState(85);
    const [selectedMatch, setSelectedMatch] = useState<MatchCandidate | null>(null);
    const [resolutions, setResolutions] = useState<Record<string, string>>({});

    const { data: matchCandidates, isLoading } = useQuery<any>({
        queryKey: ["/api/mdm/match-candidates", entityType, matchThreshold],
        queryFn: () => apiRequest("GET", `/api/mdm/match-candidates?entityType=${entityType}&threshold=${matchThreshold}`).then(res => res.json()),
    });

    const runMatchMutation = useMutation({
        mutationFn: async (params: any) => {
            const res = await apiRequest("POST", "/api/mdm/run-matching", params);
            return res.json();
        },
        onSuccess: (data: any) => {
            toast({ title: "Success", description: `Found ${data.matchCount} potential matches` });
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/match-candidates"] });
        },
    });

    const approveMergeMutation = useMutation({
        mutationFn: ({ matchId, resolutions }: { matchId: number; resolutions: Record<string, string> }) =>
            apiRequest("POST", `/api/mdm/match-candidates/${matchId}/merge`, { resolutions }),
        onSuccess: () => {
            toast({ title: "Success", description: "Records merged successfully" });
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/match-candidates"] });
            setSelectedMatch(null);
            setResolutions({});
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (matchId: number) =>
            apiRequest("POST", `/api/mdm/match-candidates/${matchId}/reject`),
        onSuccess: () => {
            toast({ title: "Success", description: "Match rejected" });
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/match-candidates"] });
            setSelectedMatch(null);
        },
    });

    const resolveConflict = (field: string, resolution: string) => {
        setResolutions({ ...resolutions, [field]: resolution });
    };

    const approveMerge = () => {
        if (!selectedMatch) return;
        approveMergeMutation.mutate({ matchId: selectedMatch.id, resolutions });
    };

    const getMatchTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            EXACT: "bg-green-100 text-green-700",
            FUZZY: "bg-blue-100 text-blue-700",
            PHONETIC: "bg-purple-100 text-purple-700",
            RULE_BASED: "bg-orange-100 text-orange-700",
        };
        return colors[type] || "bg-muted text-foreground/90";
    };

    return (
        <StandardPage title="Advanced Match Workbench">
            <div className="flex justify-between items-center">
                <div>

                    <p className="text-muted-foreground">AI-powered duplicate detection and merge resolution</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => runMatchMutation.mutate({ entityType, threshold: matchThreshold })}
                        disabled={runMatchMutation.isPending}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Run Matching
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label>Entity Type</Label>
                    <Select value={entityType} onValueChange={setEntityType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                            <SelectItem value="SUPPLIER">Supplier</SelectItem>
                            <SelectItem value="PRODUCT">Product</SelectItem>
                            <SelectItem value="ACCOUNT">Account</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Match Threshold (%)</Label>
                    <Input
                        type="number"
                        value={matchThreshold}
                        onChange={(e) => setMatchThreshold(parseInt(e.target.value))}
                        min="0"
                        max="100"
                    />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <Card className="col-span-5">
                    <CardHeader>
                        <CardTitle>Match Candidates ({matchCandidates?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                        {matchCandidates?.map((match: MatchCandidate) => (
                            <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => setSelectedMatch(match)}>
                            <div
                                                            key={match.id}
                                                            className={cn(`p-3 rounded-lg cursor-pointer border ${selectedMatch?.id === match.id ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                                                                }`)}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="font-medium">Match #{match.id}</div>
                                                                <div className="flex gap-2">
                                                                    <Badge className={getMatchTypeColor(match.matchType)}>{match.matchType}</Badge>
                                                                    <Badge variant={match.matchScore >= 95 ? "default" : "secondary"}>
                                                                        {match.matchScore}%
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                Master ID: {match.masterRecordId} ↔ Candidate ID: {match.candidateRecordId}
                                                            </div>
                                                            <div className="text-sm mt-1">
                                                                Matched fields: {match.matchedFields?.join(", ")}
                                                            </div>
                                                            {match.conflicts?.length > 0 && (
                                                                <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                                                                    <AlertCircle className="h-3 w-3" />
                                                                    {match.conflicts.length} conflict(s)
                                                                </div>
                                                            )}
                                                            <Progress value={match.matchScore} className="h-1 mt-2" />
                                                        </div>
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                <Card className="col-span-7">
                    <CardHeader>
                        <CardTitle>Match Review & Resolution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedMatch ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Master Record</h3>
                                        <div className="border rounded-lg p-4 bg-blue-500/10">
                                            <div className="text-sm">ID: {selectedMatch.masterRecordId}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Candidate Record</h3>
                                        <div className="border rounded-lg p-4 bg-green-500/10">
                                            <div className="text-sm">ID: {selectedMatch.candidateRecordId}</div>
                                        </div>
                                    </div>
                                </div>

                                {selectedMatch.conflicts && selectedMatch.conflicts.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-3">Field Conflicts - Choose Value to Keep</h3>
                                        <div className="space-y-3">
                                            {selectedMatch.conflicts.map((conflict, i) => (
                                                <div key={i} className="border rounded-lg p-4">
                                                    <div className="font-medium mb-2">{conflict.field}</div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => resolveConflict(conflict.field, 'KEEP_MASTER')}>
                                                        <div
                                                                                                                    className={cn(`p-3 rounded border-2 cursor-pointer ${resolutions[conflict.field] === 'KEEP_MASTER'
                                                                                                                        ? "border-primary bg-primary/5"
                                                                                                                        : "border-border"
                                                                                                                        }`)}
                                                                                                                >
                                                                                                                    <div className="text-xs text-muted-foreground mb-1">Master Value</div>
                                                                                                                    <div className="font-medium">{conflict.masterValue || '(empty)'}</div>
                                                                                                                    {resolutions[conflict.field] === 'KEEP_MASTER' && (
                                                                                                                        <Check className="h-4 w-4 text-primary mt-2" />
                                                                                                                    )}
                                                                                                                </div>
                                                        </Button>
                                                        <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => resolveConflict(conflict.field, 'USE_CANDIDATE')}>
                                                        <div
                                                                                                                    className={cn(`p-3 rounded border-2 cursor-pointer ${resolutions[conflict.field] === 'USE_CANDIDATE'
                                                                                                                        ? "border-primary bg-primary/5"
                                                                                                                        : "border-border"
                                                                                                                        }`)}
                                                                                                                >
                                                                                                                    <div className="text-xs text-muted-foreground mb-1">Candidate Value</div>
                                                                                                                    <div className="font-medium">{conflict.candidateValue || '(empty)'}</div>
                                                                                                                    {resolutions[conflict.field] === 'USE_CANDIDATE' && (
                                                                                                                        <Check className="h-4 w-4 text-primary mt-2" />
                                                                                                                    )}
                                                                                                                </div>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 justify-end border-t pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => rejectMutation.mutate(selectedMatch.id)}
                                        disabled={rejectMutation.isPending}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject Match
                                    </Button>
                                    <Button
                                        onClick={approveMerge}
                                        disabled={
                                            selectedMatch.conflicts?.some(
                                                (c) => !resolutions[c.field]
                                            ) || approveMergeMutation.isPending
                                        }
                                    >
                                        <Merge className="h-4 w-4 mr-2" />
                                        Approve & Merge
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <Search className="h-12 w-12 mb-4" />
                                <p>Select a match candidate to review</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
