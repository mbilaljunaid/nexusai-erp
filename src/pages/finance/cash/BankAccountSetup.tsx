import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Building2, CreditCard, Globe, Pencil, Trash2 } from "lucide-react";

// Oracle CE: Set Up Banks, Branches, and Accounts

interface Bank { id: string; bankName: string; countryCode: string; bicSwift: string; status: "Active" | "Inactive"; branchCount: number; accountCount: number; }
interface Branch { id: string; bankId: string; branchName: string; branchNumber: string; address: string; city: string; }
interface BankAccount { id: string; bankId: string; branchId: string; accountName: string; accountNumber: string; iban: string; currency: string; accountType: string; glAccount: string; status: "Active" | "Inactive"; }

const MOCK_BANKS: Bank[] = [
    { id: "1", bankName: "HSBC Bank plc", countryCode: "GB", bicSwift: "HBUKGB4B", status: "Active", branchCount: 2, accountCount: 3 },
    { id: "2", bankName: "Emirates NBD", countryCode: "AE", bicSwift: "EBILAEAD", status: "Active", branchCount: 1, accountCount: 2 },
    { id: "3", bankName: "JPMorgan Chase", countryCode: "US", bicSwift: "CHASUS33", status: "Active", branchCount: 1, accountCount: 1 },
];
const MOCK_ACCOUNTS: BankAccount[] = [
    { id: "1", bankId: "1", branchId: "b1", accountName: "GBP Operating", accountNumber: "12345678", iban: "GB29NWBK60161331926819", currency: "GBP", accountType: "Checking", glAccount: "11100-GBP", status: "Active" },
    { id: "2", bankId: "1", branchId: "b1", accountName: "GBP Payroll", accountNumber: "12345679", iban: "GB29NWBK60161331926820", currency: "GBP", accountType: "Checking", glAccount: "11101-GBP", status: "Active" },
    { id: "3", bankId: "2", branchId: "b2", accountName: "AED Operating", accountNumber: "AE070331234567890123456", iban: "AE070331234567890123456", currency: "AED", accountType: "Checking", glAccount: "11110-AED", status: "Active" },
];

export function BankAccountSetup() {
    const { toast } = useToast();
    const [banks] = useState<Bank[]>(MOCK_BANKS);
    const [accounts, setAccounts] = useState<BankAccount[]>(MOCK_ACCOUNTS);
    const [tab, setTab] = useState("banks");
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [showAddBank, setShowAddBank] = useState(false);
    const [form, setForm] = useState<Partial<BankAccount>>({ currency: "USD", accountType: "Checking", status: "Active" });
    const [bankForm, setBankForm] = useState<Partial<Bank>>({ countryCode: "US", status: "Active" });

    const handleAddAccount = () => {
        if (!form.accountName || !form.accountNumber) {
            toast({ title: "Account name and number required", variant: "destructive" }); return;
        }
        setAccounts(prev => [...prev, { id: Date.now().toString(), bankId: "1", branchId: "b1", ...form } as BankAccount]);
        setShowAddAccount(false);
        setForm({ currency: "USD", accountType: "Checking", status: "Active" });
        toast({ title: "Bank account created", className: "bg-green-900 border-green-700 text-white" });
    };

    return (
        <StandardPage
            title="Banks, Branches & Accounts"
            description="Configure bank institutions, branch offices, and company bank accounts"
            actions={
                <div className="flex gap-2">
                    {tab === "banks" && <Button size="sm" onClick={() => setShowAddBank(true)}><Plus className="h-4 w-4 mr-2" />Add Bank</Button>}
                    {tab === "accounts" && <Button size="sm" onClick={() => setShowAddAccount(true)}><Plus className="h-4 w-4 mr-2" />Add Account</Button>}
                </div>
            }
        >
            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="banks">Banks ({banks.length})</TabsTrigger>
                    <TabsTrigger value="accounts">Bank Accounts ({accounts.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="banks">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {banks.map(bank => (
                            <Card key={bank.id} className="border-border hover:border-primary/40 transition-colors">
                                <CardContent className="pt-4 pb-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                                                <Building2 className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{bank.bankName}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{bank.bicSwift}</p>
                                            </div>
                                        </div>
                                        <Badge className={bank.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}>{bank.status}</Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="text-center">
                                            <p className="text-muted-foreground">Country</p>
                                            <p className="font-medium">{bank.countryCode}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-muted-foreground">Branches</p>
                                            <p className="font-medium">{bank.branchCount}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-muted-foreground">Accounts</p>
                                            <p className="font-medium">{bank.accountCount}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="accounts">
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/20 text-xs text-muted-foreground">
                                    <tr>
                                        <th className="p-3 text-left">Account Name</th>
                                        <th className="p-3 text-left">Account Number / IBAN</th>
                                        <th className="p-3 text-left">Currency</th>
                                        <th className="p-3 text-left">Type</th>
                                        <th className="p-3 text-left">GL Account</th>
                                        <th className="p-3 text-left">Status</th>
                                        <th className="p-3 text-left w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {accounts.map(a => (
                                        <tr key={a.id} className="hover:bg-muted/10">
                                            <td className="p-3 font-medium">{a.accountName}</td>
                                            <td className="p-3 font-mono text-xs">
                                                <div>{a.accountNumber}</div>
                                                {a.iban && <div className="text-muted-foreground">{a.iban}</div>}
                                            </td>
                                            <td className="p-3"><Badge>{a.currency}</Badge></td>
                                            <td className="p-3 text-xs text-muted-foreground">{a.accountType}</td>
                                            <td className="p-3 font-mono text-xs">{a.glAccount}</td>
                                            <td className="p-3">
                                                <Badge className={a.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}>{a.status}</Badge>
                                            </td>
                                            <td className="p-3">
                                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add Bank Account Dialog */}
            <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Bank Account</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: "accountName", label: "Account Name *", value: form.accountName || "" },
                            { id: "accountNumber", label: "Account Number *", value: form.accountNumber || "" },
                            { id: "iban", label: "IBAN", value: form.iban || "" },
                            { id: "glAccount", label: "GL Account", value: form.glAccount || "" },
                        ].map(f => (
                            <div key={f.id} className={f.id === "accountName" ? "col-span-2" : ""}>
                                <Label htmlFor={f.id} className="text-xs">{f.label}</Label>
                                <Input id={f.id} className="mt-1 h-8 text-xs" value={f.value}
                                    onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))} />
                            </div>
                        ))}
                        <div>
                            <Label className="text-xs">Currency</Label>
                            <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["USD", "GBP", "EUR", "AED", "SAR", "CAD", "AUD"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Account Type</Label>
                            <Select value={form.accountType} onValueChange={v => setForm(p => ({ ...p, accountType: v }))}>
                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {["Checking", "Savings", "Money Market", "Concentration"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddAccount(false)}>Cancel</Button>
                        <Button onClick={handleAddAccount}>Create Account</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}

export default BankAccountSetup;
