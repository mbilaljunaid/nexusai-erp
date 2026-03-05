import React from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { useLocation } from "wouter";

export default function EnterpriseLedgers() {
    const [, setLocation] = useLocation();

    // Read-only view for Enterprise Setup. Detailed config happens in Finance -> GL Config.
    const { data: ledgers, isLoading } = useQuery<any>({
        queryKey: ["/api/finance/gl/ledgers"],
        queryFn: () => fetch("/api/finance/gl/ledgers").then(r => r.json())
    });

    return (
        <StandardPage
            title="Entity Ledgers"
            description="View primary and secondary financial ledgers defined across the enterprise."
            breadcrumbs={[
                { label: "Company Setup", href: "/company-setup" },
                { label: "Ledgers" }
            ]}
        >
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ledger Name</TableHead>
                            <TableHead>Short Name</TableHead>
                            <TableHead>Currency</TableHead>
                            <TableHead>Chart of Accounts</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                        ) : ledgers?.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8">No Ledgers defined</TableCell></TableRow>
                        ) : (
                            ledgers?.map((l: any) => (
                                <TableRow key={l.id}>
                                    <TableCell className="font-medium flex items-center gap-2 cursor-pointer hover:underline text-blue-600"
                                        onClick={() => setLocation("/finance/gl/setup")}>
                                        <BookOpen className="h-4 w-4 text-purple-500" />
                                        {l.name}
                                    </TableCell>
                                    <TableCell>{l.shortName}</TableCell>
                                    <TableCell>{l.currency}</TableCell>
                                    <TableCell className="font-mono text-sm">{l.chartOfAccountsId || 'Default_COA'}</TableCell>
                                    <TableCell><Badge variant={l.status === 'Active' ? 'default' : 'secondary'}>{l.status}</Badge></TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </StandardPage>
    );
}
