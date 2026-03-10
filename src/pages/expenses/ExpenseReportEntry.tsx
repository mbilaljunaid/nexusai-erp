import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/formatters";
import {
    Plus, Trash2, Save, Send, Receipt, MapPin, Building2, Utensils, Car,
    Plane, Hotel, ShoppingBag, Smartphone, Clock, Upload, AlertTriangle
} from "lucide-react";

interface ExpenseLine {
    id: string;
    seq: number;
    expenseType: string;
    expenseDate: string;
    amount: string;
    currency: string;
    merchant: string;
    location: string;
    purpose: string;
    receiptAttached: boolean;
    personalExpense: boolean;
    billable: boolean;
    projectId: string;
    taskId: string;
    glAccount: string;
    // Hotel-specific
    checkInDate?: string;
    checkOutDate?: string;
    roomRate?: string;
    taxAmount?: string;
    // Mileage-specific
    fromLocation?: string;
    toLocation?: string;
    miles?: string;
    ratePerMile?: string;
    // Per diem-specific
    perDiemRate?: string;
    days?: string;
}

const EXPENSE_TYPES = [
    { value: "AIRFARE", label: "Airfare", icon: Plane, color: "bg-blue-500" },
    { value: "HOTEL", label: "Hotel / Lodging", icon: Hotel, color: "bg-purple-500" },
    { value: "MEALS", label: "Meals & Entertainment", icon: Utensils, color: "bg-orange-500" },
    { value: "MILEAGE", label: "Mileage (Personal Car)", icon: Car, color: "bg-green-500" },
    { value: "GROUND_TRANS", label: "Ground Transportation", icon: Car, color: "bg-teal-500" },
    { value: "PER_DIEM", label: "Per Diem", icon: MapPin, color: "bg-pink-500" },
    { value: "BUSINESS_MEALS", label: "Business Meals", icon: Utensils, color: "bg-amber-500" },
    { value: "PHONE", label: "Phone / Internet", icon: Smartphone, color: "bg-indigo-500" },
    { value: "OTHER", label: "Other / Miscellaneous", icon: ShoppingBag, color: "bg-gray-500" },
];

const POLICY_LIMITS: Record<string, number> = {
    MEALS: 75, HOTEL: 200, BUSINESS_MEALS: 150, GROUND_TRANS: 100, AIRFARE: 2000, PER_DIEM: 350,
};

const newLine = (seq: number): ExpenseLine => ({
    id: `line-${Date.now()}-${seq}`,
    seq,
    expenseType: "MEALS",
    expenseDate: new Date().toISOString().split("T")[0],
    amount: "",
    currency: "USD",
    merchant: "",
    location: "",
    purpose: "",
    receiptAttached: false,
    personalExpense: false,
    billable: false,
    projectId: "",
    taskId: "",
    glAccount: "",
});

export function ExpenseReportEntry() {
    const { toast } = useToast();
    const [purpose, setPurpose] = useState("");
    const [businessUnit, setBusinessUnit] = useState("US-OPS");
    const [department, setDepartment] = useState("Finance");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [advanceApplied, setAdvanceApplied] = useState("");
    const [lines, setLines] = useState<ExpenseLine[]>([newLine(1)]);
    const [submitting, setSubmitting] = useState(false);
    const [hotelFolioLine, setHotelFolioLine] = useState<ExpenseLine | null>(null);

    const totalAmount = lines.reduce((s, l) => {
        if (l.expenseType === "MILEAGE") {
            return s + (parseFloat(l.miles || "0") * parseFloat(l.ratePerMile || "0.655"));
        }
        if (l.expenseType === "PER_DIEM") {
            return s + (parseFloat(l.days || "0") * parseFloat(l.perDiemRate || "0"));
        }
        return s + parseFloat(l.amount || "0");
    }, 0);

    const violations = lines.filter(l => {
        const limit = POLICY_LIMITS[l.expenseType];
        return limit && parseFloat(l.amount || "0") > limit;
    });

    const addLine = () => setLines(prev => [...prev, newLine(prev.length + 1)]);
    const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id));
    const updateLine = (id: string, updates: Partial<ExpenseLine>) =>
        setLines(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));

    const getLineAmount = (l: ExpenseLine) => {
        if (l.expenseType === "MILEAGE") return parseFloat(l.miles || "0") * parseFloat(l.ratePerMile || "0.655");
        if (l.expenseType === "PER_DIEM") return parseFloat(l.days || "0") * parseFloat(l.perDiemRate || "0");
        return parseFloat(l.amount || "0");
    };

    const handleSubmit = async () => {
        if (!purpose.trim()) {
            toast({ title: "Purpose required", variant: "destructive" });
            return;
        }
        if (lines.some(l => !l.expenseDate || !l.expenseType)) {
            toast({ title: "All lines must have a date and type", variant: "destructive" });
            return;
        }
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 1200));
        const repRef = `ER-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
        toast({ title: `Expense Report ${repRef} submitted for approval`, className: "bg-green-900 border-green-700 text-white" });
        setSubmitting(false);
    };

    const handleSaveDraft = () => {
        toast({ title: "Draft saved", description: "Your expense report has been saved as a draft." });
    };

    return (
        <StandardPage
            title="New Expense Report"
            description="Enter and submit an expense report for reimbursement"
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSaveDraft}><Save className="h-4 w-4 mr-2" />Save Draft</Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                        Submit for Approval
                    </Button>
                </div>
            }
        >
            {violations.length > 0 && (
                <Card className="border-amber-500 bg-amber-500/10 mb-4">
                    <CardContent className="pt-4 pb-3">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-amber-400">Policy Violations Detected</p>
                                <p className="text-xs text-amber-300/80 mt-0.5">
                                    {violations.length} line(s) exceed policy limits and may require additional justification.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Report Header */}
            <Card className="mb-4">
                <CardHeader className="pb-3"><CardTitle className="text-base">Report Header</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="col-span-full md:col-span-2">
                            <Label htmlFor="purpose">Business Purpose *</Label>
                            <Input id="purpose" placeholder="e.g. Customer visit — Acme Corp, Chicago" value={purpose}
                                onChange={e => setPurpose(e.target.value)} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="currency">Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger id="currency" className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["USD", "GBP", "EUR", "AED", "CAD", "AUD", "SGD", "INR"].map(c =>
                                        <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="bu">Business Unit</Label>
                            <Select value={businessUnit} onValueChange={setBusinessUnit}>
                                <SelectTrigger id="bu" className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["US-OPS", "UK-OPS", "UAE-OPS", "APAC-OPS"].map(b =>
                                        <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="dept">Department</Label>
                            <Input id="dept" value={department} onChange={e => setDepartment(e.target.value)} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="startDate">Trip Start Date</Label>
                            <Input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="endDate">Trip End Date</Label>
                            <Input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="advance">Cash Advance Applied ($)</Label>
                            <Input id="advance" type="number" min="0" placeholder="0.00" value={advanceApplied}
                                onChange={e => setAdvanceApplied(e.target.value)} className="mt-1" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Expense Lines */}
            <Card className="mb-4">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Expense Lines</CardTitle>
                    <Button size="sm" onClick={addLine} variant="outline">
                        <Plus className="h-4 w-4 mr-1" />Add Line
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {lines.map((line, i) => (
                            <div key={line.id} className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-muted-foreground">Line {i + 1}</span>
                                    <div className="flex items-center gap-2">
                                        {POLICY_LIMITS[line.expenseType] && getLineAmount(line) > POLICY_LIMITS[line.expenseType] && (
                                            <Badge className="bg-amber-500 text-white text-xs py-0">
                                                <AlertTriangle className="h-3 w-3 mr-1" />Over Limit
                                            </Badge>
                                        )}
                                        {line.expenseType === "HOTEL" && (
                                            <Button size="sm" variant="ghost" className="text-xs h-7"
                                                onClick={() => setHotelFolioLine(line)}>
                                                <Hotel className="h-3 w-3 mr-1" />Hotel Folio
                                            </Button>
                                        )}
                                        <Button size="sm" variant="ghost" onClick={() => removeLine(line.id)}
                                            className="text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                        <Label className="text-xs">Expense Type</Label>
                                        <Select value={line.expenseType}
                                            onValueChange={v => updateLine(line.id, { expenseType: v })}>
                                            <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {EXPENSE_TYPES.map(t => (
                                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Date</Label>
                                        <Input type="date" className="mt-1 h-8 text-xs" value={line.expenseDate}
                                            onChange={e => updateLine(line.id, { expenseDate: e.target.value })} />
                                    </div>
                                    {line.expenseType === "MILEAGE" ? (
                                        <>
                                            <div>
                                                <Label className="text-xs">Miles</Label>
                                                <Input type="number" className="mt-1 h-8 text-xs" placeholder="0" value={line.miles || ""}
                                                    onChange={e => updateLine(line.id, { miles: e.target.value })} />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Rate/Mile ($)</Label>
                                                <Input type="number" className="mt-1 h-8 text-xs" placeholder="0.655" value={line.ratePerMile || ""}
                                                    onChange={e => updateLine(line.id, { ratePerMile: e.target.value })} />
                                            </div>
                                        </>
                                    ) : line.expenseType === "PER_DIEM" ? (
                                        <>
                                            <div>
                                                <Label className="text-xs">Days</Label>
                                                <Input type="number" className="mt-1 h-8 text-xs" placeholder="1" value={line.days || ""}
                                                    onChange={e => updateLine(line.id, { days: e.target.value })} />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Rate/Day ($)</Label>
                                                <Input type="number" className="mt-1 h-8 text-xs" placeholder="0.00" value={line.perDiemRate || ""}
                                                    onChange={e => updateLine(line.id, { perDiemRate: e.target.value })} />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <Label className="text-xs">Amount ({line.currency})</Label>
                                                <Input type="number" className="mt-1 h-8 text-xs" placeholder="0.00" value={line.amount}
                                                    onChange={e => updateLine(line.id, { amount: e.target.value })} />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Merchant / Vendor</Label>
                                                <Input className="mt-1 h-8 text-xs" placeholder="e.g. Hilton Hotels" value={line.merchant}
                                                    onChange={e => updateLine(line.id, { merchant: e.target.value })} />
                                            </div>
                                        </>
                                    )}
                                    <div className="col-span-full">
                                        <Label className="text-xs">Business Purpose</Label>
                                        <Input className="mt-1 h-8 text-xs" placeholder="Describe the business purpose" value={line.purpose}
                                            onChange={e => updateLine(line.id, { purpose: e.target.value })} />
                                    </div>
                                    <div className="flex items-center gap-4 col-span-full">
                                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                                            <input type="checkbox" checked={line.receiptAttached}
                                                onChange={e => updateLine(line.id, { receiptAttached: e.target.checked })}
                                                className="h-3 w-3" aria-label="Receipt attached" />
                                            Receipt Attached
                                        </label>
                                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                                            <input type="checkbox" checked={line.billable}
                                                onChange={e => updateLine(line.id, { billable: e.target.checked })}
                                                className="h-3 w-3" aria-label="Billable to client" />
                                            Billable to Client
                                        </label>
                                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                                            <input type="checkbox" checked={line.personalExpense}
                                                onChange={e => updateLine(line.id, { personalExpense: e.target.checked })}
                                                className="h-3 w-3" aria-label="Personal (not reimbursable)" />
                                            Personal (Not Reimbursable)
                                        </label>
                                        <div className="ml-auto text-sm font-medium">
                                            {formatNumber(getLineAmount(line), 2)} {line.currency}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Totals */}
            <Card>
                <CardContent className="pt-4 pb-4">
                    <div className="flex flex-col gap-2 max-w-sm ml-auto">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Expenses</span>
                            <span className="font-medium">{formatNumber(totalAmount, 2)} {currency}</span>
                        </div>
                        {parseFloat(advanceApplied || "0") > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Less: Cash Advance Applied</span>
                                <span className="text-destructive">- {formatNumber(parseFloat(advanceApplied), 2)} {currency}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-base font-bold">
                            <span>Net Amount Due Employee</span>
                            <span>{formatNumber(Math.max(0, totalAmount - parseFloat(advanceApplied || "0")), 2)} {currency}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Hotel Folio Dialog */}
            <Dialog open={!!hotelFolioLine} onOpenChange={() => setHotelFolioLine(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Hotel Folio Itemization</DialogTitle>
                    </DialogHeader>
                    {hotelFolioLine && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs">Check-In Date</Label>
                                    <Input type="date" className="mt-1 h-8 text-xs" value={hotelFolioLine.checkInDate || ""}
                                        onChange={e => setHotelFolioLine({ ...hotelFolioLine, checkInDate: e.target.value })} />
                                </div>
                                <div>
                                    <Label className="text-xs">Check-Out Date</Label>
                                    <Input type="date" className="mt-1 h-8 text-xs" value={hotelFolioLine.checkOutDate || ""}
                                        onChange={e => setHotelFolioLine({ ...hotelFolioLine, checkOutDate: e.target.value })} />
                                </div>
                                <div>
                                    <Label className="text-xs">Room Rate / Night</Label>
                                    <Input type="number" className="mt-1 h-8 text-xs" placeholder="0.00" value={hotelFolioLine.roomRate || ""}
                                        onChange={e => setHotelFolioLine({ ...hotelFolioLine, roomRate: e.target.value })} />
                                </div>
                                <div>
                                    <Label className="text-xs">Tax Amount</Label>
                                    <Input type="number" className="mt-1 h-8 text-xs" placeholder="0.00" value={hotelFolioLine.taxAmount || ""}
                                        onChange={e => setHotelFolioLine({ ...hotelFolioLine, taxAmount: e.target.value })} />
                                </div>
                            </div>
                            <div className="bg-muted/30 rounded p-3 text-xs text-muted-foreground">
                                <p className="font-medium mb-1">Itemization Summary</p>
                                <div className="flex justify-between"><span>Room Charges</span><span>{hotelFolioLine.roomRate || "0.00"}</span></div>
                                <div className="flex justify-between"><span>Taxes</span><span>{hotelFolioLine.taxAmount || "0.00"}</span></div>
                                <Separator className="my-1" />
                                <div className="flex justify-between font-medium">
                                    <span>Total</span>
                                    <span>{formatNumber((parseFloat(hotelFolioLine.roomRate || "0") + parseFloat(hotelFolioLine.taxAmount || "0")), 2)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => {
                            if (hotelFolioLine) {
                                const total = parseFloat(hotelFolioLine.roomRate || "0") + parseFloat(hotelFolioLine.taxAmount || "0");
                                updateLine(hotelFolioLine.id, { amount: total.toString(), checkInDate: hotelFolioLine.checkInDate, checkOutDate: hotelFolioLine.checkOutDate, roomRate: hotelFolioLine.roomRate, taxAmount: hotelFolioLine.taxAmount });
                            }
                            setHotelFolioLine(null);
                        }}>Apply &amp; Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}

export default ExpenseReportEntry;
