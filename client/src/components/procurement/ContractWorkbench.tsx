import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, ShieldCheck, AlertTriangle, BookOpen, Search, User, Calendar, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContractWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedContract, setSelectedContract] = useState<any>(null);
    const [isNewContractOpen, setIsNewContractOpen] = useState(false);
    const [analysisResults, setAnalysisResults] = useState<any>(null);

    // Mock supplier ID for now (usually obtained from context or selection)
    const supplierId = "any";

    const { data: contracts, isLoading: isLoadingContracts } = useQuery({
        queryKey: [`/api/contract-portal/contracts/supplier/${supplierId}`],
    });

    const { data: clauses, isLoading: isLoadingClauses } = useQuery({
        queryKey: ["/api/contract-portal/clauses"],
    });

    const analyzeMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/contract-portal/contracts/${id}/analyze`, { method: "POST" });
            if (!res.ok) throw new Error("AI Analysis failed");
            return res.json();
        },
        onSuccess: (data) => {
            setAnalysisResults(data);
            toast({ title: "AI Analysis Complete", description: "Compliance check finished." });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const contractDetails = useQuery({
        queryKey: [`/api/contract-portal/contracts/${selectedContract?.id}`],
        enabled: !!selectedContract
    });

    if (isLoadingContracts) return <div className="p-8">Loading contracts...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" /> Procurement Contracts
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Manage legal agreements, terms, and spend compliance.</p>
                </div>
                <Button onClick={() => setIsNewContractOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> New Contract
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="px-0">
                            <div className="rounded-xl border bg-card overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Contract #</TableHead>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Limit</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contracts?.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                                    No contracts found for this supplier.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            contracts?.map((c: any) => (
                                                <TableRow key={c.id} className="group hover:bg-muted/30 transition-colors">
                                                    <TableCell className="font-mono text-xs font-bold text-primary">{c.contractNumber}</TableCell>
                                                    <TableCell className="font-medium text-sm">{c.title}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={
                                                            c.status === 'ACTIVE' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                                "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                        }>
                                                            {c.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm font-semibold">
                                                        ${Number(c.totalAmountLimit).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => {
                                                            setSelectedContract(c);
                                                            setAnalysisResults(null);
                                                        }}>
                                                            Review Terms
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-1">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-primary" /> Clause Library
                            </CardTitle>
                            <CardDescription className="text-[10px]">Standard legal terms for quick drafting.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                <Input placeholder="Search clauses..." className="pl-9 text-xs h-9 bg-muted/30 border-none shadow-none" />
                            </div>
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-3">
                                    {clauses?.map((clause: any) => (
                                        <div key={clause.id} className="p-3 border rounded-lg bg-muted/10 hover:border-primary/50 transition-colors cursor-pointer group">
                                            <div className="flex justify-between items-start">
                                                <p className="text-xs font-bold">{clause.title}</p>
                                                <Badge variant="secondary" className="text-[9px] h-4">{clause.category}</Badge>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2">
                                                {clause.clauseText}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono text-[10px]">{selectedContract?.contractNumber}</Badge>
                            <DialogTitle>{selectedContract?.title}</DialogTitle>
                        </div>
                        <DialogDescription>Review individual clauses and run AI compliance checks.</DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="terms" className="mt-4">
                        <TabsList className="bg-muted/50 p-1">
                            <TabsTrigger value="terms">Agreement Terms</TabsTrigger>
                            <TabsTrigger value="compliance">AI Compliance Analysis</TabsTrigger>
                        </TabsList>

                        <TabsContent value="terms" className="mt-4">
                            <div className="grid grid-cols-3 gap-6">
                                <div className="col-span-1 border-r pr-6 space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Header Information</h4>
                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> Supplier ID</span>
                                            <span className="text-sm font-medium">{selectedContract?.supplierId}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Validity</span>
                                            <span className="text-sm font-medium">
                                                {selectedContract?.startDate ? new Date(selectedContract.startDate).toLocaleDateString() : 'N/A'} -
                                                {selectedContract?.endDate ? new Date(selectedContract.endDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><CreditCard className="w-3 h-3" /> Amount Limit</span>
                                            <span className="text-sm font-bold text-primary">
                                                ${Number(selectedContract?.totalAmountLimit).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <ScrollArea className="h-[450px] pr-4">
                                        <div className="space-y-6">
                                            {contractDetails.isLoading ? (
                                                <p className="text-xs italic">Loading clauses...</p>
                                            ) : contractDetails.data?.terms?.length === 0 ? (
                                                <div className="text-center py-12 bg-muted/10 border-2 border-dashed rounded-lg">
                                                    <p className="text-xs text-muted-foreground">No clauses added to this contract yet.</p>
                                                    <Button variant="link" size="sm">Add from Library</Button>
                                                </div>
                                            ) : (
                                                contractDetails.data?.terms?.map((term: any) => (
                                                    <div key={term.id} className="space-y-3">
                                                        <div className="flex justify-between items-center bg-muted/30 p-2 px-3 rounded-md">
                                                            <h5 className="text-xs font-bold text-primary">{term.clauseTitle}</h5>
                                                            <Badge variant="outline" className="text-[9px]">{term.category}</Badge>
                                                        </div>
                                                        <div className="p-4 border rounded-lg bg-background text-sm leading-relaxed text-muted-foreground">
                                                            {term.amendedText || term.standardText}
                                                        </div>
                                                        {term.amendedText && (
                                                            <div className="flex items-center gap-2 px-2">
                                                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                                                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider italic">Amended from Standard Library</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="compliance" className="mt-4">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/20">
                                    <div>
                                        <h4 className="font-bold flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-primary" /> NexusAI Compliance Engine
                                        </h4>
                                        <p className="text-[10px] text-muted-foreground mt-1 underline">Scan clauses for high-risk deviations and regulatory mismatch.</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => analyzeMutation.mutate(selectedContract.id)}
                                        disabled={analyzeMutation.isPending}
                                    >
                                        {analyzeMutation.isPending ? "Analyzing..." : "Run AI Deep-Scan"}
                                    </Button>
                                </div>

                                <ScrollArea className="h-[400px]">
                                    {analysisResults ? (
                                        <div className="space-y-4">
                                            {analysisResults.map((res: any, idx: number) => (
                                                <Card key={idx} className="border-muted/60 shadow-none">
                                                    <CardHeader className="py-3 px-4 bg-muted/50 rounded-t-lg">
                                                        <CardTitle className="text-xs">{res.clauseTitle}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-4 text-sm whitespace-pre-wrap leading-relaxed">
                                                        {res.analysis}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                                            <ShieldCheck className="w-12 h-12 mb-4" />
                                            <p className="text-sm font-medium">Compliance scan has not been initiated.</p>
                                            <p className="text-[10px]">Our AI compares legal language against your approved corpus.</p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-6 pt-4 border-t gap-2">
                        <Button variant="outline" onClick={() => setSelectedContract(null)}>Close Workbench</Button>
                        <div className="flex-1" />
                        <Button variant="secondary" className="gap-2">
                            <FileText className="w-4 h-4" /> Export as PDF
                        </Button>
                        <Button>Finalize & Activate Contract</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
