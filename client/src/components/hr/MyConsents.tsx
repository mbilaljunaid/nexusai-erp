
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Policy {
    code: string;
    version: string;
    title: string;
}

interface Acknowledgement {
    id: string;
    policyCode: string;
    consentVersion: string;
    acknowledgedAt: string;
}

export function MyConsents({ personId }: { personId?: string }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

    // Fetch Policies
    const { data, isLoading } = useQuery({
        queryKey: ["my-consents", personId],
        queryFn: async () => {
            const url = personId
                ? `/api/hr/compliance/policies/my-consents?personId=${personId}`
                : `/api/hr/compliance/policies/my-consents`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch consents");
            return res.json() as Promise<{ pending: Policy[], history: Acknowledgement[] }>;
        }
    });

    // Acknowledge Mutation
    const ackMutation = useMutation({
        mutationFn: async (policy: Policy) => {
            const res = await fetch("/api/hr/compliance/policies/acknowledge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    personId: personId || "me", // Backend handles "me" or derived ID
                    policyCode: policy.code,
                    consentVersion: policy.version,
                    userAgent: navigator.userAgent
                })
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Acknowledged", description: "Your consent has been recorded." });
            setSelectedPolicy(null);
            queryClient.invalidateQueries({ queryKey: ["my-consents"] });
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    if (isLoading) return <div>Loading policies...</div>;

    const pending = data?.pending || [];
    const history = data?.history || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Privacy & Consents
                </CardTitle>
                <CardDescription>Review and sign mandatory company policies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Pending Actions */}
                {pending.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-orange-600 flex items-center gap-1">
                            <FileText className="h-4 w-4" /> Action Required ({pending.length})
                        </h4>
                        <div className="grid gap-2">
                            {pending.map(policy => (
                                <div key={policy.code} className="flex items-center justify-between p-3 border rounded-md bg-orange-50/50">
                                    <div>
                                        <p className="font-medium text-sm">{policy.title}</p>
                                        <p className="text-xs text-muted-foreground">{policy.version}</p>
                                    </div>
                                    <Button size="sm" onClick={() => setSelectedPolicy(policy)}>Review</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* History */}
                <div className="space-y-2 pt-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Signed History</h4>
                    <div className="space-y-2">
                        {history.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No history yet.</p>
                        ) : (
                            history.map(ack => (
                                <div key={ack.id} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded">
                                    <span className="text-muted-foreground">{ack.policyCode} ({ack.consentVersion})</span>
                                    <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                                        <CheckCircle className="h-3 w-3" /> {new Date(ack.acknowledgedAt).toLocaleDateString()}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Modal */}
                <Dialog open={!!selectedPolicy} onOpenChange={(o) => !o && setSelectedPolicy(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Acknowledge Policy</DialogTitle>
                            <DialogDescription>
                                Please confirm that you have read and agree to the <b>{selectedPolicy?.title}</b> ({selectedPolicy?.version}).
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 text-sm text-muted-foreground bg-slate-50 p-4 rounded">
                            <p>By clicking "I Agree", you electronically sign this document and agree to be bound by its terms. This action is recorded with your IP address and timestamp.</p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedPolicy(null)}>Cancel</Button>
                            <Button onClick={() => selectedPolicy && ackMutation.mutate(selectedPolicy)} disabled={ackMutation.isPending}>
                                {ackMutation.isPending ? "Signing..." : "I Agree"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
