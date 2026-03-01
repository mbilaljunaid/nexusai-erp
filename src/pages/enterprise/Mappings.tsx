import React, { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowRightLeft, BookOpen, Building, Building2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function EnterpriseMappings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Mapping state
    const [selectedLegalGroup, setSelectedLegalGroup] = useState<string>("");
    const [selectedBuForLg, setSelectedBuForLg] = useState<string>("");

    const [selectedBuForLedger, setSelectedBuForLedger] = useState<string>("");
    const [selectedLedger, setSelectedLedger] = useState<string>("");

    // Data Fetching
    const { data: legalGroups } = useQuery({
        queryKey: ["/api/enterprise/legal-groups"],
        queryFn: () => fetch("/api/enterprise/legal-groups").then(r => r.json())
    });

    const { data: businessUnits } = useQuery({
        queryKey: ["/api/enterprise/business-units"],
        queryFn: () => fetch("/api/enterprise/business-units").then(r => r.json())
    });

    const { data: ledgers } = useQuery({
        queryKey: ["/api/finance/gl/ledgers"],
        queryFn: () => fetch("/api/finance/gl/ledgers").then(r => r.json())
    });

    const { data: lgBuMappings } = useQuery({
        queryKey: ["/api/enterprise/mappings/legal-group-bu"],
        queryFn: () => fetch("/api/enterprise/mappings/legal-group-bu").then(r => r.json())
    });

    const { data: buLedgerMappings } = useQuery({
        queryKey: ["/api/enterprise/mappings/bu-ledger"],
        queryFn: () => fetch("/api/enterprise/mappings/bu-ledger").then(r => r.json())
    });

    // Mutations
    const lgBuMutation = useMutation({
        mutationFn: async (data: { legalGroupId: string; businessUnitId: string }) => {
            const res = await apiRequest("POST", "/api/enterprise/mappings/legal-group-bu", data);
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/enterprise/mappings/legal-group-bu"] });
            setSelectedLegalGroup("");
            setSelectedBuForLg("");
            toast({ title: "Success", description: "Mapping created successfully." });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });

    const buLedgerMutation = useMutation({
        mutationFn: async (data: { businessUnitId: string; ledgerId: string }) => {
            const res = await apiRequest("POST", "/api/enterprise/mappings/bu-ledger", data);
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/enterprise/mappings/bu-ledger"] });
            setSelectedBuForLedger("");
            setSelectedLedger("");
            toast({ title: "Success", description: "Mapping created successfully." });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });

    // Helper functions for display
    const getLgName = (id: string) => legalGroups?.find((g: any) => g.id === id)?.name || id;
    const getBuName = (id: string) => businessUnits?.find((b: any) => b.id === id)?.name || id;
    const getLedgerName = (id: string) => ledgers?.find((l: any) => l.id === id)?.name || id;

    return (
        <StandardPage
            title="Enterprise Mappings"
            description="Establish hierarchical relationships across Legal Entities, Business Units, and Ledgers."
            breadcrumbs={[
                { label: "Company Setup", href: "/company-setup" },
                { label: "Mappings" }
            ]}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Legal Group to BU Mapping */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-500" />
                            Legal Group to Business Unit
                        </CardTitle>
                        <CardDescription>Assign operational business units to statutory legal entities.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-end gap-3 p-4 border rounded-lg bg-slate-50">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium">Legal Group</label>
                                <Select value={selectedLegalGroup} onValueChange={setSelectedLegalGroup}>
                                    <SelectTrigger><SelectValue placeholder="Select Legal Group" /></SelectTrigger>
                                    <SelectContent>
                                        {legalGroups?.map((g: any) => (
                                            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <ArrowRightLeft className="h-5 w-5 mb-2 text-muted-foreground shrink-0" />
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium">Business Unit</label>
                                <Select value={selectedBuForLg} onValueChange={setSelectedBuForLg}>
                                    <SelectTrigger><SelectValue placeholder="Select Business Unit" /></SelectTrigger>
                                    <SelectContent>
                                        {businessUnits?.map((b: any) => (
                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={() => lgBuMutation.mutate({ legalGroupId: selectedLegalGroup, businessUnitId: selectedBuForLg })}
                                disabled={!selectedLegalGroup || !selectedBuForLg || lgBuMutation.isPending}
                            >
                                Map
                            </Button>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Legal Group</TableHead>
                                        <TableHead>Business Unit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lgBuMappings?.length === 0 ? (
                                        <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No mappings defined</TableCell></TableRow>
                                    ) : (
                                        lgBuMappings?.map((m: any) => (
                                            <TableRow key={m.id}>
                                                <TableCell className="font-medium">{getLgName(m.legalGroupId)}</TableCell>
                                                <TableCell>{getBuName(m.businessUnitId)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* BU to Ledger Mapping */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-green-500" />
                            Business Unit to Ledger
                        </CardTitle>
                        <CardDescription>Assign financial tracking ledgers to operational business units.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-end gap-3 p-4 border rounded-lg bg-slate-50">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium">Business Unit</label>
                                <Select value={selectedBuForLedger} onValueChange={setSelectedBuForLedger}>
                                    <SelectTrigger><SelectValue placeholder="Select Business Unit" /></SelectTrigger>
                                    <SelectContent>
                                        {businessUnits?.map((b: any) => (
                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <ArrowRightLeft className="h-5 w-5 mb-2 text-muted-foreground shrink-0" />
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium">GL Ledger</label>
                                <Select value={selectedLedger} onValueChange={setSelectedLedger}>
                                    <SelectTrigger><SelectValue placeholder="Select GL Ledger" /></SelectTrigger>
                                    <SelectContent>
                                        {ledgers?.map((l: any) => (
                                            <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={() => buLedgerMutation.mutate({ businessUnitId: selectedBuForLedger, ledgerId: selectedLedger })}
                                disabled={!selectedBuForLedger || !selectedLedger || buLedgerMutation.isPending}
                            >
                                Map
                            </Button>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Business Unit</TableHead>
                                        <TableHead>Ledger</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {buLedgerMappings?.length === 0 ? (
                                        <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No mappings defined</TableCell></TableRow>
                                    ) : (
                                        buLedgerMappings?.map((m: any) => (
                                            <TableRow key={m.id}>
                                                <TableCell className="font-medium">{getBuName(m.businessUnitId)}</TableCell>
                                                <TableCell className="flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4 text-purple-500" />
                                                    {getLedgerName(m.ledgerId)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </StandardPage>
    );
}
