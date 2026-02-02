
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import ModuleLayout from "@/components/layouts/ModuleLayout";
import { FinanceSidebar } from "@/components/nav/FinanceSidebar";

export default function EliminationRules() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<any>(null);
    const queryClient = useQueryClient();

    // Fetch Rules
    const { data: rules = [], isLoading } = useQuery({
        queryKey: ["elimination-rules"],
        queryFn: async () => {
            const res = await fetch("/api/gl/elimination-rules");
            if (!res.ok) throw new Error("Failed to fetch rules");
            return res.json();
        }
    });

    // Create/Update Mutation
    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const url = selectedRule
                ? `/api/gl/elimination-rules/${selectedRule.id}`
                : "/api/gl/elimination-rules";
            const method = selectedRule ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to save rule");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["elimination-rules"] });
            setIsDialogOpen(false);
            setSelectedRule(null);
            toast({ title: "Success", description: "Rule saved successfully" });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to save rule", variant: "destructive" });
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/gl/elimination-rules/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete rule");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["elimination-rules"] });
            toast({ title: "Success", description: "Rule deleted" });
        }
    });

    const handleEdit = (rule: any) => {
        setSelectedRule(rule);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedRule(null);
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            name: formData.get("name"),
            description: formData.get("description"),
            ledgerSetId: formData.get("ledgerSetId"),
            eliminationLedgerId: formData.get("eliminationLedgerId"),
            matchRule: formData.get("matchRule"),
            thresholdAmount: formData.get("thresholdAmount"),
            enabled: formData.get("enabled") === "on",
        };
        mutation.mutate(data);
    };

    const filteredRules = rules.filter((r: any) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ModuleLayout sidebar={<FinanceSidebar />}>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Elimination Rules</h1>
                        <p className="text-muted-foreground">Define logic for intercompany eliminations.</p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> New Rule
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Rules List</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search rules..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rule Name</TableHead>
                                    <TableHead>Ledger Set</TableHead>
                                    <TableHead>Match Rule</TableHead>
                                    <TableHead>Threshold</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRules.map((rule: any) => (
                                    <TableRow key={rule.id}>
                                        <TableCell className="font-medium">{rule.name}</TableCell>
                                        <TableCell>{rule.ledgerSetId}</TableCell>
                                        <TableCell>{rule.matchRule}</TableCell>
                                        <TableCell>${rule.thresholdAmount}</TableCell>
                                        <TableCell>
                                            <Badge variant={rule.enabled ? "default" : "secondary"}>
                                                {rule.enabled ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(rule.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{selectedRule ? "Edit Rule" : "Create Rule"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Rule Name</Label>
                                <Input id="name" name="name" required defaultValue={selectedRule?.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" name="description" defaultValue={selectedRule?.description} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ledgerSetId">Ledger Set ID</Label>
                                    <Input id="ledgerSetId" name="ledgerSetId" required defaultValue={selectedRule?.ledgerSetId || "GLOBAL_GRP"} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="eliminationLedgerId">Elimination Ledger</Label>
                                    <Input id="eliminationLedgerId" name="eliminationLedgerId" required defaultValue={selectedRule?.eliminationLedgerId || "ELIM_LEDGER"} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="matchRule">Match Rule</Label>
                                    <Select name="matchRule" defaultValue={selectedRule?.matchRule || "Standard"}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Standard">Standard (1:1)</SelectItem>
                                            <SelectItem value="Custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="thresholdAmount">Threshold ($)</Label>
                                    <Input id="thresholdAmount" name="thresholdAmount" type="number" step="0.01" defaultValue={selectedRule?.thresholdAmount || "0.00"} />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="enabled" name="enabled" defaultChecked={selectedRule?.enabled ?? true} />
                                <Label htmlFor="enabled">Active</Label>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save Rule</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </ModuleLayout>
    );
}
