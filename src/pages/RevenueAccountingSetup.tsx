import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Settings,
    Save,
    BookOpen,
    Tags,
    Network,
    Plus,
    Trash2,
    Info,
    CheckCircle2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

export default function RevenueAccountingSetup() {
    const { toast } = useToast();
    const [ledgerId, setLedgerId] = useState("PRIMARY");
    const [activeTab, setActiveTab] = useState("accounts");

    // 1. Accounting Configs (GL Accounts)
    const { data: configs, isLoading: isLoadingConfig } = useQuery({
        queryKey: ["revenueAccountingConfig"],
        queryFn: async () => {
            const res = await fetch("/api/revenue/config/accounting");
            if (!res.ok) throw new Error("Failed to fetch config");
            return res.json();
        }
    });

    // 2. POB Rules
    const { data: pobRules = [], isLoading: isLoadingPob } = useQuery({
        queryKey: ["revenuePobRules"],
        queryFn: async () => {
            const res = await fetch("/api/revenue/config/pob-rules");
            if (!res.ok) return [];
            return res.json();
        }
    });

    // 3. Identification Rules
    const { data: idRules = [], isLoading: isLoadingId } = useQuery({
        queryKey: ["revenueIdRules"],
        queryFn: async () => {
            const res = await fetch("/api/revenue/config/id-rules");
            if (!res.ok) return [];
            return res.json();
        }
    });

    const activeConfig = configs?.find((c: any) => c.ledgerId === ledgerId) || {
        revenueAccountCCID: "",
        deferredRevenueAccountCCID: "",
        contractAssetAccountCCID: "",
        clearingAccountCCID: ""
    };

    const saveAccountMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/revenue/config/accounting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ledgerId, ...data })
            });
            if (!res.ok) throw new Error("Failed to save");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Rules Updated", description: "GL account mappings saved successfully." });
            queryClient.invalidateQueries({ queryKey: ["revenueAccountingConfig"] });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const savePobRuleMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/revenue/config/pob-rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Rule Created", description: "New Performance Obligation rule added." });
            queryClient.invalidateQueries({ queryKey: ["revenuePobRules"] });
        }
    });

    const saveIdRuleMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/revenue/config/id-rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Rule Created", description: "Contract Identification rule updated." });
            queryClient.invalidateQueries({ queryKey: ["revenueIdRules"] });
        }
    });

    const handleAccountSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        saveAccountMutation.mutate({
            revenueAccountCCID: formData.get("revAcc"),
            deferredRevenueAccountCCID: formData.get("defAcc"),
            contractAssetAccountCCID: formData.get("assetAcc"),
            clearingAccountCCID: formData.get("clearAcc")
        });
    };

    if (isLoadingConfig || isLoadingPob || isLoadingId) {
        return <div className="p-8 space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 w-full" /></div>;
    }

    return (
        <StandardPage
            title="Revenue Policy Center"
            description="Configure ASC 606 identification, allocation, and recognition rules."
            actions={
                <div className="bg-white p-1 rounded-lg border shadow-sm flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 px-2 uppercase">Ledger context</span>
                    <Select value={ledgerId} onValueChange={setLedgerId}>
                        <SelectTrigger className="w-[200px] border-none shadow-none focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PRIMARY">Americas Ledger (USD)</SelectItem>
                            <SelectItem value="EMEA">Europe Ledger (EUR)</SelectItem>
                            <SelectItem value="APAC">Vision Corp (JPY)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            }
        >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white border p-1 shadow-sm h-12">
                    <TabsTrigger value="accounts" className="gap-2 h-10 px-6">
                        <BookOpen className="h-4 w-4" /> GL Mapping
                    </TabsTrigger>
                    <TabsTrigger value="pob" className="gap-2 h-10 px-6">
                        <Tags className="h-4 w-4" /> Performance Obligation Rules
                    </TabsTrigger>
                    <TabsTrigger value="id" className="gap-2 h-10 px-6">
                        <Network className="h-4 w-4" /> Identification Rules
                    </TabsTrigger>
                </TabsList>

                {/* 1. GL MAPPINGS TAB */}
                <TabsContent value="accounts" className="space-y-6">
                    <Card className="max-w-3xl border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-white border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Settings className="h-5 w-5 text-slate-400" />
                                Subledger Settings (SLA)
                            </CardTitle>
                            <CardDescription>
                                Map revenue recognition events to your General Ledger account combinations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <form onSubmit={handleAccountSubmit} className="space-y-8">
                                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="revAcc" className="text-slate-600">Revenue Account (Credit)</Label>
                                        <Input id="revAcc" name="revAcc" defaultValue={activeConfig.revenueAccountCCID} placeholder="e.g. 4000-00-000" className="border-slate-200 focus:ring-indigo-500" required />
                                        <p className="text-[10px] text-slate-400 italic">Used for realized revenue recognized in period.</p>
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="defAcc" className="text-slate-600">Deferred Revenue (Liability)</Label>
                                        <Input id="defAcc" name="defAcc" defaultValue={activeConfig.deferredRevenueAccountCCID} placeholder="e.g. 2100-00-000" className="border-slate-200 focus:ring-indigo-500" required />
                                        <p className="text-[10px] text-slate-400 italic">Holds unearned revenue balances.</p>
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="assetAcc" className="text-slate-600">Contract Asset (Unbilled)</Label>
                                        <Input id="assetAcc" name="assetAcc" defaultValue={activeConfig.contractAssetAccountCCID} placeholder="e.g. 1200-00-000" className="border-slate-200 focus:ring-indigo-500" />
                                        <p className="text-[10px] text-slate-400 italic">Balances recognized but not yet invoiced.</p>
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="clearAcc" className="text-slate-600">Clearing Account</Label>
                                        <Input id="clearAcc" name="clearAcc" defaultValue={activeConfig.clearingAccountCCID} placeholder="e.g. 1900-00-000" className="border-slate-200 focus:ring-indigo-500" />
                                        <p className="text-[10px] text-slate-400 italic">Temporary account for inter-module reconciliation.</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t flex justify-end">
                                    <Button type="submit" disabled={saveAccountMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]">
                                        {saveAccountMutation.isPending ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Config</>}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="max-w-3xl border-indigo-100 bg-indigo-50/30">
                        <CardContent className="pt-6 flex gap-3 text-indigo-700 text-sm">
                            <Info className="h-5 w-5 shrink-0" />
                            <p>These accounts will be used as the default for all revenue contracts in the <b>{ledgerId}</b> ledger unless overridden by specific identification rules.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 2. POB RULES TAB */}
                <TabsContent value="pob" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800">POB Satisfaction Rules</h2>
                            <p className="text-sm text-muted-foreground">Define how different products and services recognize revenue.</p>
                        </div>
                        <Button className="bg-slate-900 border-none">
                            <Plus className="h-4 w-4 mr-2" /> Add Rule
                        </Button>
                    </div>

                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardContent className="p-0 h-[400px]">
                            <InteractiveSpreadsheet
                                data={pobRules}
                                columns={[
                                    { id: "priority", header: "Priority", width: "100px", cell: (info: any) => <div className="px-2 h-full flex items-center justify-center w-full"><Badge variant="secondary">{info.priority}</Badge></div> },
                                    { id: "name", header: "Rule Name", width: "250px", cell: (info: any) => <div className="px-2 h-full flex items-center font-semibold text-slate-800">{info.name}</div> },
                                    {
                                        id: "attributeValue", header: "Condition", width: "300px", cell: (info: any) => (
                                            <div className="px-2 h-full flex items-center gap-1 text-xs">
                                                <span className="text-slate-400 font-mono italic">{info.attributeName}</span>
                                                <span className="px-1 bg-slate-100 border text-slate-600">EQUALS</span>
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded">"{info.attributeValue}"</span>
                                            </div>
                                        )
                                    },
                                    {
                                        id: "satisfactionMethod", header: "Satisfaction", width: "150px", cell: (info: any) => (
                                            <div className="px-2 h-full flex items-center justify-center w-full">
                                                <Badge className={info.satisfactionMethod === "Ratable" ? "bg-amber-100 text-amber-700 border-none" : "bg-emerald-100 text-emerald-700 border-none"}>
                                                    {info.satisfactionMethod}
                                                </Badge>
                                            </div>
                                        )
                                    },
                                    { id: "defaultDurationMonths", header: "Duration", width: "150px", cell: (info: any) => <div className="px-2 h-full flex items-center">{info.defaultDurationMonths ? `${info.defaultDurationMonths} Months` : "Point in Time"}</div> },
                                    { id: "status", header: "Status", width: "150px", cell: (info: any) => <div className="px-2 h-full flex items-center justify-center w-full"><Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">{info.status}</Badge></div> },
                                    {
                                        id: "actions", header: "Actions", width: "100px", cell: () => (
                                            <div className="px-2 h-full flex items-center justify-end w-full">
                                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )
                                    }
                                ]}
                                onChange={() => { }}
                                virtualized={true}
                                containerHeight="400px"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 3. IDENTIFICATION RULES TAB */}
                <TabsContent value="id" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800">Contract Identification Rules</h2>
                            <p className="text-sm text-muted-foreground">Configure logic for grouping multiple source events into single ASC 606 contracts.</p>
                        </div>
                        <Button className="bg-slate-900 border-none">
                            <Plus className="h-4 w-4 mr-2" /> New Criteria
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {idRules.map((rule: any) => (
                            <Card key={rule.id} className="border-none shadow-sm border-l-4 border-l-indigo-500">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div>
                                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                                        <CardDescription>{rule.description}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">Priority: {rule.priority}</Badge>
                                        <Badge className="bg-green-100 text-green-700 border-none">Active</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 bg-slate-50 rounded-lg flex flex-wrap gap-4 items-center">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Group orders by:</span>
                                        {rule.groupingCriteria.map((crit: string) => (
                                            <div key={crit} className="flex items-center gap-2 bg-white px-3 py-1.5 border rounded-md shadow-sm">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                <span className="text-sm font-medium text-slate-700">{crit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
