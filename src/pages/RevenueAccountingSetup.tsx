
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Save } from "lucide-react";

export default function RevenueAccountingSetup() {
    const { toast } = useToast();
    const [ledgerId, setLedgerId] = useState("PRIMARY");

    const { data: configs, isLoading } = useQuery({
        queryKey: ["revenueAccountingConfig"],
        queryFn: async () => {
            const res = await fetch("/api/revenue/config/accounting");
            if (!res.ok) throw new Error("Failed to fetch config");
            return res.json();
        }
    });

    const activeConfig = configs?.find((c: any) => c.ledgerId === ledgerId) || {
        revenueAccountCCID: "",
        deferredRevenueAccountCCID: "",
        contractAssetAccountCCID: "",
        clearingAccountCCID: ""
    };

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/revenue/config/accounting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ledgerId, ...data })
            });
            if (!res.ok) throw new Error("Failed to save");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Setup Saved", description: "Revenue accounting rules updated." });
            queryClient.invalidateQueries({ queryKey: ["revenueAccountingConfig"] });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            revenueAccountCCID: formData.get("revAcc"),
            deferredRevenueAccountCCID: formData.get("defAcc"),
            contractAssetAccountCCID: formData.get("assetAcc"),
            clearingAccountCCID: formData.get("clearAcc")
        };
        saveMutation.mutate(data);
    };

    if (isLoading) return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Revenue Accounting Setup</h1>
                    <p className="text-muted-foreground mt-1">Configure Subledger Accounting (SLA) rules for Revenue Management.</p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Default Accounts
                    </CardTitle>
                    <CardDescription>
                        Set the default General Ledger account code combinations for this ledger.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="revAcc">Revenue Account (CCID)</Label>
                                <Input id="revAcc" name="revAcc" defaultValue={activeConfig.revenueAccountCCID} placeholder="e.g. 4000-000-000" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="defAcc">Deferred Revenue (CCID)</Label>
                                <Input id="defAcc" name="defAcc" defaultValue={activeConfig.deferredRevenueAccountCCID} placeholder="e.g. 2000-000-000" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="assetAcc">Contract Asset (CCID)</Label>
                                <Input id="assetAcc" name="assetAcc" defaultValue={activeConfig.contractAssetAccountCCID} placeholder="e.g. 1500-000-000" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="clearAcc">Clearing Account (CCID)</Label>
                                <Input id="clearAcc" name="clearAcc" defaultValue={activeConfig.clearingAccountCCID} placeholder="e.g. 1900-000-000" />
                            </div>
                        </div>

                        <Button type="submit" disabled={saveMutation.isPending} className="mt-4">
                            {saveMutation.isPending ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Configuration</>}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
