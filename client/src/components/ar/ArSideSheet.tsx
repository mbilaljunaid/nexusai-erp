import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
    FileText,
    User,
    Calendar,
    DollarSign,
    Activity,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react";

interface ArSideSheetProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    type: "invoice" | "customer" | "receipt";
}

export function ArSideSheet({ isOpen, onClose, data, type }: ArSideSheetProps) {
    if (!data) return null;

    const renderInvoiceDetails = () => (
        <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
                <Badge className={
                    data.status === "Paid" ? "bg-emerald-500" :
                        data.status === "Overdue" ? "bg-rose-500" : "bg-blue-500"
                }>
                    {data.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{format(new Date(data.createdAt), "MMM dd, yyyy")}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-xl border">
                    <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-primary">${parseFloat(data.totalAmount).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl border">
                    <p className="text-xs text-muted-foreground mb-1">Tax Amount</p>
                    <p className="text-xl font-bold text-primary">${parseFloat(data.taxAmount).toLocaleString()}</p>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Invoice Information</h4>
                <div className="space-y-3">
                    <DetailItem icon={<FileText className="h-4 w-4" />} label="Invoice Number" value={data.invoiceNumber} />
                    <DetailItem icon={<Calendar className="h-4 w-4" />} label="Due Date" value={format(new Date(data.dueDate), "PPP")} />
                    <DetailItem icon={<DollarSign className="h-4 w-4" />} label="Currency" value={data.currency} />
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Revenue Recognition</h4>
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Status: <strong>{data.recognitionStatus || "Pending"}</strong></span>
                </div>
            </div>
        </div>
    );

    const renderCustomerDetails = () => (
        <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
                <Badge variant={data.creditHold ? "destructive" : "outline"} className={!data.creditHold ? "border-emerald-500 text-emerald-600" : ""}>
                    {data.creditHold ? "Credit Hold" : "Active"}
                </Badge>
                <Badge variant="secondary">{data.riskCategory} Risk</Badge>
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Customer Profile</h4>
                <div className="space-y-3">
                    <DetailItem icon={<User className="h-4 w-4" />} label="Legal Name" value={data.name} />
                    <DetailItem icon={<FileText className="h-4 w-4" />} label="Tax ID" value={data.taxId || "N/A"} />
                    <DetailItem icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} label="Customer Type" value={data.customerType} />
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Financial Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Credit Limit</p>
                        <p className="text-lg font-bold">${parseFloat(data.creditLimit).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Outstanding Balance</p>
                        <p className="text-lg font-bold text-rose-600">${parseFloat(data.balance).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-md border-l-4 border-l-primary/20 shadow-2xl">
                <SheetHeader className="space-y-1">
                    <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                        {type === "invoice" ? <FileText className="h-6 w-6 text-primary" /> :
                            type === "customer" ? <User className="h-6 w-6 text-primary" /> :
                                <DollarSign className="h-6 w-6 text-primary" />}
                        {type.charAt(0).toUpperCase() + type.slice(1)} Details
                    </SheetTitle>
                    <SheetDescription>
                        Full record for {data.invoiceNumber || data.name || data.id}
                    </SheetDescription>
                </SheetHeader>
                {type === "invoice" ? renderInvoiceDetails() :
                    type === "customer" ? renderCustomerDetails() : null}
            </SheetContent>
        </Sheet>
    );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center gap-3 text-sm group">
            <div className="p-2 transition-colors">{icon}</div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-tighter">{label}</span>
                <span className="font-medium">{value}</span>
            </div>
        </div>
    );
}
