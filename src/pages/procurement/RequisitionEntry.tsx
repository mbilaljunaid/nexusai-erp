import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Plus, Trash2, Save, Send } from "lucide-react";
import { DatePicker } from "@/components/ui/DatePicker";
import { formatNumber } from "@/lib/formatters";

interface RequisitionLine {
    lineNumber: number;
    itemDescription: string;
    quantity: string;
    unitPrice: string;
    uom: string;
    needByDate: string;
    suggestedSupplierId: string;
    category: string;
    amount: string;
}

export default function RequisitionEntry() {
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();

    const [header, setHeader] = useState({
        requisitionName: "",
        description: "",
        urgency: "Normal",
        businessUnitId: "BU_US",
        deliverToLocation: "",
        requesterName: ""
    });

    const [lines, setLines] = useState<RequisitionLine[]>([{
        lineNumber: 1,
        itemDescription: "",
        quantity: "",
        unitPrice: "",
        uom: "EA",
        needByDate: "",
        suggestedSupplierId: "",
        category: "",
        amount: ""
    }]);

    const { data: categories = [] } = useQuery<any[]>({
        queryKey: ["/api/procurement/categories"],
        queryFn: () => fetch("/api/procurement/categories").then(r => r.json()).catch(() => []),
    });

    const { data: suppliers = [] } = useQuery<any[]>({
        queryKey: ["/api/ap/suppliers"],
        queryFn: () => fetch("/api/ap/suppliers").then(r => r.json()).catch(() => []),
    });

    const submitMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/procurement/requisitions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/requisitions"] });
            toast({ title: "Requisition submitted for approval" });
            setLocation("/procurement/requisitions/approvals");
        },
        onError: () => toast({ title: "Submission failed", variant: "destructive" }),
    });

    const addLine = () => setLines([...lines, {
        lineNumber: lines.length + 1,
        itemDescription: "", quantity: "", unitPrice: "", uom: "EA",
        needByDate: "", suggestedSupplierId: "", category: "", amount: ""
    }]);

    const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i).map((l, idx) => ({ ...l, lineNumber: idx + 1 })));

    const updateLine = (index: number, field: keyof RequisitionLine, value: string) => {
        const updated = [...lines];
        updated[index] = { ...updated[index], [field]: value };
        if (field === "quantity" || field === "unitPrice") {
            const qty = parseFloat(field === "quantity" ? value : updated[index].quantity) || 0;
            const price = parseFloat(field === "unitPrice" ? value : updated[index].unitPrice) || 0;
            updated[index].amount = (qty * price).toFixed(2);
        }
        setLines(updated);
    };

    const totalAmount = lines.reduce((sum, l) => sum + parseFloat(l.amount || "0"), 0);

    const lineColumns: SpreadsheetColumn<RequisitionLine>[] = [
        { id: "lineNumber", header: "#", width: "50px", cell: r => <span className="text-muted-foreground font-mono text-sm">{r.lineNumber}</span> },
        {
            id: "itemDescription", header: "Item / Description *", width: "220px",
            cell: (r, i, update) => <Input className="h-9" value={r.itemDescription} onChange={e => update("itemDescription", e.target.value)} placeholder="Describe item..." />
        },
        {
            id: "category", header: "Category", width: "160px",
            cell: (r, i, update) => (
                <Select value={r.category || undefined} onValueChange={v => update("category", v)}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="IT_HARDWARE">IT Hardware</SelectItem>
                        <SelectItem value="IT_SOFTWARE">IT Software</SelectItem>
                        <SelectItem value="OFFICE_SUPPLIES">Office Supplies</SelectItem>
                        <SelectItem value="FACILITIES">Facilities</SelectItem>
                        <SelectItem value="PROFESSIONAL_SVC">Professional Services</SelectItem>
                        <SelectItem value="TRAVEL">Travel</SelectItem>
                        {Array.isArray(categories) && categories.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "quantity", header: "Qty", width: "90px",
            cell: (r, i, update) => <Input type="number" className="h-9" value={r.quantity} onChange={e => updateLine(i, "quantity", e.target.value)} placeholder="0" />
        },
        {
            id: "uom", header: "UOM", width: "80px",
            cell: (r, i, update) => <Input className="h-9 text-center px-1" value={r.uom} onChange={e => update("uom", e.target.value)} />
        },
        {
            id: "unitPrice", header: "Est. Unit Price", width: "130px",
            cell: (r, i, update) => <Input type="number" step="0.01" className="h-9" value={r.unitPrice} onChange={e => updateLine(i, "unitPrice", e.target.value)} placeholder="0.00" />
        },
        {
            id: "amount", header: "Amount", width: "120px",
            cell: r => <Input readOnly className="h-9 bg-muted/40 font-semibold" value={r.amount ? `$${formatNumber(parseFloat(r.amount))}` : ""} />
        },
        {
            id: "needByDate", header: "Need By", width: "140px",
            cell: (r, i, update) => <DatePicker value={r.needByDate} onChange={v => update("needByDate", v)} />
        },
        {
            id: "suggestedSupplierId", header: "Suggested Supplier", width: "180px",
            cell: (r, i, update) => (
                <Select value={r.suggestedSupplierId || undefined} onValueChange={v => update("suggestedSupplierId", v)}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                        {Array.isArray(suppliers) && suppliers.slice(0, 30).map((s: any) => (
                            <SelectItem key={s.id} value={String(s.id)}>{s.name || s.supplierName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "actions", header: "", width: "50px",
            cell: (r, i) => (
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => removeLine(i)} disabled={lines.length === 1} aria-label="Remove line">
                    <Trash2 className="h-4 w-4" />
                </Button>
            )
        }
    ];

    return (
        <StandardPage
            title="New Purchase Requisition"
            description="Submit a request for goods or services. Requisitions route through approval workflow before a PO is raised."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Procurement", href: "/scm/procurement" },
                { label: "New Requisition" }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setLocation("/scm/procurement")}>Cancel</Button>
                    <Button variant="secondary" onClick={() => submitMutation.mutate({ header, lines, status: "Draft" })} disabled={submitMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" /> Save Draft
                    </Button>
                    <Button onClick={() => submitMutation.mutate({ header, lines, status: "Pending Approval" })} disabled={submitMutation.isPending}>
                        <Send className="h-4 w-4 mr-2" /> Submit for Approval
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Header */}
                <Card>
                    <CardHeader><CardTitle>Requisition Header</CardTitle></CardHeader>
                    <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Requisition Name *</Label>
                            <Input value={header.requisitionName} onChange={e => setHeader({ ...header, requisitionName: e.target.value })} placeholder="e.g. Q1 IT Equipment Request" />
                        </div>
                        <div className="space-y-2">
                            <Label>Business Unit</Label>
                            <Select value={header.businessUnitId} onValueChange={v => setHeader({ ...header, businessUnitId: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BU_US">US Operations</SelectItem>
                                    <SelectItem value="BU_EU">EU Operations</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Urgency</Label>
                            <Select value={header.urgency} onValueChange={v => setHeader({ ...header, urgency: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Normal">Normal</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Requester Name</Label>
                            <Input value={header.requesterName} onChange={e => setHeader({ ...header, requesterName: e.target.value })} placeholder="Your name" />
                        </div>
                        <div className="space-y-2">
                            <Label>Deliver To Location</Label>
                            <Input value={header.deliverToLocation} onChange={e => setHeader({ ...header, deliverToLocation: e.target.value })} placeholder="e.g. Austin HQ - Floor 3" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Description / Justification</Label>
                            <Textarea value={header.description} onChange={e => setHeader({ ...header, description: e.target.value })} placeholder="Business justification..." rows={2} />
                        </div>
                    </CardContent>
                </Card>

                {/* Lines */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Requisition Lines</CardTitle>
                            <CardDescription>
                                Total: <span className="font-bold text-foreground">${formatNumber(totalAmount)}</span>
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={addLine}>
                            <Plus className="h-4 w-4 mr-2" /> Add Line
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <InteractiveSpreadsheet data={lines} columns={lineColumns} onChange={setLines} />
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
