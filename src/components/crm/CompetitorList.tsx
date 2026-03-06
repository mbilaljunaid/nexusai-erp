import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ShieldAlert, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";

interface Competitor {
    id: string;
    name: string;
    strengths?: string;
    weaknesses?: string;
    threatLevel?: string;
}

interface OpportunityCompetitor {
    id: string;
    competitorId: string;
    opportunityId: string;
    status: string;
    notes?: string;
    competitorName: string;
    competitorStrengths?: string;
    competitorWeaknesses?: string;
}

export function CompetitorList({ opportunityId }: { opportunityId: string }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Fetch Linked Competitors
    const { data: linkedCompetitors, isLoading } = useQuery<OpportunityCompetitor[]>({
        queryKey: ["/api/crm/competitors/opportunity", opportunityId],
        queryFn: () => fetch(`/api/crm/competitors/opportunity/${opportunityId}`).then(res => res.json())
    });

    // Fetch All Competitors (for selection)
    const { data: allCompetitors } = useQuery<Competitor[]>({
        queryKey: ["/api/crm/competitors"],
        queryFn: () => fetch("/api/crm/competitors").then(res => res.json())
    });

    // Add Link Mutation
    const addMutation = useMutation({
        mutationFn: async (data: any) => {
            await apiRequest("POST", "/api/crm/competitors/opportunity", {
                ...data,
                opportunityId
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/competitors/opportunity", opportunityId] });
            setIsAddOpen(false);
            toast({ title: "Competitor Added", description: "Competitor linked to opportunity." });
        }
    });

    // Remove Link Mutation
    const removeMutation = useMutation({
        mutationFn: async (linkId: string) => {
            await apiRequest("DELETE", `/api/crm/competitors/opportunity/${linkId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/competitors/opportunity", opportunityId] });
            toast({ title: "Removed", description: "Competitor unlinked." });
        }
    });

    // Create New Competitor Mutation (Quick Add)
    const createCompetitorMutation = useMutation({
        mutationFn: async (name: string) => {
            const res = await apiRequest("POST", "/api/crm/competitors", { name });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/competitors"] });
            toast({ title: "Competitor Created", description: "New competitor added to master list." });
        }
    });

    const [selectedCompetitorId, setSelectedCompetitorId] = useState("");
    const [status, setStatus] = useState("Active");
    const [notes, setNotes] = useState("");
    const [newCompetitorName, setNewCompetitorName] = useState("");

    const handleAdd = () => {
        if (!selectedCompetitorId) return;
        addMutation.mutate({
            competitorId: selectedCompetitorId,
            status,
            notes
        });
    };

    const handleQuickCreate = async () => {
        if (!newCompetitorName) return;
        try {
            const newComp = await createCompetitorMutation.mutateAsync(newCompetitorName);
            setSelectedCompetitorId(newComp.id);
            setNewCompetitorName("");
        } catch (e) {
            // error handled by mutation
        }
    }

    if (isLoading) return <div>Loading competitors...</div>;

    const linked = linkedCompetitors || [];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Competitive Analysis</h3>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Competitor
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Link Competitor to Deal</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Competitor</Label>
                                <div className="flex gap-2">
                                    <Select value={selectedCompetitorId} onValueChange={setSelectedCompetitorId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select competitor..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allCompetitors?.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        placeholder="Or create new..."
                                        value={newCompetitorName}
                                        onChange={e => setNewCompetitorName(e.target.value)}
                                    />
                                    <Button variant="secondary" onClick={handleQuickCreate} disabled={!newCompetitorName || createCompetitorMutation.isPending}>
                                        Create
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Status in Deal</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active Threat</SelectItem>
                                        <SelectItem value="Winning">Winning</SelectItem>
                                        <SelectItem value="Lost To">Lost To</SelectItem>
                                        <SelectItem value="Evaluating">Evaluating</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Strategy / Notes</Label>
                                <Textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="How start we positioning against them?"
                                />
                            </div>
                            <Button onClick={handleAdd} disabled={addMutation.isPending || !selectedCompetitorId} className="w-full">
                                {addMutation.isPending ? "Adding..." : "Add Competitor"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {linked.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                    No competitors identified for this deal.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {linked.map(link => (
                        <div key={link.id} className="p-4 border rounded-xl bg-card hover:bg-muted/10 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold flex items-center gap-2">
                                        {link.competitorName}
                                        {link.status === 'Active' && <ShieldAlert className="h-4 w-4 text-orange-500" />}
                                        {link.status === 'Winning' && <ShieldCheck className="h-4 w-4 text-green-500" />}
                                    </h4>
                                    <span className={cn(`text-xs px-2 py-0.5 rounded-full font-medium ${link.status === 'Lost To' ? 'bg-red-100 text-red-700' :
                                            link.status === 'Winning' ? 'bg-green-100 text-green-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`)}>
                                        {link.status}
                                    </span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeMutation.mutate(link.id)}>
                                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                                </Button>
                            </div>
                            {link.notes && (
                                <p className="text-sm text-muted-foreground mt-2 bg-muted/30 p-2 rounded">
                                    "{link.notes}"
                                </p>
                            )}
                            {(link.competitorStrengths || link.competitorWeaknesses) && (
                                <div className="mt-3 text-xs grid grid-cols-2 gap-2">
                                    {link.competitorStrengths && (
                                        <div className="text-green-600 bg-green-50 p-1 rounded">
                                            <strong>+ </strong> {link.competitorStrengths}
                                        </div>
                                    )}
                                    {link.competitorWeaknesses && (
                                        <div className="text-red-600 bg-red-50 p-1 rounded">
                                            <strong>- </strong> {link.competitorWeaknesses}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
