
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

// Mock roles derived from shared definition or fetched
const AVAILABLE_ROLES = [
    { value: "admin", label: "Global Admin" },
    { value: "gl_manager", label: "GL Manager" },
    { value: "gl_user", label: "GL User" },
    { value: "gl_viewer", label: "GL Viewer" },
    { value: "PAYROLL_INITIATE", label: "Payroll Initiator" },
    { value: "PAYROLL_APPROVE", label: "Payroll Approver" },
    { value: "AUDIT_VIEWER", label: "Audit Viewer" }
];

export default function SoDMatrix() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form State
    const [roleA, setRoleA] = useState("");
    const [roleB, setRoleB] = useState("");
    const [riskLevel, setRiskLevel] = useState("CRITICAL");
    const [description, setDescription] = useState("");

    const { data: rules, isLoading } = useQuery({
        queryKey: ["sod-rules"],
        queryFn: async () => {
            const res = await fetch("/api/hr/compliance/sod/rules");
            if (!res.ok) throw new Error("Failed to fetch rules");
            return res.json();
        }
    });

    const createRule = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/hr/compliance/sod/rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roleCodeA: roleA, roleCodeB: roleB, riskLevel, description })
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sod-rules"] });
            toast({ title: "Rule Created", description: "The SoD rule has been activated." });
            setIsCreateOpen(false);
            setRoleA(""); setRoleB(""); setDescription("");
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const deleteRule = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/hr/compliance/sod/rules/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sod-rules"] });
            toast({ title: "Rule Deleted" });
        }
    });

    if (isLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Segregation of Duties (SoD) Matrix</h2>
                    <p className="text-muted-foreground">Define toxic role combinations that create conflict of interest risks.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Conflict Rule</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Define Toxic Role Pair</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role A</label>
                                    <Select value={roleA} onValueChange={setRoleA}>
                                        <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                                        <SelectContent>
                                            {AVAILABLE_ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role B</label>
                                    <Select value={roleB} onValueChange={setRoleB}>
                                        <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                                        <SelectContent>
                                            {AVAILABLE_ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Risk Level</label>
                                <Select value={riskLevel} onValueChange={setRiskLevel}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CRITICAL">Critical (Blocks Assignment)</SelectItem>
                                        <SelectItem value="HIGH">High (Warning)</SelectItem>
                                        <SelectItem value="MEDIUM">Medium (Internal Audit)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    className="w-full p-2 border rounded-md bg-transparent"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Why is this combination dangerous?"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={() => createRule.mutate()} disabled={!roleA || !roleB || createRule.isPending}>
                                {createRule.isPending ? "Creating..." : "Create Rule"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rules?.map((rule: any) => (
                    <Card key={rule.id} className="border-l-4 border-l-red-500 shadow-sm relative group">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className={
                                    rule.riskLevel === 'CRITICAL' ? 'text-red-600 border-red-200 bg-red-50' :
                                        'text-amber-600 border-amber-200 bg-amber-50'
                                }>
                                    {rule.riskLevel} RISK
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-600"
                                    onClick={() => deleteRule.mutate(rule.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardTitle className="text-base mt-2 flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-red-500" />
                                Conflict Rule
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                    <span className="font-medium">{AVAILABLE_ROLES.find(r => r.value === rule.roleCodeA)?.label || rule.roleCodeA}</span>
                                </div>
                                <div className="text-center text-xs text-muted-foreground font-mono">+</div>
                                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                    <span className="font-medium">{AVAILABLE_ROLES.find(r => r.value === rule.roleCodeB)?.label || rule.roleCodeB}</span>
                                </div>
                                <p className="mt-2 text-muted-foreground text-xs italic">
                                    "{rule.description}"
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
