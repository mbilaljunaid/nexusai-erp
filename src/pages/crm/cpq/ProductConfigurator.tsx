import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Plus, X, Server, AlertTriangle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProductConfigurator() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newRule, setNewRule] = useState<any>({
        name: "",
        baseProductId: "",
        targetProductId: "",
        ruleType: "REQUIRE",
        conditionField: "",
        conditionValue: "",
    });

    const { data: rules = [], isLoading } = useQuery({
        queryKey: ["/api/crm/cpq/rules"],
        queryFn: () => fetch("/api/crm/cpq/rules").then(r => r.json())
    });

    const { data: products = [] } = useQuery({
        queryKey: ["/api/crm/products"],
        queryFn: () => fetch("/api/crm/products").then(r => r.json())
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/crm/cpq/rules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/cpq/rules"] });
            setIsAddOpen(false);
            toast({ title: "Rule created successfully" });
            setNewRule({ name: "", baseProductId: "", targetProductId: "", ruleType: "REQUIRE", conditionField: "", conditionValue: "" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/crm/cpq/rules/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/cpq/rules"] });
            toast({ title: "Rule deleted" });
        }
    });

    const columns: SpreadsheetColumn[] = [
        { key: "name", title: "Rule Name", type: "text", width: 250 },
        {
            key: "baseProduct",
            title: "Base Product",
            type: "text",
            width: 250,
            render: (val, row) => products.find((p: any) => p.id === row.baseProductId)?.name || row.baseProductId
        },
        {
            key: "ruleType",
            title: "Type",
            type: "badge",
            width: 120,
            render: (val) => {
                if (val === 'REQUIRE') return <Badge variant="default" className="bg-blue-600">Require</Badge>;
                if (val === 'EXCLUDE') return <Badge variant="destructive">Exclude</Badge>;
                if (val === 'RECOMMEND') return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Recommend</Badge>;
                return <Badge>{val}</Badge>;
            }
        },
        {
            key: "targetProduct",
            title: "Target Product",
            type: "text",
            width: 250,
            render: (val, row) => products.find((p: any) => p.id === row.targetProductId)?.name || row.targetProductId
        },
        { key: "conditionField", title: "Condition Field", type: "text", width: 150 },
        { key: "conditionValue", title: "Value", type: "text", width: 150 },
        {
            key: "actions",
            title: "Actions",
            type: "button",
            width: 100,
            render: (_, row) => (
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(row.id)}>
                    <X className="w-4 h-4 text-red-500" />
                </Button>
            )
        }
    ];

    return (
        <StandardPage
            title="Product Configurator Rules"
            description="Define inclusion and exclusion rules for CPQ guided selling"
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "CPQ Rules" }
            ]}
            actions={
                <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Rule
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-700"><ShieldCheck className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                            <h3 className="text-2xl font-bold">{rules.length}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6  flex items-center gap-4">
                        <div className="bg-red-100 p-3 rounded-full text-red-700"><AlertTriangle className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Exclusions</p>
                            <h3 className="text-2xl font-bold">{rules.filter((r: any) => r.ruleType === 'EXCLUDE').length}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-full text-purple-700"><Server className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Recommendations</p>
                            <h3 className="text-2xl font-bold">{rules.filter((r: any) => r.ruleType === 'RECOMMEND').length}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <InteractiveSpreadsheet
                data={rules}
                columns={columns}
                isLoading={isLoading || deleteMutation.isPending}
            />

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Configurator Rule</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div>
                            <Label>Rule Name</Label>
                            <Input
                                value={newRule.name}
                                onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                                placeholder="e.g. PowerEdge demands PDU"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Base Product (If they select...)</Label>
                                <Select value={newRule.baseProductId} onValueChange={v => setNewRule({ ...newRule, baseProductId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                                    <SelectContent>
                                        {products.map((p: any) => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Rule Type</Label>
                                <Select value={newRule.ruleType} onValueChange={v => setNewRule({ ...newRule, ruleType: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="REQUIRE">Require</SelectItem>
                                        <SelectItem value="EXCLUDE">Exclude</SelectItem>
                                        <SelectItem value="RECOMMEND">Recommend</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>Target Product (Then...)</Label>
                            <Select value={newRule.targetProductId} onValueChange={v => setNewRule({ ...newRule, targetProductId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Target Product" /></SelectTrigger>
                                <SelectContent>
                                    {products.map((p: any) => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Condition Field (Optional)</Label>
                                <Input
                                    value={newRule.conditionField}
                                    onChange={e => setNewRule({ ...newRule, conditionField: e.target.value })}
                                    placeholder="e.g. ServerVoltage"
                                />
                            </div>
                            <div>
                                <Label>Condition Value</Label>
                                <Input
                                    value={newRule.conditionValue}
                                    onChange={e => setNewRule({ ...newRule, conditionValue: e.target.value })}
                                    placeholder="e.g. 110V"
                                />
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate(newRule)} disabled={createMutation.isPending || !newRule.baseProductId || !newRule.targetProductId || !newRule.name}>
                            Save Rule
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
