import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Link, useRoute } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle, FileText, User } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PromptDialog } from "@/components/shared/PromptDialog";
import { formatCurrency } from "@/lib/formatters";

export default function ContractDetailView() {
    const [match, params] = useRoute("/contracts/:id");
    const id = (params as any)?.id;
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [addLineDialogOpen, setAddLineDialogOpen] = useState(false);
    const [addDocDialogOpen, setAddDocDialogOpen] = useState(false);
    const [lineForm, setLineForm] = useState({ desc: "", qty: "1", price: "1000" });

    const { data: contract, isLoading } = useQuery<any>({
        queryKey: ["contract", id],
        queryFn: async () => {
            const res = await fetch(`/api/contracts/${id}`);
            if (!res.ok) throw new Error("Failed to fetch contract");
            return res.json();
        },
        enabled: !!id
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            const res = await fetch(`/api/contracts/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error("Failed to update status");
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["contract", id] });
            toast({ title: "Status Updated", description: `Contract is now ${data.status}` });
        }
    });

    if (isLoading) return <div className="p-6"><Skeleton className="h-[400px] w-full" /></div>;
    if (!contract) return <div className="p-6">Contract not found</div>;

    return (
        <StandardPage
            title="ContractDetailView"
            description=""
            className="p-6 space-y-6 bg-muted/50 min-h-screen"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/contracts">
                        <Button variant="ghost" size="icon" aria-label="Go back"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{contract.title}</h1>
                            <Badge variant="outline">{contract.contractNumber}</Badge>
                            <StatusBadge
                                status={contract.status === 'ACTIVE' ? 'active' : contract.status === 'DRAFT' ? 'info' : 'warning'}
                                label={contract.status}
                            />
                        </div>
                        <p className="text-muted-foreground">{contract.description}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {contract.status === 'DRAFT' && (
                        <Button onClick={() => updateStatusMutation.mutate("ACTIVE")}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Activate Contract
                        </Button>
                    )}
                    {contract.status === 'ACTIVE' && (
                        <Button variant="destructive" onClick={() => updateStatusMutation.mutate("TERMINATED")}>
                            Terminate
                        </Button>
                    )}
                    <Button variant="outline">Edit</Button>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="lines">Lines & Obligations</TabsTrigger>
                    <TabsTrigger value="parties">Signatories</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-3 gap-6">
                        <Card className="col-span-2">
                            <CardHeader><CardTitle>Key Terms</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                                    <p>{contract.contractType}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Currency</label>
                                    <p>{contract.currency}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                                    <p>{format(new Date(contract.startDate), "MMM d, yyyy")}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">End Date</label>
                                    <p>{contract.endDate ? format(new Date(contract.endDate), "MMM d, yyyy") : 'Indefinite'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                                    <p className="text-lg font-bold">
                                        {contract.totalAmount ?
                                            formatCurrency(Number(contract.totalAmount, contract.currency))
                                            : '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Notice Period</label>
                                    <p>{contract.terminationNoticeDays || 30} Days</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Renewal Info</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>Auto Renewal</span>
                                    <Badge variant={contract.autoRenewal ? "default" : "secondary"}>
                                        {contract.autoRenewal ? "Enabled" : "Disabled"}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Next Renewal</label>
                                    <p>{contract.renewalDate ? format(new Date(contract.renewalDate), "MMM d, yyyy") : 'N/A'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="lines">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Contract Lines</CardTitle>
                            <Button size="sm" onClick={() => setAddLineDialogOpen(true)}>+ Add Line Item</Button>
                        </CardHeader>
                        <CardContent>
                            {(contract.lines && contract.lines.length > 0) ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>#</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Unit Price</TableHead>
                                            <TableHead>Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contract.lines.map((line: any) => (
                                            <TableRow key={line.id}>
                                                <TableCell>{line.lineNumber}</TableCell>
                                                <TableCell>{line.itemDescription}</TableCell>
                                                <TableCell>{line.quantity}</TableCell>
                                                <TableCell>${formatCurrency(Number(line.unitPrice))}</TableCell>
                                                <TableCell>${formatCurrency(Number(line.lineAmount))}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                    No lines added yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="parties">
                    {/* ... (Parties Content remains same, verifying logical flow) ... */}
                    <Card>
                        <CardHeader><CardTitle>Parties</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {contract.parties?.map((p: any) => (
                                    <div key={p.id} className="flex justify-between items-center p-3 border rounded">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-2 rounded-full"><User className="h-4 w-4 text-blue-600" /></div>
                                            <div>
                                                <p className="font-medium">{p.partyName}</p>
                                                <p className="text-xs text-muted-foreground">{p.role} • {p.email}</p>
                                            </div>
                                        </div>
                                        {p.hasSigned
                                            ? <StatusBadge status="active" label="Signed" />
                                            : <Badge variant="secondary">Pending Signature</Badge>}
                                    </div>
                                ))}
                                {(!contract.parties || contract.parties.length === 0) && (
                                    <div className="text-center py-4 text-muted-foreground">No parties listed</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle>Documents</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => setAddDocDialogOpen(true)}>Upload Document</Button>
                        </CardHeader>
                        <CardContent className="py-4">
                            {(contract.documents && contract.documents.length > 0) ? (
                                <div className="space-y-2">
                                    {contract.documents.map((doc: any) => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-500/10">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-blue-500" />
                                                <div>
                                                    <p className="font-medium text-sm">{doc.documentName}</p>
                                                    <p className="text-xs text-muted-foreground">{format(new Date(doc.uploadedAt), "MMM d, yyyy")} • {doc.documentType}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href="#" onClick={(e) => { e.preventDefault(); window.open(doc.url, '_blank'); }}>Download</a>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-muted-foreground gap-2 py-8">
                                    <FileText className="h-10 w-10 opacity-20" />
                                    <p>No documents uploaded.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add Line Item Dialog */}
            <Dialog open={addLineDialogOpen} onOpenChange={setAddLineDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader><DialogTitle>Add Contract Line Item</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1">
                            <Label>Item Description</Label>
                            <Input placeholder="e.g. Professional Services" value={lineForm.desc} onChange={e => setLineForm(f => ({ ...f, desc: e.target.value }))} autoFocus />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Quantity</Label>
                                <Input type="number" value={lineForm.qty} onChange={e => setLineForm(f => ({ ...f, qty: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                                <Label>Unit Price</Label>
                                <Input type="number" value={lineForm.price} onChange={e => setLineForm(f => ({ ...f, price: e.target.value }))} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddLineDialogOpen(false)}>Cancel</Button>
                        <Button disabled={!lineForm.desc.trim()} onClick={() => {
                            const desc = lineForm.desc.trim();
                            const qty = Number(lineForm.qty) || 1;
                            const price = Number(lineForm.price) || 0;
                            const amount = qty * price;
                            setAddLineDialogOpen(false);
                            fetch(`/api/contracts/${id}/lines`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ contractId: id, lineNumber: (contract.lines?.length || 0) + 1, itemDescription: desc, quantity: qty, unitPrice: price, lineAmount: amount, obligationType: "DELIVERABLE" })
                            }).then(() => {
                                toast({ title: "Line Added", description: "Contract line created." });
                                queryClient.invalidateQueries({ queryKey: ["contract", id] });
                            });
                        }}>Add Line</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Upload Document Dialog */}
            <PromptDialog
                open={addDocDialogOpen}
                title="Upload Document"
                description="Enter a name for the document. A simulated S3 URL will be generated."
                label="Document Name"
                placeholder="e.g. Master Service Agreement"
                confirmLabel="Upload"
                onConfirm={(name) => {
                    setAddDocDialogOpen(false);
                    const url = "s3://nexusai-erp/" + name.replace(/\s+/g, '-').toLowerCase() + ".pdf";
                    fetch(`/api/contracts/${id}/documents`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ contractId: id, documentName: name, documentType: "CONTRACT", url })
                    }).then(() => {
                        toast({ title: "Document Uploaded", description: "Metadata saved." });
                        queryClient.invalidateQueries({ queryKey: ["contract", id] });
                    });
                }}
                onCancel={() => setAddDocDialogOpen(false)}
            />
        </StandardPage>
    );
}
