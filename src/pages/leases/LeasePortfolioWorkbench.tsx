import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LeaseDetailView } from "./LeaseDetailView";
import { LeaseExtractionWizard } from "@/components/lease/LeaseExtractionWizard";
import {
    EnterpriseContextSwitcher,
    buildScopeHeaders
} from "@/components/enterprise/EnterpriseContextSwitcher";
import { StandardPage } from '@/components/layout/StandardPage';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function LeasePortfolioWorkbench() {
    const [search, setSearch] = useState("");
    const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);
    const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
    const [activeBuId, setActiveBuId] = useState<string | undefined>(undefined);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const limit = 10;

    const scopeHeaders = buildScopeHeaders({ "business-unit": activeBuId });

    const { data: fetchResult, isLoading } = useQuery<any>({
        queryKey: ["leases", search, page, activeBuId],
        queryFn: async () => {
            const res = await fetch(
                `/api/lease/leases?search=${search}&page=${page}&limit=${limit}`,
                { headers: { "Content-Type": "application/json", ...scopeHeaders } }
            );
            if (!res.ok) throw new Error("Failed to fetch leases");
            return res.json();
        },
        placeholderData: (previousData) => previousData
    });

    const leases = fetchResult?.data || [];
    const pagination = fetchResult?.pagination || { totalPages: 1, page: 1, total: 0 };

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/lease/leases", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...scopeHeaders },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create lease");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leases"] });
            toast({ title: "Lease Created", description: "New lease added to portfolio" });
        }
    });

    return (
        <StandardPage
            title="Lease Portfolio"
            description="Manage IFRS 16 / ASC 842 Lease Contracts"
            actions={
                <div className="flex gap-2 items-center">
                    <EnterpriseContextSwitcher
                        type="business-unit"
                        value={activeBuId}
                        onChange={setActiveBuId}
                    />
                    <Button onClick={() => {
                        createMutation.mutate({
                            leaseNumber: `L-${Date.now()}`,
                            description: "New Office Lease",
                            vendorId: "V-MOCK-123",
                            commencementDate: new Date().toISOString(),
                            expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 5).toISOString(),
                            discountRate: 0.05,
                            termMonths: 60
                        });
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> New Lease
                    </Button>

                    <Dialog open={isAiWizardOpen} onOpenChange={setIsAiWizardOpen}>
                        <DialogTrigger asChild>
                            <Button variant="secondary" className="bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/15 border border-indigo-200">
                                <FileText className="mr-2 h-4 w-4" /> AI Abstract Lease
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <LeaseExtractionWizard onClose={() => setIsAiWizardOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            }
        >
            <div className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Total Liability</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">$1.2M</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Active Leases</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{leases?.length || 0}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Avg. Interest Rate</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">4.2%</div></CardContent>
                    </Card>
                </div>

                <div className="flex items-center space-x-2 bg-card p-4 rounded-lg border">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by Lease Number or Vendor..."
                        className="border-0 focus-visible:ring-0"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Lease Number</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24"><TableSkeleton rows={4} /></TableCell></TableRow>
                            ) : leases?.map((lease: any) => (
                                <TableRow key={lease.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        {lease.leaseNumber}
                                    </TableCell>
                                    <TableCell>{lease.description}</TableCell>
                                    <TableCell>{formatDate(lease.commencementDate)}</TableCell>
                                    <TableCell>
                                        <StatusBadge status="active" label={lease.status} />
                                    </TableCell>
                                    <TableCell>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedLeaseId(lease.id)}>
                                                    View Details
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
                                                {selectedLeaseId === lease.id && (
                                                    <LeaseDetailView leaseId={lease.id} />
                                                )}
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>


                <Pagination className="mt-4">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                        <PaginationItem>
                            <span className="text-sm font-medium mx-4">Page {page} of {pagination.totalPages}</span>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setPage(p => p + 1)}
                                className={page === pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </StandardPage>
    );
}
