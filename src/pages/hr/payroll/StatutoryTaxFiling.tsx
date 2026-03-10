import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { useNexusAI } from "@/contexts/NexusAIContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Play, FileCheck } from "lucide-react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export default function StatutoryTaxFiling() {
    const tenantId = "default-tenant";
    const [year, setYear] = useState("2026");

    const { data: filings, isLoading } = useQuery<any>({
        queryKey: ["hcm-statutory-tax", tenantId, year],
        queryFn: async () => {
            // Mock statutory tax filing data
            return [
                { id: "TX-101", formType: "Form 941 (Q1)", jurisdiction: "US Federal", status: "FILED", dateFiled: "2026-04-15", employees: 420 },
                { id: "TX-102", formType: "Form W-2 Data", jurisdiction: "US Federal", status: "PENDING_AUDIT", dateFiled: "-", employees: 420 },
                { id: "TX-103", formType: "State Unemployment (SUI)", jurisdiction: "California", status: "GENERATED", dateFiled: "-", employees: 185 },
            ];
        }
    });

    return (
        <StandardPage title="Statutory Tax & Reporting">
            <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Generate, audit, and file statutory payroll compliance formats (W-2, W-3, 941, State SUI).</p>
                <div className="flex gap-3">
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button className="gap-2"><Play className="h-4 w-4" /> Generate New Filing</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Filings</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">Require review before submission</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed ({year})</CardTitle>
                        <FileCheck className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground">Successfully filed and archived</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tax Filing Records</CardTitle>
                    <CardDescription>Generated extracts and electronic filing records for {year}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Form Type</TableHead>
                                <TableHead>Jurisdiction</TableHead>
                                <TableHead>Employees</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date Filed</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={7}><TableSkeleton rows={3} /></TableCell></TableRow>
                            ) : filings?.map((f: any) => (
                                <TableRow key={f.id}>
                                    <TableCell className="font-medium text-xs">{f.id}</TableCell>
                                    <TableCell className="font-bold">{f.formType}</TableCell>
                                    <TableCell>{f.jurisdiction}</TableCell>
                                    <TableCell>{f.employees}</TableCell>
                                    <TableCell>
                                        <Badge variant={f.status === 'FILED' ? 'default' : f.status === 'PENDING_AUDIT' ? 'destructive' : 'secondary'}>
                                            {f.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{f.dateFiled}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="gap-2"><Download className="h-3 w-3" /> Extract PDF</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filings?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No statutory filings generated for this year.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </StandardPage>
    );
}
