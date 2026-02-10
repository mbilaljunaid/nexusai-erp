import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CashBankAccount } from "@shared/schema";
import { Wallet, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";

interface AccountSummaryCardsProps {
    account: CashBankAccount;
}

export function AccountSummaryCards({ account }: AccountSummaryCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ledger Balance</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: account.currency || 'USD' }).format(Number(account.currentBalance))}
                    </div>
                    <p className="text-xs text-muted-foreground">Internal books balance</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bank Balance</CardTitle>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        --
                    </div>
                    <p className="text-xs text-muted-foreground">Last statement closing balance</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reconciled</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">--</div>
                    <p className="text-xs text-muted-foreground">Items matched this period</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unreconciled</CardTitle>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-600">--</div>
                    <p className="text-xs text-muted-foreground">Items requiring attention</p>
                </CardContent>
            </Card>
        </div>
    );
}
