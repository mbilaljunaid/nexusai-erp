import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

const DEMO_CLASSES: any[] = [
    { id: "pc-1", name: "Platinum", creditLimit: 500000, creditCurrency: "USD", paymentTerms: "Net 45", statementCycle: "Monthly", autocashRule: "Oldest First", collector: "Sarah Johnson", autoHold: false, customerCount: 28, status: "Active" },
    { id: "pc-2", name: "Gold", creditLimit: 100000, creditCurrency: "USD", paymentTerms: "Net 30", statementCycle: "Monthly", autocashRule: "Oldest First", collector: "Mark Davis", autoHold: true, customerCount: 157, status: "Active" },
    { id: "pc-3", name: "Silver", creditLimit: 25000, creditCurrency: "USD", paymentTerms: "Net 15", statementCycle: "15th of Month", autocashRule: "Prorate", collector: "Emma Lee", autoHold: true, customerCount: 432, status: "Active" },
    { id: "pc-4", name: "New Account", creditLimit: 5000, creditCurrency: "USD", paymentTerms: "Net 7", statementCycle: "Weekly", autocashRule: "Oldest First", collector: "John Smith", autoHold: true, customerCount: 89, status: "Active" },
    { id: "pc-5", name: "Government", creditLimit: 1000000, creditCurrency: "USD", paymentTerms: "Net 60", statementCycle: "Quarterly", autocashRule: "Invoice Reference", collector: "Lisa Park", autoHold: false, customerCount: 14, status: "Active" },
];

export default function CustomerProfileClasses() {
    const { toast } = useToast();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<any | null>(null);
    const [form, setForm] = useState({
        name: "", creditLimit: "", creditCurrency: "USD", paymentTerms: "Net 30",
        statementCycle: "Monthly", autocashRule: "Oldest First", collector: "", autoHold: true
    });

    const columns = useMemo((): SpreadsheetColumn<any>[] => [
        { id: "name", header: "Profile Class", width: "180px", cell: (r) => <span className="font-semibold text-primary">{r.name}</span> },
        { id: "creditLimit", header: "Default Credit Limit", width: "180px", cell: (r) => <span className="font-mono">{r.creditCurrency} {formatNumber(r.creditLimit)}</span> },
        { id: "paymentTerms", header: "Payment Terms", width: "140px" },
        { id: "statementCycle", header: "Statement Cycle", width: "160px" },
        { id: "autocashRule", header: "AutoCash Rule", width: "160px", cell: (r) => <span className="text-sm text-muted-foreground">{r.autocashRule}</span> },
        { id: "collector", header: "Collector", width: "160px", cell: (r) => <span className="text-sm">{r.collector}</span> },
        { id: "autoHold", header: "Auto Hold", width: "100px", cell: (r) => <StatusBadge status={r.autoHold ? "Active" : "Inactive"} label={r.autoHold ? "Yes" : "No"} /> },
        { id: "customerCount", header: "Customers", width: "110px", cell: (r) => <Badge variant="secondary">{r.customerCount}</Badge> },
    ], []);

    const handleNew = () => {
        setEditingClass(null);
        setForm({ name: "", creditLimit: "", creditCurrency: "USD", paymentTerms: "Net 30", statementCycle: "Monthly", autocashRule: "Oldest First", collector: "", autoHold: true });
        setSheetOpen(true);
    };

    const handleRowClick = (row: any) => {
        setEditingClass(row);
        setForm({
            name: row.name, creditLimit: String(row.creditLimit), creditCurrency: row.creditCurrency,
            paymentTerms: row.paymentTerms, statementCycle: row.statementCycle, autocashRule: row.autocashRule,
            collector: row.collector, autoHold: row.autoHold
        });
        setSheetOpen(true);
    };

    const handleSave = () => {
        if (!form.name) {
            toast({ title: "Class name is required", variant: "destructive" });
            return;
        }
        toast({ title: editingClass ? `Profile Class "${form.name}" updated` : `Profile Class "${form.name}" created` });
        setSheetOpen(false);
    };

    return (
        <StandardPage
            title="Customer Profile Classes"
            description="Define template classes that cascade credit, payment, and collection settings to groups of customers."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Receivable", href: "/finance/ar" },
                { label: "Customer Profile Classes" },
            ]}
            actions={
                <Button onClick={handleNew}>
                    <Plus className="h-4 w-4 mr-2" /> New Class
                </Button>
            }
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Profile Classes</CardTitle>
                    <CardDescription>Click a row to view or edit the class definition. Customer assignments update automatically.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 h-[480px]">
                    <InteractiveSpreadsheet data={DEMO_CLASSES} columns={columns} onChange={() => { }} onRowClick={handleRowClick} containerHeight="480px" />
                </CardContent>
            </Card>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-[540px] flex flex-col">
                    <SheetHeader>
                        <SheetTitle>{editingClass ? `Edit: ${editingClass.name}` : "New Customer Profile Class"}</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto py-6 space-y-5">
                        <div className="space-y-2">
                            <Label>Class Name *</Label>
                            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Platinum, Gold, Government" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Default Credit Limit</Label>
                                <Input type="number" value={form.creditLimit} onChange={e => setForm({ ...form, creditLimit: e.target.value })} placeholder="e.g. 100000" className="font-mono" />
                            </div>
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <Select value={form.creditCurrency} onValueChange={v => setForm({ ...form, creditCurrency: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {["USD", "EUR", "GBP", "CAD", "AUD"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Terms</Label>
                            <Select value={form.paymentTerms} onValueChange={v => setForm({ ...form, paymentTerms: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["Net 7", "Net 15", "Net 30", "Net 45", "Net 60", "Net 90", "2/10 Net 30"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Statement Cycle</Label>
                            <Select value={form.statementCycle} onValueChange={v => setForm({ ...form, statementCycle: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["Weekly", "15th of Month", "Monthly", "Quarterly", "None"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>AutoCash Application Rule</Label>
                            <Select value={form.autocashRule} onValueChange={v => setForm({ ...form, autocashRule: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Oldest First">Apply to Oldest Invoice First</SelectItem>
                                    <SelectItem value="Prorate">Prorate Across Open Invoices</SelectItem>
                                    <SelectItem value="Invoice Reference">Match by Invoice Reference</SelectItem>
                                    <SelectItem value="Exact Amount">Exact Amount Match Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Default Collector</Label>
                            <Input value={form.collector} onChange={e => setForm({ ...form, collector: e.target.value })} placeholder="Collector name or ID" />
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                            <Switch checked={form.autoHold} onCheckedChange={v => setForm({ ...form, autoHold: v })} id="auto-hold" />
                            <div>
                                <Label htmlFor="auto-hold" className="cursor-pointer font-medium">Auto-Hold Orders on Credit Breach</Label>
                                <p className="text-xs text-muted-foreground">New sales orders are automatically placed on hold when the customer's outstanding balance exceeds their credit limit.</p>
                            </div>
                        </div>
                    </div>
                    <SheetFooter className="border-t pt-4">
                        <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Profile Class</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </StandardPage>
    );
}
