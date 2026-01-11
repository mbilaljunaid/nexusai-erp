import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, ArrowLeftRight, CheckCircle } from "lucide-react";
import { NettingAgreement, NettingSettlement } from "@shared/schema/netting";

export default function NettingWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedAgreement, setSelectedAgreement] = useState<string | null>(null);

    // Fetch Agreements
    const { data: agreements, isLoading } = useQuery<NettingAgreement[]>({
        queryKey: ["/api/netting/agreements"],
    });

    return (
        <div className="space-y-6 p-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Netting Workbench
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage AP/AR netting agreements and execute settlements.
                    </p>
                </div>
                <CreateAgreementDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Agreement List */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Agreements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (
                            agreements?.map(agreement => (
                                <div
                                    key={agreement.id}
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedAgreement === agreement.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}
                                    onClick={() => setSelectedAgreement(agreement.id)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold">{agreement.agreementName}</h3>
                                        <Badge variant="outline">{agreement.status}</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p>Currency: {agreement.nettingCurrency}</p>
                                        <p>Freq: {agreement.frequency}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        {agreements?.length === 0 && <p className="text-center text-muted-foreground">No agreements found.</p>}
                    </CardContent>
                </Card>

                {/* Settlement Workspace */}
                <Card className="md:col-span-2 min-h-[500px]">
                    <CardHeader>
                        <CardTitle>Settlement Proposal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedAgreement ? (
                            <SettlementProposal agreementId={selectedAgreement} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4 py-20">
                                <ArrowLeftRight className="h-16 w-16" />
                                <p>Select an agreement to view proposals</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function CreateAgreementDialog() {
    // Simplified creation for MVP
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/netting/agreements", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/netting/agreements"] });
            setIsOpen(false);
            toast({ title: "Success", description: "Agreement created" });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        // Hardcoded IDs for Phase 1 Demo since we don't have pickers here yet
        mutation.mutate({
            agreementName: formData.get("name"),
            customerId: "cust-123", // Mock
            supplierId: 101, // Mock
            nettingCurrency: "USD",
            frequency: "Monthly"
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> New Agreement</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Netting Agreement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Agreement Name</Label>
                        <Input name="name" required placeholder="e.g. Global Netting" />
                    </div>
                    {/* Simplified: No Customer/Supplier pickers in MVP dialog */}
                    <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-md">
                        Demo Mode: Creates agreement for Primary Customer/Supplier pair.
                    </div>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function SettlementProposal({ agreementId }: { agreementId: string }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: proposal, isLoading } = useQuery({
        queryKey: ["/api/netting/agreements", agreementId, "proposal"],
        enabled: !!agreementId
    });

    const settlementMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/netting/settlements", {
                agreementId: agreementId,
                nettedAmount: proposal.nettedAmount,
                direction: proposal.proposedDirection,
                status: "Settled"
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/netting/agreements", agreementId, "proposal"] });
            toast({ title: "Settled", description: "Netting settlement processed successfully." });
        }
    });

    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin mx-auto" />;

    if (!proposal) return <div>Error loading proposal</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total AR (Receivable)</p>
                    <p className="text-xl font-bold text-green-600">${proposal.totalArAmount}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total AP (Payable)</p>
                    <p className="text-xl font-bold text-red-600">${proposal.totalApAmount}</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-center">
                    <p className="text-sm text-blue-800 font-medium">Proposed Netting</p>
                    <p className="text-xl font-bold text-blue-700">${proposal.nettedAmount}</p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-medium">Open Items</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="border rounded-md p-3">
                        <h4 className="font-medium mb-2 text-green-700">AR Invoices</h4>
                        {proposal.arInvoices.length === 0 ? <p className="text-muted-foreground">No open item.</p> : (
                            <ul className="space-y-1">
                                {proposal.arInvoices.map((inv: any) => (
                                    <li key={inv.id} className="flex justify-between">
                                        <span>{inv.invoiceNumber}</span>
                                        <span>${inv.totalAmount}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="border rounded-md p-3">
                        <h4 className="font-medium mb-2 text-red-700">AP Invoices</h4>
                        {proposal.apInvoices.length === 0 ? <p className="text-muted-foreground">No open item.</p> : (
                            <ul className="space-y-1">
                                {proposal.apInvoices.map((inv: any) => (
                                    <li key={inv.id} className="flex justify-between">
                                        <span>{inv.invoiceNumber}</span>
                                        <span>${inv.invoiceAmount}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button
                    onClick={() => settlementMutation.mutate()}
                    disabled={settlementMutation.isPending || proposal.nettedAmount <= 0}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {settlementMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Execute Settlement
                </Button>
            </div>
        </div>
    );
}

