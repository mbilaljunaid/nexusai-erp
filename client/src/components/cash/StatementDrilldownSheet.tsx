
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Search, Filter, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface DrilldownProps {
    accountId: string | null;
    accountName: string;
    isOpen: boolean;
    onClose: () => void;
}

export function StatementDrilldownSheet({ accountId, accountName, isOpen, onClose }: DrilldownProps) {
    const [search, setSearch] = useState("");

    const { data: lines, isLoading } = useQuery<any[]>({
        queryKey: [`/api/cash/accounts/${accountId}/statement-lines`],
        enabled: !!accountId
    });

    const filteredLines = lines?.filter(l =>
        l.description?.toLowerCase().includes(search.toLowerCase()) ||
        l.referenceNumber?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-xl md:max-w-2xl overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-2xl font-bold">{accountName}</SheetTitle>
                    <SheetDescription>
                        Transaction history and statement details for this account.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex gap-2 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by description or reference..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-12 w-full bg-muted animate-pulse rounded" />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLines.map((line) => (
                                    <TableRow key={line.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="text-xs font-medium">
                                            {format(new Date(line.transactionDate), "MMM dd, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium line-clamp-1">{line.description}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">{line.referenceNumber}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className={`text-right font-semibold ${Number(line.amount) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            <div className="flex items-center justify-end gap-1">
                                                {Number(line.amount) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                                                {formatCurrency(Math.abs(Number(line.amount)))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={line.reconciled ? "default" : "secondary"} className="text-[10px] px-1.5 h-5">
                                                {line.reconciled ? "Reconciled" : "Pending"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredLines.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

import { Button } from "@/components/ui/button";
