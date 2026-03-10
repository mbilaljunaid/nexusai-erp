import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldAlert, Plus, Send, ClipboardCheck, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function SupplierQualificationManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isInitiateOpen, setIsInitiateOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [selectedQuestionnaire, setSelectedQuestionnaire] = useState("INFO_SEC_STANDARD");

    const { data: assessments, isLoading } = useQuery({
        queryKey: ["/api/procurement/supplier-assessments"],
        queryFn: async () => {
            // Stub for future backend
            return [
                { id: "SQ-2026-001", supplierId: "SUP-GlobalTech", supplierName: "Global Tech Supplies", questionnaire: "Information Security V1", status: "PENDING_RESPONSE", score: null, criticalRisk: false, dueDate: "2026-03-20" },
                { id: "SQ-2026-002", supplierId: "SUP-AeroParts", supplierName: "AeroParts Global", questionnaire: "Financial Health Assessment", status: "EVALUATED", score: 92, criticalRisk: false, dueDate: "2026-02-15" },
                { id: "SQ-2026-003", supplierId: "SUP-ChemCorp", supplierName: "ChemCorp Inc.", questionnaire: "ESG & Sustainability Compliance", status: "REJECTED", score: 45, criticalRisk: true, dueDate: "2026-03-01" },
            ];
        }
    });

    const initiateMutation = useMutation({
        mutationFn: async () => {
            return new Promise((resolve) => setTimeout(resolve, 800));
        },
        onSuccess: () => {
            setIsInitiateOpen(false);
            setSelectedSupplier("");
            toast({ title: "Assessment Initiated", description: "Questionnaire has been dispatched to the supplier portal." });
        }
    });

    const getStatusBadge = (status: string, risk: boolean) => {
        if (risk) return <Badge variant="destructive"><ShieldAlert className="w-3 h-3 mr-1" /> High Risk</Badge>;
        switch (status) {
            case "PENDING_RESPONSE": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Supplier</Badge>;
            case "EVALUATED": return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Qualified</Badge>;
            case "REJECTED": return <Badge variant="destructive">Disqualified</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Supplier Qualification Management</h1>
                    <p className="text-muted-foreground mt-1">Assess supplier capabilities, risk profiles, and compliance before ASL approval.</p>
                </div>

                <Dialog open={isInitiateOpen} onOpenChange={setIsInitiateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="w-4 h-4 mr-2" /> Initiate Assessment</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Initiate Qualification</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Select Supplier</Label>
                                <Input
                                    value={selectedSupplier}
                                    onChange={e => setSelectedSupplier(e.target.value)}
                                    placeholder="Enter Supplier Name or ID"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Questionnaire Template</Label>
                                <Select value={selectedQuestionnaire} onValueChange={setSelectedQuestionnaire}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INFO_SEC_STANDARD">Information Security Standard</SelectItem>
                                        <SelectItem value="FINANCIAL_HEALTH">Financial Health & Audit</SelectItem>
                                        <SelectItem value="ESG_COMPLIANCE">ESG & Sustainability Compliance</SelectItem>
                                        <SelectItem value="QUALITY_QMS">Quality Management (ISO 9001)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsInitiateOpen(false)}>Cancel</Button>
                            <Button
                                disabled={!selectedSupplier || initiateMutation.isPending}
                                onClick={() => initiateMutation.mutate()}
                            >
                                <Send className="w-4 h-4 mr-2" /> Dispatch Email
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <ClipboardCheck className="w-4 h-4" /> Active Assessments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">14</div>
                        <p className="text-xs text-muted-foreground mt-1">Pending supplier response or internal review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-green-600" /> Avg Qualification Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">86.4</div>
                        <p className="text-xs text-muted-foreground mt-1">Across approved ASL suppliers (trailing 12m)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <ShieldAlert className="w-4 h-4 text-destructive" /> Critical Risks Identified
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-destructive">2</div>
                        <p className="text-xs text-muted-foreground mt-1">Evaluations triggering immediate disqualification</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Qualification Assessments</CardTitle>
                            <CardDescription>Track the lifecycle of supplier evaluations and risk scores.</CardDescription>
                        </div>
                        <Input placeholder="Search supplier or assessment ID..." className="max-w-xs" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Assessment ID</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Questionnaire Subject</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status & Compliance</TableHead>
                                <TableHead className="text-right">Final Score</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assessments?.map((sq: any) => (
                                <TableRow key={sq.id}>
                                    <TableCell className="font-medium">{sq.id}</TableCell>
                                    <TableCell>
                                        <div className="font-medium text-sm">{sq.supplierName}</div>
                                        <div className="text-xs text-muted-foreground">{sq.supplierId}</div>
                                    </TableCell>
                                    <TableCell>{sq.questionnaire}</TableCell>
                                    <TableCell>{sq.dueDate}</TableCell>
                                    <TableCell>{getStatusBadge(sq.status, sq.criticalRisk)}</TableCell>
                                    <TableCell className="text-right">
                                        {sq.score ? (
                                            <span className={`font-bold ${sq.score >= 80 ? 'text-green-600' : 'text-destructive'}`}>{sq.score}/100</span>
                                        ) : (
                                            <span className="text-muted-foreground italic">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm"><History className="w-4 h-4 mr-1" /> View Let</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && (!assessments || assessments.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No assessments found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
