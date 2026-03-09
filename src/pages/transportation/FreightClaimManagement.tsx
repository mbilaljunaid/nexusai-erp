import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertOctagon, Scale, Receipt, Truck, Search, Plus, Save, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatters";

export default function FreightClaimManagement() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isClaimOpen, setIsClaimOpen] = useState(false);

    const [claimData, setClaimData] = useState({
        shipmentRoute: "",
        carrier: "",
        issueType: "DAMAGED",
        claimAmount: "",
        description: "",
    });

    const { data: claims, isLoading } = useQuery({
        queryKey: ["/api/tms/freight-claims"],
        queryFn: async () => {
            // Stub backend data reflecting OS&D (Over, Short, and Damaged)
            return [
                { id: "CLM-2026-081", shipment: "SHP-100452", carrier: "FedEx Freight", type: "DAMAGED", amount: 4500.00, status: "SUBMITTED", filedDate: "2026-03-01", liability: "CARRIER" },
                { id: "CLM-2026-085", shipment: "SHP-100511", carrier: "Maersk Line", type: "SHORTAGE", amount: 12500.50, status: "IN_REVIEW", filedDate: "2026-03-05", liability: "PENDING_INVESTIGATION" },
                { id: "CLM-2026-088", shipment: "SHP-100609", carrier: "XPO Logistics", type: "LATE_DELIVERY", amount: 800.00, status: "APPROVED", filedDate: "2026-03-08", liability: "CARRIER" },
                { id: "CLM-2026-089", shipment: "SHP-100612", carrier: "JB Hunt", type: "OVERAGE", amount: 0.00, status: "RESOLVED", filedDate: "2026-03-08", liability: "SHIPPER_ERROR" },
            ];
        }
    });

    const generateClaimMutation = useMutation({
        mutationFn: async () => {
            // Simulate physical measurement DB commit
            return new Promise((resolve) => setTimeout(resolve, 800));
        },
        onSuccess: () => {
            setIsClaimOpen(false);
            setClaimData({ shipmentRoute: "", carrier: "", issueType: "DAMAGED", claimAmount: "", description: "" });
            toast({ title: "Claim Generated", description: "The OS&D incident has been filed securely against the Carrier's SLA profile." });
        }
    });

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "DAMAGED": return <Badge variant="destructive"><AlertOctagon className="w-3 h-3 mr-1" /> Damaged</Badge>;
            case "SHORTAGE": return <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">Shortage</Badge>;
            case "OVERAGE": return <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">Overage</Badge>;
            case "LATE_DELIVERY": return <Badge variant="secondary">Late SLA Violation</Badge>;
            default: return <Badge>{type}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === "APPROVED") return <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Approved for Payout</Badge>;
        if (status === "RESOLVED") return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Resolved</Badge>;
        if (status === "IN_REVIEW") return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Carrier Investigating</Badge>;
        return <Badge variant="outline">{status}</Badge>;
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Freight Claim & OS&D Management</h1>
                    <p className="text-muted-foreground mt-1">Track Carrier delivery incidents (Over, Short, Damaged) and manage financial dispute resolutions.</p>
                </div>

                <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-rose-600 hover:bg-rose-700"><AlertOctagon className="w-4 h-4 mr-2" /> Log Carrier Incident</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2"><Scale className="w-5 h-5 text-rose-600" /> New OS&D Freight Claim</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-4 col-span-2 border rounded-md p-4 bg-muted/20">
                                <Label>Link Source Shipment</Label>
                                <div className="flex gap-2">
                                    <Input placeholder="Enter Tracking / Shipment ID..." value={claimData.shipmentRoute} onChange={e => setClaimData({ ...claimData, shipmentRoute: e.target.value })} />
                                    <Button variant="secondary"><Search className="w-4 h-4" /></Button>
                                </div>
                            </div>

                            <div className="space-y-2 col-span-2 mt-2">
                                <Label>Carrier (Auto-populated from Shipment)</Label>
                                <Select value={claimData.carrier} onValueChange={v => setClaimData({ ...claimData, carrier: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select Carrier Profile" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FedEx Freight">FedEx Freight</SelectItem>
                                        <SelectItem value="XPO Logistics">XPO Logistics</SelectItem>
                                        <SelectItem value="Maersk Line">Maersk Line</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Incident Classification</Label>
                                <Select value={claimData.issueType} onValueChange={v => setClaimData({ ...claimData, issueType: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DAMAGED">Damaged in Transit</SelectItem>
                                        <SelectItem value="SHORTAGE">Shortage (Missing Items)</SelectItem>
                                        <SelectItem value="OVERAGE">Overage (Extra Items)</SelectItem>
                                        <SelectItem value="LATE_DELIVERY">SLA Miss (Late Delivery)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Financial Damages ($)</Label>
                                <Input type="number" placeholder="0.00" value={claimData.claimAmount} onChange={e => setClaimData({ ...claimData, claimAmount: e.target.value })} className="border-rose-200 focus-visible:ring-rose-500" />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label>Detailed Description & Evidence Notes</Label>
                                <Textarea placeholder="Describe the physical condition of the load, pictures taken, etc." value={claimData.description} onChange={e => setClaimData({ ...claimData, description: e.target.value })} />
                            </div>

                        </div>
                        <DialogFooter className="flex justify-between w-full">
                            <Button variant="outline" onClick={() => setIsClaimOpen(false)}>Cancel</Button>
                            <Button
                                disabled={!claimData.shipmentRoute || !claimData.carrier || generateClaimMutation.isPending}
                                onClick={() => generateClaimMutation.mutate()}
                                className="bg-rose-600 hover:bg-rose-700"
                            >
                                {generateClaimMutation.isPending ? <Search className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Submit Claim
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-rose-950/20 border-rose-500/20">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-rose-500">Total Capital in Dispute</div>
                                <div className="text-3xl font-bold">{formatCurrency(17800.50)}</div>
                            </div>
                            <Banknote className="w-8 h-8 text-rose-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Carrier Claims</CardTitle>
                    <CardDescription>Review the financial liability resolution pipeline for logistics disruptions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Claim Ref</TableHead>
                                <TableHead>Shipment ID</TableHead>
                                <TableHead>Carrier / 3PL</TableHead>
                                <TableHead>OS&D Type</TableHead>
                                <TableHead>Filing Date</TableHead>
                                <TableHead className="text-right">Claim Value</TableHead>
                                <TableHead>Current Liability</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {claims?.map((claim: any) => (
                                <TableRow key={claim.id}>
                                    <TableCell className="font-mono text-xs">{claim.id}</TableCell>
                                    <TableCell>
                                        <div className="font-medium flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                            <Truck className="w-3 h-3" /> {claim.shipment}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{claim.carrier}</TableCell>
                                    <TableCell>{getTypeBadge(claim.type)}</TableCell>
                                    <TableCell className="text-muted-foreground">{claim.filedDate}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        {claim.amount > 0 ? <span className="text-rose-600 dark:text-rose-400">{formatCurrency(claim.amount)}</span> : "-"}
                                    </TableCell>
                                    <TableCell className="text-xs">{claim.liability.replace(/_/g, " ")}</TableCell>
                                    <TableCell>
                                        {getStatusBadge(claim.status)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!isLoading && (!claims || claims.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground font-medium">
                                        No active freight claims or OS&D incidents.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
