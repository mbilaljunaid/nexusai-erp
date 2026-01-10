import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, Loader2, Save, Info, AlertTriangle, Scale, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeCombinationPicker } from "@/components/gl/CodeCombinationPicker";



export default function LedgerControlSetup() {
    const { toast } = useToast();
    const ledgerId = "PRIMARY"; // Hardcoded for now, should come from context
    const [suspenseCCID, setSuspenseCCID] = useState<string>("");
    const [roundingCCID, setRoundingCCID] = useState<string>("");

    const { data: controls, isLoading } = useQuery<any>({
        queryKey: [`/api/gl/config/ledger/${ledgerId}/controls`],
    });

    useEffect(() => {
        if (controls) {
            setSuspenseCCID(controls.suspenseCcid || "");
            setRoundingCCID(controls.roundingCcid || "");
        }
    }, [controls]);

    const upsertMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/gl/config/ledger/controls", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, ledgerId }),
            });
            if (!res.ok) throw new Error("Failed to save controls");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/gl/config/ledger/${ledgerId}/controls`] });
            toast({ title: "Configuration Saved", description: "Ledger-level posting controls have been updated." });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-100 rounded-xl">
                        <Settings className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Ledger Controls</h1>
                        <p className="text-muted-foreground italic">Oracle Foundation: Suspense Posting, Rounding Account, Netting Rules</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Suspense Posting Section */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="flex flex-row items-center gap-4 pb-4 bg-muted/20">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <CardTitle>Suspense Posting</CardTitle>
                                <CardDescription>Allow journals to post even if debits do not equal credits.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base">Enable Suspense Posting</Label>
                                    <p className="text-sm text-muted-foreground">Automatically balance journals using a designated account.</p>
                                </div>
                                <Switch
                                    checked={controls?.allowSuspensePosting}
                                    onCheckedChange={(val) => upsertMutation.mutate({ allowSuspensePosting: val })}
                                />
                            </div>

                            {controls?.allowSuspensePosting && (
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <Label>Suspense Account (CCID)</Label>
                                    <div className="flex gap-4 items-center">
                                        <div className="flex-1">
                                            <CodeCombinationPicker
                                                value={suspenseCCID}
                                                onChange={(val) => setSuspenseCCID(val)}
                                                ledgerId={ledgerId}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Info className="h-3 w-3" /> Imbalances will be posted to this account during the Posting process.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Rounding Rules Section */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="flex flex-row items-center gap-4 pb-4 bg-muted/20">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Scale className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle>Rounding Differences</CardTitle>
                                <CardDescription>Handle currency conversion overflow and precision differences.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <Label>Rounding Account (CCID)</Label>
                            <div className="flex gap-4 items-center">
                                <div className="flex-1">
                                    <CodeCombinationPicker
                                        value={roundingCCID}
                                        onChange={(val) => setRoundingCCID(val)}
                                        ledgerId={ledgerId}
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Info className="h-3 w-3" /> Used to absorb small differences between accounted debits and credits.
                            </p>
                        </CardContent>
                    </Card>

                    <Button
                        size="lg"
                        className="w-full bg-slate-900 hover:bg-slate-800 gap-2 shadow-lg"
                        onClick={() => upsertMutation.mutate({
                            suspenseCcid: suspenseCCID,
                            roundingCcid: roundingCCID
                        })}
                        disabled={upsertMutation.isPending}
                    >
                        {upsertMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Ledger Configuration
                    </Button>
                </div>

                <div className="space-y-6">
                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                Posting Standards
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4 text-slate-600">
                            <p>According to Oracle Fusion standards, every primary ledger must have a designated Rounding Account to ensure accounting data integrity.</p>
                            <div className="p-3 bg-white rounded border border-slate-200">
                                <h4 className="font-bold text-slate-800 mb-1">Mandatory Fields:</h4>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Suspense Account (if enabled)</li>
                                    <li>Rounding Account</li>
                                    <li>Cumulative Translation Account</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-200 bg-amber-50/50">
                        <CardContent className="p-4 flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-amber-900">Caution</h4>
                                <p className="text-xs text-amber-800">
                                    Enabling Suspense Posting is generally discouraged for final tax reporting ledgers as it may obscure reconciliation issues.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
