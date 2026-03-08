import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";
import { Plus, Send, Download, FileText, Users2, Building2, Mail, Pencil, Eye } from "lucide-react";

// Oracle AR: Statement of Account — configuration and generation

interface StatementRun {
    id: string; ref: string; customer: string; statementDate: string; dueAmounts: number; currency: string; status: "Generated" | "Sent" | "Pending"; method: "Email" | "Print" | "Both";
}

const MOCK_RUNS: StatementRun[] = [
    { id: "1", ref: "STMT-2026-00031", customer: "Acme Corporation", statementDate: "2026-02-28", dueAmounts: 142500, currency: "USD", status: "Sent", method: "Email" },
    { id: "2", ref: "STMT-2026-00030", customer: "Global Tech Ltd", statementDate: "2026-02-28", dueAmounts: 67830, currency: "GBP", status: "Sent", method: "Both" },
    { id: "3", ref: "STMT-2026-00029", customer: "MidEast Trading", statementDate: "2026-02-28", dueAmounts: 0, currency: "AED", status: "Generated", method: "Print" },
];

export function ArStatementPrint() {
    const { toast } = useToast();
    const [tab, setTab] = useState("generate");
    const [history, setHistory] = useState<StatementRun[]>(MOCK_RUNS);
    const [asOf, setAsOf] = useState(new Date().toISOString().split("T")[0]);
    const [statCurrency, setStatCurrency] = useState("USD");
    const [deliveryMethod, setDeliveryMethod] = useState("Email");
    const [minBalance, setMinBalance] = useState("0");
    const [includeCredit, setIncludeCredit] = useState(false);
    const [scope, setScope] = useState("All Active Customers");
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);
        await new Promise(r => setTimeout(r, 1500));
        const newRun: StatementRun = {
            id: Date.now().toString(),
            ref: `STMT-${new Date().getFullYear()}-${String(history.length + 32).padStart(5, "0")}`,
            customer: scope === "All Active Customers" ? "All Customers" : scope,
            statementDate: asOf,
            dueAmounts: Math.random() * 200000 + 50000,
            currency: statCurrency,
            status: "Generated",
            method: deliveryMethod as "Email" | "Print" | "Both",
        };
        setHistory(prev => [newRun, ...prev]);
        setGenerating(false);
        toast({ title: `Statements generated — ${newRun.ref}`, description: `Delivery method: ${deliveryMethod}`, className: "bg-green-900 border-green-700 text-white" });
        setTab("history");
    };

    return (
        <StandardPage
            title="Statement of Account"
            description="Generate and deliver customer account statements"
        >
            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="generate">Generate Statements</TabsTrigger>
                    <TabsTrigger value="history">History ({history.length})</TabsTrigger>
                    <TabsTrigger value="setup">Statement Setup</TabsTrigger>
                </TabsList>

                <TabsContent value="generate">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <Card className="lg:col-span-2">
                            <CardHeader className="pb-3"><CardTitle className="text-base">Statement Parameters</CardTitle></CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="asof" className="text-xs">Statement Date (As Of)</Label>
                                        <Input id="asof" type="date" className="mt-1 h-8 text-xs" value={asOf} onChange={e => setAsOf(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Currency</Label>
                                        <Select value={statCurrency} onValueChange={setStatCurrency}>
                                            <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {["USD", "GBP", "EUR", "AED", "SAR"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Customer Scope</Label>
                                        <Select value={scope} onValueChange={setScope}>
                                            <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All Active Customers">All Active Customers</SelectItem>
                                                <SelectItem value="Overdue Only">Overdue Customers Only</SelectItem>
                                                <SelectItem value="Specific Customer">Specific Customer</SelectItem>
                                                <SelectItem value="By Profile Class">By Profile Class</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="minbal" className="text-xs">Minimum Balance ({statCurrency})</Label>
                                        <Input id="minbal" type="number" className="mt-1 h-8 text-xs" value={minBalance} onChange={e => setMinBalance(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Delivery Method</Label>
                                        <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                                            <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Email">Email</SelectItem>
                                                <SelectItem value="Print">Print</SelectItem>
                                                <SelectItem value="Both">Email + Print</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2 pt-5">
                                        <Switch id="credit" checked={includeCredit} onCheckedChange={setIncludeCredit} aria-label="Include credit memos" />
                                        <Label htmlFor="credit" className="text-xs cursor-pointer">Include Credit Memos</Label>
                                    </div>
                                </div>
                                <Button className="mt-4" onClick={handleGenerate} disabled={generating}>
                                    {generating ? <span className="animate-spin mr-2">⏳</span> : <Send className="h-4 w-4 mr-2" />}
                                    {generating ? "Generating..." : "Generate & Send Statements"}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="text-sm">Statement Content</CardTitle></CardHeader>
                            <CardContent className="text-xs space-y-3">
                                {[
                                    "Invoice detail (number, date, due date, amount)",
                                    "Receipts applied in period",
                                    "Credit memos (if enabled)",
                                    "Aging buckets (Current/30/60/90+)",
                                    "Dispute and promise-to-pay notes",
                                    "Collection contact information",
                                    "Payment instructions + bank details",
                                ].map(item => (
                                    <div key={item} className="flex items-start gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                        <p className="text-muted-foreground">{item}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/20 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="p-3 text-left">Reference</th>
                                        <th className="p-3 text-left">Customer</th>
                                        <th className="p-3 text-left">Statement Date</th>
                                        <th className="p-3 text-right">Balance Due</th>
                                        <th className="p-3 text-left">Method</th>
                                        <th className="p-3 text-left">Status</th>
                                        <th className="p-3 w-20"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {history.map(r => (
                                        <tr key={r.id} className="hover:bg-muted/10">
                                            <td className="p-3 font-mono text-xs text-primary">{r.ref}</td>
                                            <td className="p-3">{r.customer}</td>
                                            <td className="p-3 text-xs">{r.statementDate}</td>
                                            <td className="p-3 text-right font-medium">{formatNumber(r.dueAmounts)} {r.currency}</td>
                                            <td className="p-3 text-xs">
                                                <Badge>{r.method}</Badge>
                                            </td>
                                            <td className="p-3">
                                                <Badge className={r.status === "Sent" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}>{r.status}</Badge>
                                            </td>
                                            <td className="p-3 flex gap-1">
                                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Eye className="h-3 w-3" /></Button>
                                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Download className="h-3 w-3" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="setup">
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="grid grid-cols-2 gap-4 max-w-xl">
                                {[
                                    { label: "Statement Message (Header)", placeholder: "Thank you for your business..." },
                                    { label: "Statement Message (Footer)", placeholder: "Please contact us at ar@company.com" },
                                    { label: "From Email Address", placeholder: "ar@company.com" },
                                    { label: "Reply-To Email", placeholder: "ar@company.com" },
                                ].map(f => (
                                    <div key={f.label}>
                                        <Label className="text-xs">{f.label}</Label>
                                        <Input className="mt-1 h-8 text-xs" placeholder={f.placeholder} />
                                    </div>
                                ))}
                                <div className="col-span-2">
                                    <Button size="sm">Save Configuration</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}

export default ArStatementPrint;
