import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Banknote, Plus, CheckCircle, FileText, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type BankAccount = {
    id: string;
    bankName: string;
    accountNumber: string;
    currency: string;
    accountType: string;
    swiftCode: string;
    currentBalance: string;
    active: boolean;
    approvalStatus?: string;
    ledgerId?: string;
};

export default function TreasuryBankAccounts() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // New Account Form State
    const [newAccount, setNewAccount] = useState({
        bankName: "",
        accountNumber: "",
        currency: "USD",
        accountType: "CHECKING",
        swiftCode: "",
        currentBalance: "0"
    });

    const { data: accounts, isLoading } = useQuery<BankAccount[]>({
        queryKey: ["/api/cash/accounts"],
        queryFn: async () => {
            const res = await fetch("/api/cash/accounts", {
                headers: { "x-user-id": "1" }
            });
            if (!res.ok) throw new Error("Failed to fetch bank accounts");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof newAccount) => {
            const res = await fetch("/api/cash/accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create bank account");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/cash/accounts"] });
            setCreateDialogOpen(false);
            setNewAccount({
                bankName: "", accountNumber: "", currency: "USD", accountType: "CHECKING", swiftCode: "", currentBalance: "0"
            });
            toast({ title: "Success", description: "Bank Account created successfully." });
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleCreate = () => {
        if (!newAccount.bankName || !newAccount.accountNumber || !newAccount.swiftCode) {
            toast({ title: "Validation Error", description: "Bank Name, Account Number, and SWIFT Code are required.", variant: "destructive" });
            return;
        }
        createMutation.mutate(newAccount);
    };

    return (
        <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Treasury Bank Accounts</h1>
                    <p className="text-muted-foreground mt-2">Manage internal bank accounts, SWIFT connectivity, and balances.</p>
                </div>
                <div className="space-x-2">
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Account
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Active Bank Accounts</CardTitle>
                        <CardDescription>Overview of all internal bank accounts connected for AP/AR disbursements and receipts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : (
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Bank Name</TableHead>
                                            <TableHead>Account / IBAN</TableHead>
                                            <TableHead>SWIFT / BIC</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Currency</TableHead>
                                            <TableHead className="text-right">Balance</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {accounts?.map((account) => (
                                            <TableRow key={account.id}>
                                                <TableCell className="font-medium">{account.bankName}</TableCell>
                                                <TableCell className="font-mono">{account.accountNumber}</TableCell>
                                                <TableCell className="font-mono">{account.swiftCode}</TableCell>
                                                <TableCell>{account.accountType}</TableCell>
                                                <TableCell>{account.currency}</TableCell>
                                                <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                                                    {Number(account.currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${account.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {account.active ? "ACTIVE" : "INACTIVE"}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {accounts?.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                                    No bank accounts defined. Click "Create Account" to onboard a new one.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Add Treasury Bank Account</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Bank Name</Label>
                            <Input
                                placeholder="JPMorgan Chase, Citibank, etc."
                                value={newAccount.bankName}
                                onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Account Number / IBAN</Label>
                            <Input
                                placeholder="USXX CHAS... / GB82..."
                                value={newAccount.accountNumber}
                                onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>SWIFT / BIC Code</Label>
                            <Input
                                placeholder="CHASUS33"
                                value={newAccount.swiftCode}
                                onChange={(e) => setNewAccount({ ...newAccount, swiftCode: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Account Type</Label>
                            <Select value={newAccount.accountType} onValueChange={(v) => setNewAccount({ ...newAccount, accountType: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CHECKING">Checking / Current Account</SelectItem>
                                    <SelectItem value="SAVINGS">Savings Account</SelectItem>
                                    <SelectItem value="PAYROLL">Payroll Account</SelectItem>
                                    <SelectItem value="ESCROW">Escrow Account</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select value={newAccount.currency} onValueChange={(v) => setNewAccount({ ...newAccount, currency: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                    <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Initial Balance</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={newAccount.currentBalance}
                                onChange={(e) => setNewAccount({ ...newAccount, currentBalance: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={createMutation.isPending}>
                            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Save Account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
