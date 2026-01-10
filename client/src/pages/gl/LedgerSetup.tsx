import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Settings, Shield, Globe, Landmark } from "lucide-react";

export default function LedgerSetup() {
    const { toast } = useToast();
    const [isCreating, setIsCreating] = useState(false);

    const { data: ledgers, isLoading } = useQuery<any[]>({
        queryKey: ["/api/finance/gl/ledgers"],
    });

    const createLedgerMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/finance/gl/ledgers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create ledger");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/finance/gl/ledgers"] });
            setIsCreating(false);
            toast({ title: "Ledger Created", description: "The new ledger has been successfully initialized." });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ledger Architecture</h1>
                    <p className="text-muted-foreground italic">Oracle Foundation: Supported Ledger Types (Primary, Secondary, Reporting)</p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> New Ledger
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Primary Ledgers</CardTitle>
                        <Landmark className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ledgers?.filter(l => l.ledgerType === 'PRIMARY').length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-indigo-500">Main books of record</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-teal-500/10 to-transparent border-teal-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Secondary Ledgers</CardTitle>
                        <Shield className="h-4 w-4 text-teal-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ledgers?.filter(l => l.ledgerType === 'SECONDARY').length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-teal-500">Alternate accounting reps</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reporting Ledgers</CardTitle>
                        <Globe className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ledgers?.filter(l => l.ledgerType === 'REPORTING').length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-amber-500">Currency translation books</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Ledgers</CardTitle>
                    <CardDescription>Comprehensive list of defined ledgers and their configurations</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ledger Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Currency</TableHead>
                                <TableHead>Chart of Accounts</TableHead>
                                <TableHead>Calendar</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ledgers?.map((ledger) => (
                                <TableRow key={ledger.id}>
                                    <TableCell className="font-medium text-primary">{ledger.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={ledger.ledgerType === 'PRIMARY' ? 'default' : 'outline'}>
                                            {ledger.ledgerType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{ledger.currency}</TableCell>
                                    <TableCell>{ledger.coaName || 'Corporate COA'}</TableCell>
                                    <TableCell>{ledger.calendarName || 'Standard'}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                                            Active
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm"><Settings className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div >
    );
}
