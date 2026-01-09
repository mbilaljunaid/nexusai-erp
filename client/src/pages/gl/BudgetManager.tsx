
import React, { useState, useEffect } from "react";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Plus, ShieldAlert, BadgeDollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types
interface Budget {
    id: string;
    name: string;
    description: string;
    ledgerId: string;
    status: string;
    createdAt: string;
}

interface ControlRule {
    id: string;
    ruleName: string;
    ledgerId: string;
    controlLevel: "Absolute" | "Advisory" | "Track";
    enabled: boolean;
}

export default function BudgetManager() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("budgets");
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [rules, setRules] = useState<ControlRule[]>([]);
    const [loading, setLoading] = useState(false);

    // Create Budget Form State
    const [newBudgetOpen, setNewBudgetOpen] = useState(false);
    const [newBudgetName, setNewBudgetName] = useState("");
    const [newBudgetDesc, setNewBudgetDesc] = useState("");

    // Create Rule Form State
    const [newRuleOpen, setNewRuleOpen] = useState(false);
    const [newRuleName, setNewRuleName] = useState("");
    const [newRuleLevel, setNewRuleLevel] = useState("Absolute");

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "budgets") {
                const res = await fetch("/api/gl/budgets?ledgerId=primary-ledger-001");
                if (res.ok) setBudgets(await res.json());
            } else {
                const res = await fetch("/api/gl/budget-control-rules?ledgerId=primary-ledger-001");
                if (res.ok) setRules(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handeCreateBudget = async () => {
        try {
            const res = await fetch("/api/gl/budgets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newBudgetName,
                    description: newBudgetDesc,
                    ledgerId: "primary-ledger-001",
                    status: "Open"
                })
            });

            if (!res.ok) throw new Error("Failed to create budget");

            toast({ title: "Success", description: "Budget created successfully" });
            setNewBudgetOpen(false);
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to create budget", variant: "destructive" });
        }
    };

    const handleCreateRule = async () => {
        try {
            const res = await fetch("/api/gl/budget-control-rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ruleName: newRuleName,
                    ledgerId: "primary-ledger-001",
                    controlLevel: newRuleLevel,
                    enabled: true,
                    controlFilters: {} // Default to global for MVP
                })
            });

            if (!res.ok) throw new Error("Failed to create rule");

            toast({ title: "Success", description: "Control Rule created successfully" });
            setNewRuleOpen(false);
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to create rule", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6 pt-6 pb-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Budget Manager</h1>
                <p className="text-muted-foreground">Manage fiscal budgets and spending control policies.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="budgets" className="flex items-center gap-2">
                        <BadgeDollarSign className="w-4 h-4" /> Budgets
                    </TabsTrigger>
                    <TabsTrigger value="rules" className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> Control Rules
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="budgets" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Budget Definitions</h2>
                        <Dialog open={newBudgetOpen} onOpenChange={setNewBudgetOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="w-4 h-4 mr-2" /> Create Budget</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Budget</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Budget Name</Label>
                                        <Input value={newBudgetName} onChange={(e) => setNewBudgetName(e.target.value)} placeholder="e.g. FY2026 Corporate" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Input value={newBudgetDesc} onChange={(e) => setNewBudgetDesc(e.target.value)} placeholder="Main operating budget" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handeCreateBudget}>Create</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Budget Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Ledger</TableHead>
                                        <TableHead>Created At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ) : budgets.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                No budgets found. Create one to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        budgets.map((budget) => (
                                            <TableRow key={budget.id}>
                                                <TableCell className="font-medium">{budget.name}</TableCell>
                                                <TableCell>{budget.status}</TableCell>
                                                <TableCell>{budget.ledgerId}</TableCell>
                                                <TableCell>{new Date(budget.createdAt).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rules" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Budgetary Control Rules</h2>
                        <Dialog open={newRuleOpen} onOpenChange={setNewRuleOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="w-4 h-4 mr-2" /> Create Rule</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Control Rule</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Rule Name</Label>
                                        <Input value={newRuleName} onChange={(e) => setNewRuleName(e.target.value)} placeholder="e.g. Strict Travel Policy" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Control Level</Label>
                                        <Select value={newRuleLevel} onValueChange={setNewRuleLevel}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Absolute">Absolute (Block)</SelectItem>
                                                <SelectItem value="Advisory">Advisory (Warn)</SelectItem>
                                                <SelectItem value="Track">Track Only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreateRule}>Create Rule</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardDescription className="p-4 bg-muted/50 rounded-t-lg">
                            Defined rules control how transactions are validated against budget funds. High priority rules override generic ones.
                        </CardDescription>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Rule Name</TableHead>
                                        <TableHead>Control Level</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ) : rules.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                                No control rules defined.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        rules.map((rule) => (
                                            <TableRow key={rule.id}>
                                                <TableCell className="font-medium">{rule.ruleName}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${rule.controlLevel === "Absolute" ? "bg-red-100 text-red-800" :
                                                            rule.controlLevel === "Advisory" ? "bg-amber-100 text-amber-800" :
                                                                "bg-blue-100 text-blue-800"
                                                        }`}>
                                                        {rule.controlLevel}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{rule.enabled ? "Active" : "Disabled"}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
