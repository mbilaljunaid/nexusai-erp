
import { useState, useEffect } from "react";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Plus, Wallet, ArrowUpRight, ArrowDownLeft, Building2, CreditCard, RefreshCw, TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { CashBankAccount } from "@shared/schema";
import { Link } from "wouter";
import { RevaluationDialog } from "./RevaluationDialog";

export function BankAccountList() {
    const { data: accounts, isLoading } = useQuery<CashBankAccount[]>({
        queryKey: ["/api/cash/accounts"]
    });

    const { data: position } = useQuery<{ totalBalance: number }>({
        queryKey: ["/api/cash/position"]
    });

    const [selectedRevalAccount, setSelectedRevalAccount] = useState<{ id: string, name: string, currency: string } | null>(null);

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading accounts...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Liquidity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight">
                            ${position?.totalBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? "0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 text-green-600 flex items-center">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +2.5% from last month
                        </p>
                    </CardContent>
                </Card>
                {/* Future KPI cards for Inflows/Outflows */}
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold tracking-tight">Bank Accounts</h2>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Account
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts?.map(account => (
                    <Card key={account.id} className="relative overflow-hidden group hover:shadow-lg transition-all border-l-4 border-l-primary/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex flex-col">
                                <CardTitle className="text-lg font-bold">{account.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {account.bankName}
                                </CardDescription>
                            </div>
                            <Badge variant={account.active ? "default" : "secondary"}>
                                {account.active ? "Active" : "Inactive"}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4 flex flex-col space-y-1">
                                <span className="text-muted-foreground text-xs uppercase tracking-wider">Available Balance</span>
                                <div className="text-2xl font-bold flex items-baseline">
                                    <span className="text-sm mr-1 text-muted-foreground">{account.currency}</span>
                                    {Number(account.currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <CreditCard className="h-3 w-3" />
                                    •••• {account.accountNumber.slice(-4)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/cash/accounts/${account.id}/reconcile`}>
                                        <Button variant="ghost" size="sm" className="h-7 px-2">
                                            <RefreshCw className="h-3 w-3 mr-1" />
                                            Reconcile
                                        </Button>
                                    </Link>
                                    {account.currency !== 'USD' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-primary"
                                            onClick={() => setSelectedRevalAccount({ id: account.id, name: account.name, currency: account.currency || 'USD' })}
                                        >
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            Revalue
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {selectedRevalAccount && (
                    <RevaluationDialog
                        accountId={selectedRevalAccount.id}
                        accountName={selectedRevalAccount.name}
                        currency={selectedRevalAccount.currency}
                        isOpen={!!selectedRevalAccount}
                        onClose={() => setSelectedRevalAccount(null)}
                    />
                )}

                {/* Empty State Card */}
                {(!accounts || accounts.length === 0) && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        <Wallet className="h-10 w-10 mb-4 opacity-20" />
                        <p>No bank accounts configured.</p>
                        <Button variant="ghost" className="mt-2 text-primary">Setup your first bank account</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
