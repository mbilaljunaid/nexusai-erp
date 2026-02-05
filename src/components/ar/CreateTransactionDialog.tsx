import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";

export function CreateTransactionDialog() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState("INV"); // INV, CM, DM
    const [loading, setLoading] = useState(false);

    // Form State
    const [customerId, setCustomerId] = useState("");
    const [amount, setAmount] = useState("");
    const [refInvoiceId, setRefInvoiceId] = useState("");
    const [description, setDescription] = useState("");

    const { data: customers } = useQuery({
        queryKey: ["/api/ar/customers"],
        queryFn: async () => (await apiRequest("GET", "/api/ar/customers")).json()
    });

    const { data: invoices } = useQuery({
        queryKey: ["/api/ar/invoices"],
        queryFn: async () => (await apiRequest("GET", "/api/ar/invoices")).json(),
        enabled: type !== "INV"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let endpoint = "/api/ar/invoices";
            let payload: any = {};

            if (type === "INV") {
                // Basic Invoice Creation (Demo simplification: auto-select account/site)
                // In real app, we'd need account/site pickers. 
                // We'll fetch the customer's account/site in background or mock for this dialog
                const accRes = await apiRequest("GET", `/api/ar/accounts?customerId=${customerId}`);
                const accounts = await accRes.json();
                const accountId = accounts[0]?.id;

                const siteRes = await apiRequest("GET", `/api/ar/sites?accountId=${accountId}`);
                const sites = await siteRes.json();
                const siteId = sites[0]?.id;

                payload = {
                    customerId,
                    accountId,
                    siteId,
                    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
                    amount: amount,
                    totalAmount: amount,
                    transactionClass: "INV",
                    status: "Sent",
                    description,
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                };
            } else if (type === "CM") {
                endpoint = "/api/ar/credit-memos";
                payload = {
                    sourceInvoiceId: refInvoiceId,
                    amount: Number(amount),
                    reason: description
                };
            } else if (type === "DM") {
                // Debit Memo
                // Simpler mock: similar to Invoice
                const accRes = await apiRequest("GET", `/api/ar/accounts?customerId=${customerId}`);
                const accounts = await accRes.json();
                const accountId = accounts[0]?.id;
                const siteRes = await apiRequest("GET", `/api/ar/sites?accountId=${accountId}`);
                const sites = await siteRes.json();
                const siteId = sites[0]?.id;

                endpoint = "/api/ar/debit-memos"; // We need to expose this route specifically? Or use standard Create
                // Let's use the create endpoint wrapper if we made one, or generic invoice create
                // ArService.createDebitMemo was defined but route might not be exposed separately.
                // Let's assume we post to generic invoice with class DM or specific route.
                // Wait, we didn't add /credit-memos routes yet! Just the service methods.
                // TODO: Add Routes. For now, we will fail.
                // Let's add the routes right after this tool call.
            }

            await apiRequest("POST", endpoint, payload);

            toast({ title: "Success", description: "Transaction created successfully" });
            setIsOpen(false);
            queryClient.invalidateQueries({ queryKey: ["/api/ar/invoices"] });
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="mr-2 h-4 w-4" /> New Transaction
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create AR Transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Transaction Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INV">Standard Invoice</SelectItem>
                                <SelectItem value="CM">Credit Memo</SelectItem>
                                <SelectItem value="DM">Debit Memo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Customer Picker (Hide if CM derived from Invoice) */}
                    {(type === "INV" || type === "DM") && (
                        <div className="space-y-2">
                            <Label>Customer</Label>
                            <Select value={customerId} onValueChange={setCustomerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers?.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Reference Invoice Picker (For CM) */}
                    {type === "CM" && (
                        <div className="space-y-2">
                            <Label>Reference Invoice</Label>
                            <Select value={refInvoiceId} onValueChange={setRefInvoiceId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Original Invoice" />
                                </SelectTrigger>
                                <SelectContent>
                                    {invoices?.map((i: any) => (
                                        <SelectItem key={i.id} value={i.id}>{i.invoiceNumber} (${i.totalAmount})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                        <Label>Description / Reason</Label>
                        <Textarea value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create {type}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
