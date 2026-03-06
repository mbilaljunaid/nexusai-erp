import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, AlertTriangle, CheckCircle, XCircle, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { format } from "date-fns";


interface DuplicateSet {
    id: string;
    partyIds: string[];
    matchScore: number;
    status: "OPEN" | "RESOLVED" | "IGNORED";
    createdAt: string;
}

interface Party {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    type: "PERSON" | "ORGANIZATION";
    createdAt: string;
}

export default function DuplicateDetectionWorkbench() {
    const [selectedSet, setSelectedSet] = useState<string | null>(null);
    const [selectedSurvivor, setSelectedSurvivor] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Fetch duplicate sets
    const { data: duplicateSets = [], isLoading: loadingSets } = useQuery<any>({
        queryKey: ["/api/mdm/quality/duplicates"],
    });

    // Fetch party details for selected set
    const { data: partyDetails = [] } = useQuery<any>({
        queryKey: ["/api/mdm/parties", selectedSet],
        enabled: !!selectedSet,
        queryFn: async () => {
            const set = duplicateSets.find((s: DuplicateSet) => s.id === selectedSet);
            if (!set) return [];

            const parties = await Promise.all(
                set.partyIds.map((id: string) =>
                    fetch(`/api/mdm/parties/${id}`).then(r => r.json())
                )
            );
            return parties;
        },
    });

    // Run batch matching
    const runBatch = useMutation({
        mutationFn: async (batchName: string) => {
            const res = await fetch("/api/mdm/quality/match-batch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ batchName }),
            });
            if (!res.ok) throw new Error("Failed to run batch");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/quality/duplicates"] });
        },
    });

    // Resolve duplicate
    const resolveDuplicate = useMutation({
        mutationFn: async ({ setId, survivorId }: { setId: string; survivorId: string }) => {
            const res = await fetch(`/api/mdm/quality/duplicates/${setId}/resolve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ survivorPartyId: survivorId }),
            });
            if (!res.ok) throw new Error("Failed to resolve duplicate");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/quality/duplicates"] });
            setSelectedSet(null);
            setSelectedSurvivor(null);
        },
    });

    const selectedSetData = duplicateSets.find((s: DuplicateSet) => s.id === selectedSet);

    return (
        <StandardPage title="Duplicate Detection">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>

                    <p className="text-muted-foreground">
                        Identify and resolve duplicate master records
                    </p>
                </div>
                <Button
                    onClick={() => runBatch.mutate("manual-batch-" + Date.now())}
                    disabled={runBatch.isPending}
                >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {runBatch.isPending ? "Running..." : "Run Match Batch"}
                </Button>
            </div>

            {/* Status Alert */}
            {runBatch.isSuccess && (
                <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>
                        Match batch completed successfully. Found {runBatch.data?.setsCreated || 0} duplicate sets.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Duplicate Sets List */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Open Duplicate Sets</CardTitle>
                        <CardDescription>
                            {duplicateSets.length} sets require review
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {loadingSets ? (
                            <TableSkeleton rows={4} />
                        ) : duplicateSets.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No duplicates found</p>
                        ) : (
                            duplicateSets.map((set: DuplicateSet) => (
                                <div role="button" tabIndex={0}
                                    key={set.id}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${selectedSet === set.id ? "bg-accent border-primary" : ""
                                        }`}
                                    onClick={() => setSelectedSet(set.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <Badge variant="outline">
                                            <Users className="w-3 h-3 mr-1" />
                                            {set.partyIds.length} records
                                        </Badge>
                                        <Badge variant={set.matchScore >= 90 ? "destructive" : "warning"}>
                                            {set.matchScore}% match
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(set.createdAt), "MMM d, yyyy")}
                                    </p>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Detail View */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Duplicate Comparison</CardTitle>
                        <CardDescription>
                            Review records and select survivor
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!selectedSet ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Select a duplicate set to review</p>
                            </div>
                        ) : partyDetails.length === 0 ? (
                            <p className="text-muted-foreground">Loading details...</p>
                        ) : (
                            <div className="space-y-6">
                                {/* Side-by-side comparison */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {partyDetails.map((party: Party) => (
                                        <div role="button" tabIndex={0}
                                            key={party.id}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedSurvivor === party.id
                                                ? "border-primary ring-2 ring-primary bg-primary/5"
                                                : "hover:border-primary/50"
                                                }`}
                                            onClick={() => setSelectedSurvivor(party.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <Badge>{party.type}</Badge>
                                                {selectedSurvivor === party.id && (
                                                    <CheckCircle className="w-5 h-5 text-primary" />
                                                )}
                                            </div>

                                            <h3 className="font-semibold mb-2">{party.name}</h3>

                                            <div className="space-y-1 text-sm">
                                                {party.email && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Email:</span>
                                                        <span className="font-mono">{party.email}</span>
                                                    </div>
                                                )}
                                                {party.phone && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Phone:</span>
                                                        <span className="font-mono">{party.phone}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Created:</span>
                                                    <span>{format(new Date(party.createdAt), "MMM d, yyyy")}</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t">
                                                <p className="text-xs text-muted-foreground">
                                                    ID: {party.id}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Match Details */}
                                {selectedSetData && (
                                    <Alert>
                                        <AlertTriangle className="w-4 h-4" />
                                        <AlertDescription>
                                            <strong>Match Score: {selectedSetData.matchScore}%</strong>
                                            <br />
                                            These records were identified as potential duplicates. Select the master record
                                            (survivor) to keep, and click Merge to consolidate.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => {
                                            if (selectedSurvivor) {
                                                resolveDuplicate.mutate({
                                                    setId: selectedSet,
                                                    survivorId: selectedSurvivor,
                                                });
                                            }
                                        }}
                                        disabled={!selectedSurvivor || resolveDuplicate.isPending}
                                        className="flex-1"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {resolveDuplicate.isPending ? "Merging..." : "Merge Records"}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedSet(null);
                                            setSelectedSurvivor(null);
                                        }}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
