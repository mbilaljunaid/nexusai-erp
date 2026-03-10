import { formatDate } from "@/lib/dateUtils";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatNumber } from '@/lib/formatters';

interface JournalGridProps {
    data: any[];
    onRowClick: (journal: any) => void;
    loading?: boolean;
}

export function JournalGrid({ data, onRowClick, loading }: JournalGridProps) {
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-muted-foreground">Loading journals...</div>;
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-36 cursor-pointer" onClick={() => handleSort("journalNumber")}>
                            Journal # <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>Category</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("effectiveDate")}>Effective Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right cursor-pointer" onClick={() => handleSort("totalDebit")}>Amount</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((journal) => (
                            <Button variant="ghost" className="h-auto p-0 w-full justify-start font-normal text-left overflow-hidden border-none shadow-none bg-transparent active:scale-[0.98] hover:bg-transparent transition-all" asChild onClick={() => onRowClick(journal)}>
                            <TableRow
                                                            key={journal.id}
                                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                        >
                                                            <TableCell className="font-medium">{journal.journalNumber}</TableCell>
                                                            <TableCell>{journal.category}</TableCell>
                                                            <TableCell>
                                                                {formatDate(journal.effectiveDate)}
                                                            </TableCell>
                                                            <TableCell className="max-w-72 truncate">{journal.description}</TableCell>
                                                            <TableCell className="text-right font-mono">
                                                                {formatNumber(Number(journal.totalDebit), 2)} {journal.currencyCode}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant={
                                                                    journal.status === "Posted" ? "default" :
                                                                        journal.status === "Unposted" ? "secondary" : "outline"
                                                                }>
                                                                    {journal.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                                            <span className="sr-only">Open menu</span>
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                        <DropdownMenuItem onClick={() => onRowClick(journal)}>View Details</DropdownMenuItem>
                                                                        <DropdownMenuItem>Reverse</DropdownMenuItem>
                                                                        <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                            </Button>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
