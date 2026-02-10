import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Settings2, Trash2, Edit } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// Types
interface RevenueRule {
    id: string;
    name: string;
    description: string;
    type: "Daily" | "Fixed Schedule" | "Variable";
    period: "Monthly" | "Quarterly" | "Annual";
    duration: number; // in months
    status: "Active" | "Inactive";
}

export function ArRevenueRules() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<RevenueRule | null>(null);

    // Mock Data
    const [rules, setRules] = useState<RevenueRule[]>([
        { id: "1", name: "Immediate Recognition", description: "Recognize 100% on invoice date", type: "Fixed Schedule", period: "Monthly", duration: 1, status: "Active" },
        { id: "2", name: "Ratable - 12 Months", description: "Evenly split over 12 months", type: "Daily", period: "Monthly", duration: 12, status: "Active" },
        { id: "3", name: "Quarterly Subscription", description: "Split over 3 months", type: "Fixed Schedule", period: "Quarterly", duration: 3, status: "Active" },
    ]);

    const [formState, setFormState] = useState<Partial<RevenueRule>>({
        name: "",
        description: "",
        type: "Daily",
        period: "Monthly",
        duration: 12,
        status: "Active"
    });

    const handleSave = () => {
        if (editingRule) {
            setRules(prev => prev.map(r => r.id === editingRule.id ? { ...r, ...formState } as RevenueRule : r));
            toast({ title: "Rule Updated", description: "Revenue rule updated successfully." });
        } else {
            const newRule: RevenueRule = {
                id: crypto.randomUUID(),
                ...formState as RevenueRule
            };
            setRules(prev => [...prev, newRule]);
            toast({ title: "Rule Created", description: "New revenue rule created successfully." });
        }
        setIsDialogOpen(false);
        setEditingRule(null);
        setFormState({ name: "", description: "", type: "Daily", period: "Monthly", duration: 12, status: "Active" });
    };

    const handleDelete = (id: string) => {
        setRules(prev => prev.filter(r => r.id !== id));
        toast({ title: "Rule Deleted", description: "Revenue rule has been removed." });
    };

    const openEdit = (rule: RevenueRule) => {
        setEditingRule(rule);
        setFormState(rule);
        setIsDialogOpen(true);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Revenue Recognition Rules</CardTitle>
                    <CardDescription>Configure rules for automated revenue scheduling.</CardDescription>
                </div>
                <Button onClick={() => { setEditingRule(null); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> New Rule
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Rule Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rules.map((rule) => (
                            <TableRow key={rule.id}>
                                <TableCell>
                                    <div className="font-medium">{rule.name}</div>
                                    <div className="text-xs text-muted-foreground">{rule.description}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{rule.type}</Badge>
                                </TableCell>
                                <TableCell>{rule.duration} Months</TableCell>
                                <TableCell>
                                    <Badge className={rule.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}>
                                        {rule.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(rule)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(rule.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingRule ? "Edit Rule" : "Create Revenue Rule"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Rule Name</Label>
                            <Input
                                value={formState.name}
                                onChange={e => setFormState(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formState.description}
                                onChange={e => setFormState(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={formState.type}
                                    onValueChange={(val: any) => setFormState(prev => ({ ...prev, type: val }))}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Daily">Daily Proration</SelectItem>
                                        <SelectItem value="Fixed Schedule">Fixed Schedule</SelectItem>
                                        <SelectItem value="Variable">Variable</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Duration (Months)</Label>
                                <Input
                                    type="number"
                                    value={formState.duration}
                                    onChange={e => setFormState(prev => ({ ...prev, duration: Number(e.target.value) }))}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Rule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
