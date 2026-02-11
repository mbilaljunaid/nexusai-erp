import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, User, FileEdit, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Amendment {
    id: string;
    modificationType: string;
    effectiveDate: string;
    changeReason: string;
    previousTerms: any;
    newTerms: any;
    modifiedBy: string;
    amendmentDate: string;
}

export function LeaseAuditTrail({ leaseId }: { leaseId: string }) {
    // Fetch amendments
    const { data: amendments = [], isLoading } = useQuery<Amendment[]>({
        queryKey: [`/api/lease/leases/${leaseId}/amendments`],
        queryFn: async () => {
            const res = await fetch(`/api/lease/leases/${leaseId}/amendments`);
            if (!res.ok) {
                if (res.status === 404) return []; // No amendments yet
                throw new Error("Failed to fetch amendments");
            }
            return res.json();
        }
    });

    const handleExportAuditLog = () => {
        if (!amendments || amendments.length === 0) {
            toast({ title: "No Data", description: "No audit trail to export", variant: "destructive" });
            return;
        }

        const headers = ["Date", "Type", "Reason", "Modified By", "Effective Date"];
        const rows = amendments.map((amendment) => [
            format(new Date(amendment.amendmentDate), 'yyyy-MM-dd HH:mm'),
            amendment.modificationType,
            amendment.changeReason,
            amendment.modifiedBy,
            format(new Date(amendment.effectiveDate), 'yyyy-MM-dd')
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Lease_Audit_Trail_${leaseId}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast({ title: "Export Successful", description: `${amendments.length} amendments exported` });
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading audit trail...</div>;
    }

    if (amendments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Audit Trail</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <FileEdit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No modifications recorded for this lease</p>
                        <p className="text-sm mt-1">Amendments and remeasurements will appear here</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Audit Trail</CardTitle>
                <Button variant="outline" size="sm" onClick={handleExportAuditLog}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Audit Log
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Timeline */}
                    <div className="relative border-l-2 border-muted pl-6 space-y-6">
                        {amendments.map((amendment, index) => (
                            <div key={amendment.id} className="relative">
                                {/* Timeline dot */}
                                <div className="absolute -left-[29px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background" />

                                {/* Amendment card */}
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant={
                                                        amendment.modificationType === 'REMEASUREMENT' ? 'default' :
                                                            amendment.modificationType === 'TERMINATION' ? 'destructive' :
                                                                'secondary'
                                                    }>
                                                        {amendment.modificationType}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        #{index + 1}
                                                    </span>
                                                </div>
                                                <p className="font-medium">{amendment.changeReason}</p>
                                            </div>
                                            <div className="text-right text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(amendment.amendmentDate), 'MMM d, yyyy HH:mm')}
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <User className="h-3 w-3" />
                                                    {amendment.modifiedBy}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Before/After comparison */}
                                        <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-2">BEFORE</p>
                                                <div className="space-y-1 text-sm">
                                                    {amendment.previousTerms && Object.entries(amendment.previousTerms).map(([key, value]) => (
                                                        <div key={key} className="flex justify-between">
                                                            <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                                            <span className="font-medium">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-2">AFTER</p>
                                                <div className="space-y-1 text-sm">
                                                    {amendment.newTerms && Object.entries(amendment.newTerms).map(([key, value]) => (
                                                        <div key={key} className="flex justify-between">
                                                            <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                                            <span className="font-medium text-primary">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 text-xs text-muted-foreground">
                                            Effective Date: {format(new Date(amendment.effectiveDate), 'MMMM d, yyyy')}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {/* Summary table */}
                    <div className="mt-8">
                        <h4 className="font-medium mb-3">Amendment Summary</h4>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Modified By</TableHead>
                                    <TableHead>Effective Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {amendments.map((amendment) => (
                                    <TableRow key={amendment.id}>
                                        <TableCell>{format(new Date(amendment.amendmentDate), 'MMM d, yyyy')}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{amendment.modificationType}</Badge>
                                        </TableCell>
                                        <TableCell>{amendment.changeReason}</TableCell>
                                        <TableCell>{amendment.modifiedBy}</TableCell>
                                        <TableCell>{format(new Date(amendment.effectiveDate), 'MMM d, yyyy')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
