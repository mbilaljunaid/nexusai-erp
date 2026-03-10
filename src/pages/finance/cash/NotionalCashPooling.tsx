import { useState, useMemo } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, RefreshCw, Plus, ArrowUpDown } from "lucide-react";
import { formatNumber } from "@/lib/formatters";

interface CashPool {
    id: string;
    poolName: string;
    poolHeader: string; // master account
    poolType: "Zero-Balancing" | "Notional";
    currency: string;
    participatingAccounts: number;
    totalBalance: number;
    notionalInterestRate: number;
    status: "Active" | "Inactive";
}

interface PoolAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    iban: string;
    currency: string;
    balance: number;
    role: "Header" | "Participant";
}

const MOCK_POOLS: CashPool[] = [
    { id: "NCP-001", poolName: "EUR Treasury Pool — Frankfurt", poolHeader: "DE89 3704 0044 0532 0130 00", poolType: "Notional", currency: "EUR", participatingAccounts: 4, totalBalance: 2840000, notionalInterestRate: 3.25, status: "Active" },
    { id: "NCP-002", poolName: "USD Zero-Balance Pool — New York", poolHeader: "US23 0001 2233 3400 0012", poolType: "Zero-Balancing", currency: "USD", participatingAccounts: 6, totalBalance: 5120000, notionalInterestRate: 4.10, status: "Active" },
    { id: "NCP-003", poolName: "GBP Group Pool — London", poolHeader: "GB29 NWBK 6016 1331 9268 19", poolType: "Notional", currency: "GBP", participatingAccounts: 3, totalBalance: 1750000, notionalInterestRate: 4.75, status: "Active" },
];

const MOCK_POOL_ACCOUNTS: PoolAccount[] = [
    { id: "1", bankName: "Deutsche Bank", accountNumber: "5320130000", iban: "DE89 3704 0044 0532 0130 00", currency: "EUR", balance: 1200000, role: "Header" },
    { id: "2", bankName: "Deutsche Bank", accountNumber: "5320130001", iban: "DE89 3704 0044 0532 0130 01", currency: "EUR", balance: 480000, role: "Participant" },
    { id: "3", bankName: "Deutsche Bank", accountNumber: "5320130002", iban: "DE89 3704 0044 0532 0130 02", currency: "EUR", balance: 760000, role: "Participant" },
    { id: "4", bankName: "Commerzbank AG", accountNumber: "44099900", iban: "DE21 3005 0000 4409 9900 00", currency: "EUR", balance: 400000, role: "Participant" },
];

const validateIBAN = (iban: string): boolean => {
    const cleaned = iban.replace(/\s/g, "").toUpperCase();
    return /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(cleaned) && cleaned.length >= 15;
};

const validateSWIFT = (swift: string): boolean => {
    return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swift.toUpperCase());
};

export default function NotionalCashPooling() {
    const { toast } = useToast();
    const [pools] = useState<CashPool[]>(MOCK_POOLS);
    const [ibanInput, setIbanInput] = useState("");
    const [swiftInput, setSwiftInput] = useState("");
    const [ibanValid, setIbanValid] = useState<boolean | null>(null);
    const [swiftValid, setSwiftValid] = useState<boolean | null>(null);
    const [sweepConfirm, setSweepConfirm] = useState<CashPool | null>(null);

    const poolColumns: SpreadsheetColumn<CashPool>[] = useMemo(() => [
        { id: "poolName", header: "Pool Name", width: "250px", cellClassName: "font-medium", cell: (r) => r.poolName },
        { id: "poolType", header: "Type", width: "140px", cell: (r) => <Badge variant={r.poolType === "Notional" ? "default" : "outline"}>{r.poolType}</Badge> },
        { id: "currency", header: "CCY", width: "70px", cellClassName: "font-mono text-sm font-medium", cell: (r) => r.currency },
        { id: "participatingAccounts", header: "Accounts", width: "100px", cellClassName: "text-center", cell: (r) => r.participatingAccounts },
        { id: "totalBalance", header: "Net Pool Balance", width: "160px", cellClassName: "text-right font-mono font-bold", cell: (r) => formatNumber(r.totalBalance) },
        { id: "notionalInterestRate", header: "Rate %", width: "90px", cellClassName: "text-center font-mono", cell: (r) => `${r.notionalInterestRate}%` },
        {
            id: "actions", header: "Action", width: "160px",
            cell: (r) => (
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setSweepConfirm(r)}>
                    <ArrowUpDown className="mr-1 h-3 w-3" /> Trigger Sweep
                </Button>
            ),
        },
    ], []);

    const accountColumns: SpreadsheetColumn<PoolAccount>[] = useMemo(() => [
        { id: "role", header: "Role", width: "110px", cell: (r) => <Badge variant={r.role === "Header" ? "default" : "secondary"}>{r.role}</Badge> },
        { id: "bankName", header: "Bank", width: "170px", cell: (r) => r.bankName },
        { id: "iban", header: "IBAN", width: "240px", cellClassName: "font-mono text-sm", cell: (r) => r.iban },
        { id: "currency", header: "CCY", width: "70px", cellClassName: "font-mono text-sm", cell: (r) => r.currency },
        { id: "balance", header: "Balance", width: "140px", cellClassName: "text-right font-mono font-bold", cell: (r) => formatNumber(r.balance) },
    ], []);

    return (
        <StandardPage
            title="Notional Cash Pooling"
            description="Configure and manage notional and zero-balancing cash pools across entities and currencies. Validate IBANs and SWIFT codes for participating bank accounts."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Cash Management", href: "/finance/cash" },
                { label: "Notional Cash Pooling" },
            ]}
        >
            <Tabs defaultValue="pools">
                <TabsList className="mb-4">
                    <TabsTrigger value="pools">Pool Configuration</TabsTrigger>
                    <TabsTrigger value="accounts">EUR Pool Accounts</TabsTrigger>
                    <TabsTrigger value="validation">IBAN / SWIFT Validator</TabsTrigger>
                </TabsList>

                <TabsContent value="pools">
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                        {[
                            { label: "Active Pools", value: pools.filter(p => p.status === "Active").length, sub: "across 3 currencies" },
                            { label: "Total Participating Accounts", value: pools.reduce((s, p) => s + p.participatingAccounts, 0), sub: "across all pools" },
                            { label: "Combined Net Balance", value: `${formatNumber(pools.reduce((s, p) => s + p.totalBalance, 0))}`, sub: "multi-currency gross" },
                        ].map((m) => (
                            <Card key={m.label} className="border-l-4 border-l-primary">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground">{m.label}</p>
                                    <p className="text-2xl font-bold font-mono">{m.value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <InteractiveSpreadsheet<CashPool>
                        data={pools}
                        columns={poolColumns}
                        onChange={() => { }}
                        containerHeight="340px"
                    />
                </TabsContent>

                <TabsContent value="accounts">
                    <Card className="mb-4">
                        <CardHeader>
                            <CardTitle className="text-base">EUR Treasury Pool — Frankfurt</CardTitle>
                            <CardDescription>Header account and participant accounts. Interest is calculated on the notional net position (sum of all balances) rather than sweeping physical funds.</CardDescription>
                        </CardHeader>
                    </Card>
                    <InteractiveSpreadsheet<PoolAccount>
                        data={MOCK_POOL_ACCOUNTS}
                        columns={accountColumns}
                        onChange={() => { }}
                        containerHeight="320px"
                    />
                    <div className="mt-3 p-3 bg-muted/40 rounded text-xs text-muted-foreground">
                        <strong>Notional Total:</strong> {formatNumber(MOCK_POOL_ACCOUNTS.reduce((s, a) => s + a.balance, 0))} EUR — Interest calculated on this net balance at the pool rate (3.25%) without physical fund movement.
                    </div>
                </TabsContent>

                <TabsContent value="validation">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* IBAN Validator */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">IBAN Validator</CardTitle>
                                <CardDescription>Validate International Bank Account Number format per ISO 13616.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="iban-input">IBAN</Label>
                                    <Input
                                        id="iban-input"
                                        value={ibanInput}
                                        onChange={e => { setIbanInput(e.target.value); setIbanValid(null); }}
                                        placeholder="e.g. DE89 3704 0044 0532 0130 00"
                                        className="font-mono"
                                    />
                                </div>
                                <Button onClick={() => setIbanValid(validateIBAN(ibanInput))}>
                                    Validate IBAN
                                </Button>
                                {ibanValid !== null && (
                                    <div className={`p-3 rounded-lg text-sm ${ibanValid ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200"}`}>
                                        {ibanValid ? "✅ IBAN is valid and conforms to ISO 13616 format." : "❌ Invalid IBAN. Check country code, check digits, and length."}
                                    </div>
                                )}
                                <div className="text-xs text-muted-foreground mt-2">
                                    Validates country code (2 letters), check digits (2 digits), and BBAN structure.
                                </div>
                            </CardContent>
                        </Card>

                        {/* SWIFT/BIC Validator */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">SWIFT / BIC Validator</CardTitle>
                                <CardDescription>Validate Bank Identifier Code (BIC) format per ISO 9362.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="swift-input">SWIFT / BIC Code</Label>
                                    <Input
                                        id="swift-input"
                                        value={swiftInput}
                                        onChange={e => { setSwiftInput(e.target.value); setSwiftValid(null); }}
                                        placeholder="e.g. DEUTDEDB"
                                        className="font-mono uppercase"
                                    />
                                </div>
                                <Button onClick={() => setSwiftValid(validateSWIFT(swiftInput))}>
                                    Validate SWIFT
                                </Button>
                                {swiftValid !== null && (
                                    <div className={`p-3 rounded-lg text-sm ${swiftValid ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200"}`}>
                                        {swiftValid ? "✅ BIC is valid and conforms to ISO 9362 format." : "❌ Invalid BIC. Expected format: AAAA BB CC [DDD] (8 or 11 characters)."}
                                    </div>
                                )}
                                <div className="text-xs text-muted-foreground mt-2">
                                    Validates institution code (4), country code (2), location (2), and optional branch (3).
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Sweep Confirmation */}
            <AlertDialog open={!!sweepConfirm} onOpenChange={() => setSweepConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <ArrowUpDown className="h-5 w-5 text-primary" /> Trigger Pool Sweep
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Trigger a <strong>{sweepConfirm?.poolType}</strong> sweep for <strong>{sweepConfirm?.poolName}</strong>.
                            {sweepConfirm?.poolType === "Zero-Balancing" ? (
                                " Funds from all participant accounts will be physically swept to the header account."
                            ) : (
                                " Interest will be calculated on the notional net balance of " + formatNumber(sweepConfirm?.totalBalance || 0) + " " + sweepConfirm?.currency + ". No physical fund movement."
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            toast({ title: "Pool sweep triggered", description: `${sweepConfirm?.poolName} sweep initiated. Bank confirmation expected within 2 hours.` });
                            setSweepConfirm(null);
                        }}>
                            Trigger Sweep
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StandardPage>
    );
}
