import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Building2, ShieldCheck, CreditCard } from "lucide-react";

export default function LegalEntitySetup() {
    const { toast } = useToast();
    const [isCreating, setIsCreating] = useState(false);

    const { data: entities, isLoading: isLoadingEntities } = useQuery<any[]>({
        queryKey: ["/api/finance/gl/legal-entities"],
    });

    const { data: ledgers, isLoading: isLoadingLedgers } = useQuery<any[]>({
        queryKey: ["/api/finance/gl/ledgers"],
    });

    const createEntityMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/finance/gl/legal-entities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create legal entity");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/finance/gl/legal-entities"] });
            setIsCreating(false);
            toast({ title: "Legal Entity Created", description: "Successfully registered and mapped to ledger." });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    if (isLoadingEntities || isLoadingLedgers) {
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
                    <h1 className="text-3xl font-bold tracking-tight">Legal Entities</h1>
                    <p className="text-muted-foreground italic">Enterprise Structure: Organizational Units & Tax Registrations</p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Register Entity
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mapped Entities</CardTitle>
                        <Building2 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{entities?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-blue-500">Actively assigned to ledgers</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tax Compliance</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{entities?.filter(e => e.taxId).length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-green-500">Verified VAT/Tax IDs</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Legal Entities</CardTitle>
                    <CardDescription>Management of corporate entities and their financial ledger associations</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Entity Name</TableHead>
                                <TableHead>Tax/VAT ID</TableHead>
                                <TableHead>Associated Ledger</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Created At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entities?.map((entity) => (
                                <TableRow key={entity.id}>
                                    <TableCell className="font-semibold">{entity.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-3 w-3 text-muted-foreground" />
                                            <span className="font-mono text-xs">{entity.taxId || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-medium text-primary border-primary/20 bg-primary/5">
                                            {ledgers?.find(l => l.id === entity.ledgerId)?.name || entity.ledgerId}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={entity.isActive ? "default" : "secondary"} className={entity.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}>
                                            {entity.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground text-sm">
                                        {new Date(entity.createdAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {entities?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                                        No legal entities registered yet. Click 'Register Entity' to start.
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
