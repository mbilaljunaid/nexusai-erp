import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Building2, ShieldCheck, CreditCard } from "lucide-react";

function EntityForm({ onSubmit, ledgers, isLoading }: { onSubmit: (data: any) => void, ledgers: any[], isLoading: boolean }) {
    const [formData, setFormData] = useState({
        name: "",
        taxId: "",
        ledgerId: "",
        countryCode: "US", // Default
        addressLine1: "",
        city: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Entity Name</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Nexus Corp - USA"
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="taxId">Tax / VAT ID</Label>
                    <Input
                        id="taxId"
                        value={formData.taxId}
                        onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                        placeholder="XX-XXXXXXX"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="country">Jurisdiction</Label>
                    <Input
                        id="country"
                        value={formData.countryCode}
                        onChange={e => setFormData({ ...formData, countryCode: e.target.value })}
                        maxLength={2}
                        placeholder="US"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Registered Address</Label>
                <Input
                    id="address"
                    value={formData.addressLine1}
                    onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                    placeholder="123 Corporate Blvd"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="ledger">Primary Ledger</Label>
                <Select
                    value={formData.ledgerId}
                    onValueChange={(val) => setFormData({ ...formData, ledgerId: val })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Ledger" />
                    </SelectTrigger>
                    <SelectContent>
                        {ledgers.map(l => (
                            <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">The primary ledger dictates the chart of accounts and currency.</p>
            </div>
            <DialogFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Register Entity
                </Button>
            </DialogFooter>
        </form>
    );
}

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
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Legal Entities</h1>
                    <p className="text-muted-foreground italic">Enterprise Structure: Organizational Units & Tax Registrations</p>
                </div>
                <Dialog open={isCreating} onOpenChange={setIsCreating}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-[#0f172a]">
                            <Plus className="h-4 w-4" /> Register Entity
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Register New Legal Entity</DialogTitle>
                            <CardDescription>Define a legal organization unit and map it to a primary ledger.</CardDescription>
                        </DialogHeader>
                        <EntityForm
                            onSubmit={(data) => createEntityMutation.mutate(data)}
                            ledgers={ledgers || []}
                            isLoading={createEntityMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>
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
