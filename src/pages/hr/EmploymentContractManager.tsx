import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { AlertCircle, Plus, FileSignature, RefreshCcw, CalendarClock, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, isPast, isWithinInterval, addDays } from "date-fns";

const CONTRACTS = [
    { id: "CON-001", workerName: "Jane Doe", personNumber: "EMP-10042", contractType: "PERMANENT", startDate: "2022-03-15", endDate: null, jurisdiction: "US Federal", legalEntity: "NexusAI Corp (US)", renewalDays: null, status: "ACTIVE", eSignUrl: "#" },
    { id: "CON-002", workerName: "Alice Wang", personNumber: "EMP-10091", contractType: "FIXED_TERM", startDate: "2025-07-01", endDate: "2026-06-30", jurisdiction: "UK Employment Law", legalEntity: "NexusAI Ltd (UK)", renewalDays: 30, status: "EXPIRING", eSignUrl: "#" },
    { id: "CON-003", workerName: "Ravi Patel", personNumber: "CON-20014", contractType: "AGENCY", startDate: "2025-11-01", endDate: "2026-02-28", jurisdiction: "UAE Labour Law", legalEntity: "NexusAI LLC (UAE)", renewalDays: null, status: "EXPIRED", eSignUrl: "#" },
    { id: "CON-004", workerName: "Sarah Connor", personNumber: "EMP-10055", contractType: "ZERO_HOURS", startDate: "2024-01-10", endDate: null, jurisdiction: "US Federal", legalEntity: "NexusAI Corp (US)", renewalDays: null, status: "ACTIVE", eSignUrl: "#" },
];

const CONTRACT_TYPE_LABELS: Record<string, string> = {
    PERMANENT: "Permanent",
    FIXED_TERM: "Fixed Term",
    ZERO_HOURS: "Zero-Hours",
    AGENCY: "Agency",
};

const getStatusColor = (status: string) => {
    if (status === "ACTIVE") return "border-emerald-500 text-emerald-700 bg-emerald-50";
    if (status === "EXPIRING") return "border-amber-500 text-amber-700 bg-amber-50";
    if (status === "EXPIRED") return "border-red-500 text-red-700 bg-red-50";
    return "";
};

export default function EmploymentContractManager() {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState("ALL");

    const filtered = CONTRACTS.filter(c => filter === "ALL" || c.status === filter);

    const expiringCount = CONTRACTS.filter(c => c.status === "EXPIRING").length;
    const expiredCount = CONTRACTS.filter(c => c.status === "EXPIRED").length;

    const handleCreate = () => {
        toast({ title: "Contract Created", description: "Employment contract has been saved and e-signature request sent." });
        setIsOpen(false);
    };

    return (
        <StandardPage title="Employment Contract Manager" description="Manage worker contracts by type, jurisdiction, and expiration. Track renewal obligations and initiate e-signatures.">
            {/* KPI Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Total Contracts</p>
                        <p className="text-2xl font-bold">{CONTRACTS.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-emerald-200 bg-emerald-50/30">
                    <CardContent className="p-4">
                        <p className="text-xs text-emerald-600 mb-1">Active</p>
                        <p className="text-2xl font-bold text-emerald-700">{CONTRACTS.filter(c => c.status === "ACTIVE").length}</p>
                    </CardContent>
                </Card>
                <Card className="border-amber-200 bg-amber-50/30">
                    <CardContent className="p-4">
                        <p className="text-xs text-amber-600 mb-1">Expiring (30 days)</p>
                        <p className="text-2xl font-bold text-amber-700">{expiringCount}</p>
                    </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50/30">
                    <CardContent className="p-4">
                        <p className="text-xs text-red-600 mb-1">Expired</p>
                        <p className="text-2xl font-bold text-red-700">{expiredCount}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Contract Register</CardTitle>
                        <CardDescription>All employment contracts linked to workers across all legal entities.</CardDescription>
                    </div>
                    <div className="flex gap-3">
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="EXPIRING">Expiring</SelectItem>
                                <SelectItem value="EXPIRED">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button className="gap-2" onClick={() => setIsOpen(true)}><Plus className="h-4 w-4" /> New Contract</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Worker</TableHead>
                                <TableHead>Contract Type</TableHead>
                                <TableHead>Legal Entity / Jurisdiction</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map(c => (
                                <TableRow key={c.id}>
                                    <TableCell>
                                        <p className="font-medium">{c.workerName}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{c.personNumber}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{CONTRACT_TYPE_LABELS[c.contractType]}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm">{c.legalEntity}</p>
                                        <p className="text-xs text-muted-foreground">{c.jurisdiction}</p>
                                    </TableCell>
                                    <TableCell className="text-sm">{c.startDate}</TableCell>
                                    <TableCell className="text-sm">
                                        {c.endDate ? (
                                            <span className={c.status === "EXPIRING" ? "text-amber-600 font-medium" : c.status === "EXPIRED" ? "text-red-600 font-medium" : ""}>{c.endDate}</span>
                                        ) : <span className="text-muted-foreground">Indefinite</span>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getStatusColor(c.status)}>{c.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="sm" className="gap-1 text-xs"><Download className="h-3 w-3" /> PDF</Button>
                                            {(c.status === "EXPIRING" || c.status === "EXPIRED") && (
                                                <Button variant="ghost" size="sm" className="gap-1 text-xs text-amber-600"><RefreshCcw className="h-3 w-3" /> Renew</Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Contract Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>New Employment Contract</DialogTitle>
                        <DialogDescription>Define terms, jurisdiction, and expiry. An e-signature request will be sent to the worker.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Worker *</Label>
                            <Input placeholder="Search by name or person number..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Contract Type *</Label>
                                <Select><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERMANENT">Permanent</SelectItem>
                                        <SelectItem value="FIXED_TERM">Fixed Term</SelectItem>
                                        <SelectItem value="ZERO_HOURS">Zero-Hours</SelectItem>
                                        <SelectItem value="AGENCY">Agency</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Jurisdiction</Label>
                                <Select><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="US">US Federal</SelectItem>
                                        <SelectItem value="UK">UK Employment Law</SelectItem>
                                        <SelectItem value="UAE">UAE Labour Law</SelectItem>
                                        <SelectItem value="EU">EU Directive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Contract Start Date *</Label>
                                <Input type="date" />
                            </div>
                            <div className="space-y-2">
                                <Label>Contract End Date</Label>
                                <Input type="date" />
                            </div>
                            <div className="space-y-2">
                                <Label>Renewal Alert (days before expiry)</Label>
                                <Input type="number" placeholder="e.g., 30" />
                            </div>
                            <div className="space-y-2">
                                <Label>Legal Entity</Label>
                                <Select><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="us">NexusAI Corp (US)</SelectItem>
                                        <SelectItem value="uk">NexusAI Ltd (UK)</SelectItem>
                                        <SelectItem value="ae">NexusAI LLC (UAE)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Contract Document</Label>
                            <div className="border border-dashed border-border rounded-lg p-4 text-center text-sm text-muted-foreground">
                                <FileSignature className="h-6 w-6 mx-auto mb-2 opacity-40" />
                                Drop PDF or click to upload — e-signature request will be auto-sent
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate}>Create & Send for Signature</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
