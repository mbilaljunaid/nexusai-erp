import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    FileText,
    Plus,
    Download,
    Send,
    Sparkles,
    Loader2,
    CheckCircle,
    AlertCircle,
    Edit
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ClauseLibraryModal } from "@/components/contracts/ClauseLibraryModal";
import { ContractAIAnalysisPanel } from "@/components/contracts/ContractAIAnalysisPanel";
import { ESignatureModal } from "@/components/contracts/ESignatureModal";
import { apiRequest } from "@/lib/queryClient";
import { StandardPage } from "@/components/layout/StandardPage";


export default function ContractDetail() {
    const [, params] = useRoute("/contracts/:id");
    const contractId = params?.id;
    const queryClient = useQueryClient();

    const [showClauseLibrary, setShowClauseLibrary] = useState(false);
    const [showAIAnalysis, setShowAIAnalysis] = useState(false);
    const [showESignature, setShowESignature] = useState(false);

    // Fetch contract details
    const { data: contract, isLoading } = useQuery({
        queryKey: [`/api/contract-portal/contracts/${contractId}`],
        queryFn: async () => {
            const res = await fetch(`/api/contract-portal/contracts/${contractId}`);
            if (!res.ok) throw new Error("Failed to fetch contract");
            return res.json();
        },
        enabled: !!contractId
    });

    // Generate PDF mutation
    const generatePdfMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/contract-portal/contracts/${contractId}/generate-pdf`, {
                method: "POST"
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "PDF Generated", description: "Contract PDF is ready for download" });
            queryClient.invalidateQueries({ queryKey: [`/api/contract-portal/contracts/${contractId}`] });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    // Download PDF
    const handleDownloadPdf = async () => {
        try {
            const res = await fetch(`/api/contract-portal/contracts/${contractId}/download-pdf`);
            if (!res.ok) throw new Error("PDF not found");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `contract-${contract?.contractNumber || contractId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);

            toast({ title: "Download Started", description: "Contract PDF downloaded" });
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    if (isLoading) {
        return (
            <StandardPage title="{contract.title}">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </StandardPage>
        );
    }

    if (!contract) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Contract not found</p>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            DRAFT: { variant: "secondary", className: "bg-gray-100 text-gray-800" },
            ACTIVE: { variant: "default", className: "bg-green-100 text-green-800" },
            PENDING: { variant: "secondary", className: "bg-yellow-100 text-yellow-800" },
            EXPIRED: { variant: "outline", className: "border-red-300 text-red-800" }
        };
        const config = variants[status] || { variant: "outline" };
        return <Badge {...config}>{status}</Badge>;
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                            
                            <p className="text-sm text-muted-foreground">Contract #{contract.contractNumber}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {getStatusBadge(contract.status)}
                    {contract.esignStatus && (
                        <Badge variant="outline" className="gap-1">
                            {contract.esignStatus === 'SIGNED' && <CheckCircle className="h-3 w-3" />}
                            E-Sign: {contract.esignStatus}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap">
                <Button onClick={() => setShowClauseLibrary(true)} variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Clause
                </Button>
                <Button onClick={() => setShowAIAnalysis(true)} variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Analysis
                </Button>
                <Button
                    onClick={() => generatePdfMutation.mutate()}
                    variant="outline"
                    className="gap-2"
                    disabled={generatePdfMutation.isPending}
                >
                    {generatePdfMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    Generate PDF
                </Button>
                {contract.pdfFilePath && (
                    <Button onClick={handleDownloadPdf} variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download PDF
                    </Button>
                )}
                {contract.status === 'DRAFT' && (
                    <Button onClick={() => setShowESignature(true)} className="gap-2">
                        <Send className="h-4 w-4" />
                        Send for Signature
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="details">Contract Details</TabsTrigger>
                    <TabsTrigger value="terms">Terms & Clauses</TabsTrigger>
                    <TabsTrigger value="activity">Activity Log</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <span className="text-muted-foreground">Contract Type:</span>
                                    <span className="font-medium">{contract.contractType}</span>

                                    <span className="text-muted-foreground">Supplier:</span>
                                    <span className="font-medium">{contract.supplierName || '-'}</span>

                                    <span className="text-muted-foreground">Start Date:</span>
                                    <span className="font-medium">
                                        {contract.startDate ? format(new Date(contract.startDate), 'MMM d, yyyy') : '-'}
                                    </span>

                                    <span className="text-muted-foreground">End Date:</span>
                                    <span className="font-medium">
                                        {contract.endDate ? format(new Date(contract.endDate), 'MMM d, yyyy') : '-'}
                                    </span>

                                    <span className="text-muted-foreground">Total Value:</span>
                                    <span className="font-medium">
                                        {contract.totalAmount ?
                                            new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: contract.currency || 'USD'
                                            }).format(Number(contract.totalAmount))
                                            : '-'
                                        }
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Status & Compliance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Contract Status</span>
                                        {getStatusBadge(contract.status)}
                                    </div>
                                    {contract.esignStatus && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">E-Signature</span>
                                            <Badge variant="outline">{contract.esignStatus}</Badge>
                                        </div>
                                    )}
                                    {contract.pdfFilePath && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">PDF Available</span>
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {contract.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{contract.description}</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="terms" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Contract Terms & Clauses</CardTitle>
                                    <CardDescription>Manage contract clauses from library</CardDescription>
                                </div>
                                <Button onClick={() => setShowClauseLibrary(true)} size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Clause
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {contract.terms && contract.terms.length > 0 ? (
                                <div className="space-y-4">
                                    {contract.terms.map((term: any, idx: number) => (
                                        <div key={idx} className="p-4 border rounded-lg space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm">{term.title || `Clause ${idx + 1}`}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">{term.text}</p>
                                                </div>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {term.category && (
                                                <Badge variant="outline" className="text-xs">{term.category}</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No clauses added yet</p>
                                    <Button
                                        onClick={() => setShowClauseLibrary(true)}
                                        variant="outline"
                                        size="sm"
                                        className="mt-4"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add First Clause
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Log</CardTitle>
                            <CardDescription>Track all changes and actions on this contract</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground text-center py-8">
                                Activity tracking coming soon
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <ClauseLibraryModal
                isOpen={showClauseLibrary}
                onClose={() => setShowClauseLibrary(false)}
                contractId={contractId}
            />

            <ContractAIAnalysisPanel
                isOpen={showAIAnalysis}
                onClose={() => setShowAIAnalysis(false)}
                contractId={contractId}
            />

            <ESignatureModal
                isOpen={showESignature}
                onClose={() => setShowESignature(false)}
                contractId={contractId}
                contractNumber={contract.contractNumber}
            />
        </div>
    );
}
