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
    AlertCircle,
    Building2,
    MapPin,
    CreditCard,
    Briefcase,
    ChevronRight,
    Search,
    Mail
} from "lucide-react";
import { ArRevenueScheduleList } from "./ArRevenueScheduleList";
import { ArCreditProfile } from "./ArCreditProfile";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Receipt } from "lucide-react";
import { ArAdjustmentDialog } from "./ArAdjustmentDialog"; // Import Dialog
import { Button } from "@/components/ui/button"; // Import Button

interface ArSideSheetProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    type: "invoice" | "customer" | "receipt";
}

export function ArSideSheet({ isOpen, onClose, data, type }: ArSideSheetProps) {
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
    const { toast } = useToast();

    const calculateTaxMutation = useMutation({
        mutationFn: (invoiceId: string) => api.tax.calculate(invoiceId),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/invoices"] });
            toast({
                title: "Tax Calculated",
                description: `Tax Amount: ${res.taxAmount}. Details: ${res.taxDetails.map((d: any) => `${d.code} (${d.rate * 100}%)`).join(", ")}`
            });
            onClose(); // Close sheet to force refresh or maybe just invalidate?
        },
        onError: (err: any) => toast({ title: "Tax Calculation Failed", description: err.message, variant: "destructive" })
    });

    // Fetch Accounts if type is customer
    const { data: accounts, isLoading: accountsLoading } = useQuery({
        queryKey: ["/api/ar/accounts", data?.id],
        queryFn: () => api.ar.accounts.list(data?.id),
        enabled: !!data?.id && type === "customer"
    });

    // Fetch Sites if an account is selected
    const { data: sites, isLoading: sitesLoading } = useQuery({
        queryKey: ["/api/ar/sites", selectedAccountId],
        queryFn: () => api.ar.sites.list(selectedAccountId!),
        enabled: !!selectedAccountId
    });

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

            {/* Action Bar */}
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsAdjustmentDialogOpen(true)}>
                    <Receipt className="w-4 h-4 mr-2" /> Adjust / Write-off
                </Button>
                <Button variant="outline" size="sm" disabled={calculateTaxMutation.isPending} onClick={() => calculateTaxMutation.mutate(data.id)}>
                    <DollarSign className="w-4 h-4 mr-2" /> {calculateTaxMutation.isPending ? "Calculating..." : "Calculate Tax"}
                </Button>
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
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Status: <strong>{data.recognitionStatus || "Pending"}</strong></span>
                </div>
                <ArRevenueScheduleList invoiceId={data.id} />
            </div>
        </div>
    );

    const renderCustomerDetails = () => (
        <div className="space-y-6 py-4">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-200">
                        <Building2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold tracking-tight">{data.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                            {data.customerType} Party
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg text-xs">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">Tax ID: {data.taxId || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg text-xs">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium truncate">{data.contactEmail || "No Email"}</span>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary/70">Customer Accounts</h4>
                    <Badge variant="outline" className="text-[10px] font-bold">{accounts?.length || 0} Accounts</Badge>
                </div>

                <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-3">
                        {accountsLoading ? (
                            <div className="space-y-2">
                                {[1, 2].map(i => <div key={i} className="h-20 w-full animate-pulse bg-muted rounded-xl" />)}
                            </div>
                        ) : accounts?.length === 0 ? (
                            <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed">
                                <p className="text-xs text-muted-foreground uppercase font-bold">No accounts found</p>
                            </div>
                        ) : (
                            accounts?.map((acc: any) => (
                                <div
                                    key={acc.id}
                                    onClick={() => setSelectedAccountId(selectedAccountId === acc.id ? null : acc.id)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedAccountId === acc.id
                                        ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-200 shadow-sm"
                                        : "hover:border-emerald-200 hover:bg-muted/50 border-muted-foreground/10"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-emerald-600" />
                                            <span className="font-bold text-sm tracking-tight">{acc.accountName}</span>
                                        </div>
                                        <Badge variant={acc.creditHold ? "destructive" : "default"} className="text-[9px] h-4 px-1">
                                            {acc.creditHold ? "ON HOLD" : "ACTIVE"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                                        <span>{acc.accountNumber}</span>
                                        <span className="text-rose-600 font-bold tracking-tight">${parseFloat(acc.balance).toLocaleString()}</span>
                                    </div>

                                    {selectedAccountId === acc.id && (
                                        <div className="mt-4 pt-4 border-t border-emerald-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <ArCreditProfile account={acc} />

                                            <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-emerald-800/60 mt-4">
                                                <span>Sites / Addresses</span>
                                            </div>
                                            {sitesLoading ? (
                                                <div className="h-10 w-full animate-pulse bg-emerald-100/50 rounded-lg" />
                                            ) : sites?.length === 0 ? (
                                                <p className="text-[10px] text-muted-foreground italic">No addresses defined for this account.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {sites?.map((site: any) => (
                                                        <div key={site.id} className="p-2 bg-white/60 rounded-lg border border-emerald-100 flex items-start gap-2">
                                                            <MapPin className="h-3 w-3 text-emerald-500 mt-0.5" />
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[11px] font-bold">{site.siteName}</span>
                                                                    {site.isBillTo && <Badge className="text-[8px] h-3 px-1 bg-sky-500">Bill-To</Badge>}
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">{site.address}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );

    return (
        <Sheet open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
                setSelectedAccountId(null);
            }
        }}>
            <SheetContent className="sm:max-w-md border-l-4 border-l-primary/20 shadow-2xl p-0 flex flex-col">
                <div className="p-6 pb-2">
                    <SheetHeader className="space-y-1">
                        <SheetTitle className="text-2xl font-black flex items-center gap-2 tracking-tight uppercase">
                            {type === "invoice" ? <FileText className="h-6 w-6 text-primary" /> :
                                type === "customer" ? <User className="h-6 w-6 text-primary" /> :
                                    <DollarSign className="h-6 w-6 text-primary" />}
                            {type} Profile
                        </SheetTitle>
                        <SheetDescription className="font-medium">
                            {type === "customer" ? "Registry & Account Hierarchy" : `Record detail for ${data.invoiceNumber || data.id}`}
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <Tabs defaultValue="details" className="flex-1 flex flex-col">
                        <div className="px-6 border-b">
                            <TabsList className="grid w-full grid-cols-2 mb-2">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="accounting" disabled={type === "customer"}>Accounting</TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1 px-6">
                            <TabsContent value="details" className="mt-0 outline-none">
                                {type === "invoice" ? renderInvoiceDetails() :
                                    type === "customer" ? renderCustomerDetails() :
                                        type === "receipt" ? renderReceiptDetails() : null}
                            </TabsContent>
                            <TabsContent value="accounting" className="mt-0 outline-none">
                                {(type === "invoice" || type === "receipt") && (
                                    <ArAccountingView entityId={data.id} type={type} />
                                )}
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                </div>

                <div className="p-4 bg-muted/20 border-t mt-auto">
                    <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest leading-none">
                        Oracle Fusion Parity Model v2.1 • AR Master Data
                    </p>
                </div>
                {type === "invoice" && (
                    <ArAdjustmentDialog
                        isOpen={isAdjustmentDialogOpen}
                        onClose={() => setIsAdjustmentDialogOpen(false)}
                        invoiceId={data.id}
                        // Calculate outstanding roughly or use total if full balance
                        currentBalance={Number(data.totalAmount)}
                    />
                )}
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

function ArAccountingView({ entityId, type }: { entityId: string, type: "invoice" | "receipt" }) {
    const { data: journals, isLoading } = useQuery({
        queryKey: [`/api/ar/${type === "invoice" ? "invoices" : "receipts"}/${entityId}/accounting`],
        queryFn: () => type === "invoice" ? api.ar.invoices.getAccounting(entityId) : api.ar.receipts.getAccounting(entityId)
    });

    if (isLoading) return <div className="space-y-4 py-4"><Skeleton className="h-32 w-full rouned-xl" /><Skeleton className="h-32 w-full rounded-xl" /></div>;

    if (!journals || journals.length === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed rounded-3xl mt-6 bg-muted/5">
                <FileText className="h-10 w-10 mx-auto opacity-10 mb-4" />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No accounting entries recorded</p>
                <p className="text-[11px] text-muted-foreground mt-2 font-medium px-8">Accounting is automatically generated in standard Oracle Parity workflows when the {type} is finalized.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 py-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-primary/70">Subledger Journals</h4>
                <Badge variant="outline" className="text-[10px] font-bold">{journals.length} Entry</Badge>
            </div>

            {journals.map((journal: any) => (
                <Card key={journal.id} className="overflow-hidden border-muted-foreground/10 shadow-sm rounded-2xl">
                    <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black h-5 uppercase">
                                {journal.status}
                            </Badge>
                            <span className="text-[10px] font-mono font-bold text-muted-foreground">ID: {journal.id.substring(0, 8)}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                            {format(new Date(journal.eventDate), "MMM dd, yyyy")}
                        </span>
                    </div>
                    <CardContent className="p-0">
                        <table className="w-full text-xs">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="p-3 text-left font-black uppercase tracking-widest text-[10px] text-muted-foreground">Account Class</th>
                                    <th className="p-3 text-right font-black uppercase tracking-widest text-[10px] text-muted-foreground">Debit</th>
                                    <th className="p-3 text-right font-black uppercase tracking-widest text-[10px] text-muted-foreground">Credit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-muted-foreground/5">
                                {journal.lines?.map((line: any) => (
                                    <tr key={line.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="p-3">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-xs">{line.accountingClass}</span>
                                                <span className="text-[9px] text-muted-foreground font-mono">{line.codeCombinationId.substring(0, 8)}...</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-right font-bold text-emerald-600">
                                            {line.enteredDr && Number(line.enteredDr) > 0 ? `$${Number(line.enteredDr).toLocaleString()}` : ""}
                                        </td>
                                        <td className="p-3 text-right font-bold text-rose-600">
                                            {line.enteredCr && Number(line.enteredCr) > 0 ? `$${Number(line.enteredCr).toLocaleString()}` : ""}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function renderReceiptDetails() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <DollarSign className="h-12 w-12 opacity-10 mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">Receipt Summary View</p>
            <p className="text-xs mt-2 px-12 text-center opacity-70">Detail attributes available in Subledger Accounting tab for this receipt.</p>
        </div>
    );
}
