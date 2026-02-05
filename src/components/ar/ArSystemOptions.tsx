import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArSystemOptions, InsertArSystemOptions } from "@shared/schema";
import { Loader2, Save } from "lucide-react";

export function ArSystemOptionsComponent() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [ledgerId, setLedgerId] = useState("123e4567-e89b-12d3-a456-426614174000"); // Hardcoded for Phase 1 demo

    const { data: options, isLoading } = useQuery<ArSystemOptions>({
        queryKey: ["/api/ar/system-options", ledgerId],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/ar/system-options/${ledgerId}`);
            if (res.status === 404) return null;
            return res.json();
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: InsertArSystemOptions) => {
            const res = await apiRequest("POST", "/api/ar/system-options", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ar/system-options", ledgerId] });
            toast({ title: "Success", description: "System options updated successfully" });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const [formData, setFormData] = useState<Partial<InsertArSystemOptions>>({
        ledgerId: "123e4567-e89b-12d3-a456-426614174000",
        accountingMethod: "Accrual",
        taxMethod: "Standard",
        allowOverapplication: false,
        defaultCreditLimit: "0"
    });

    useEffect(() => {
        if (options) {
            setFormData({
                ledgerId: options.ledgerId,
                orgId: options.orgId,
                accountingMethod: options.accountingMethod || "Accrual",
                taxMethod: options.taxMethod || "Standard",
                allowOverapplication: options.allowOverapplication || false,
                defaultCreditLimit: options.defaultCreditLimit || "0",
                autoInvoiceBatchSource: options.autoInvoiceBatchSource,
                realizedGainsAccount: options.realizedGainsAccount,
                realizedLossesAccount: options.realizedLossesAccount,
                unallocatedRevenueAccount: options.unallocatedRevenueAccount
            });
        }
    }, [options]);

    const handleSave = () => {
        mutation.mutate(formData as InsertArSystemOptions);
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>AR System Options</CardTitle>
                <CardDescription>Configure global settings for Accounts Receivable</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Ledger</Label>
                        <Select value={formData.ledgerId} disabled>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Ledger" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="123e4567-e89b-12d3-a456-426614174000">Primary Ledger (US)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Operating Unit (Org)</Label>
                        <Input
                            value={formData.orgId || ""}
                            onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
                            placeholder="e.g. US Ops"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Accounting Method</Label>
                        <Select
                            value={formData.accountingMethod || "Accrual"}
                            onValueChange={(val) => setFormData({ ...formData, accountingMethod: val })}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Accrual">Accrual</SelectItem>
                                <SelectItem value="Cash">Cash Basis</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Tax Method</Label>
                        <Select
                            value={formData.taxMethod || "Standard"}
                            onValueChange={(val) => setFormData({ ...formData, taxMethod: val })}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Standard">Standard (Manual)</SelectItem>
                                <SelectItem value="Vertex">Vertex Integration</SelectItem>
                                <SelectItem value="Avalara">Avalara Integration</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>AutoInvoice Batch Source</Label>
                        <Input
                            value={formData.autoInvoiceBatchSource || ""}
                            onChange={(e) => setFormData({ ...formData, autoInvoiceBatchSource: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Default Credit Limit</Label>
                        <Input
                            type="number"
                            value={formData.defaultCreditLimit || "0"}
                            onChange={(e) => setFormData({ ...formData, defaultCreditLimit: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        checked={formData.allowOverapplication || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, allowOverapplication: checked })}
                    />
                    <Label>Allow Overapplication</Label>
                </div>

                <div className="space-y-4 border-t pt-4">
                    <h3 className="text-sm font-medium">Accounting Distribution Defaults</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Realized Gains Account</Label>
                            <Input
                                value={formData.realizedGainsAccount || ""}
                                onChange={(e) => setFormData({ ...formData, realizedGainsAccount: e.target.value })}
                                placeholder="000.000.0000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Realized Losses Account</Label>
                            <Input
                                value={formData.realizedLossesAccount || ""}
                                onChange={(e) => setFormData({ ...formData, realizedLossesAccount: e.target.value })}
                                placeholder="000.000.0000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Unallocated Revenue Account</Label>
                            <Input
                                value={formData.unallocatedRevenueAccount || ""}
                                onChange={(e) => setFormData({ ...formData, unallocatedRevenueAccount: e.target.value })}
                                placeholder="000.000.0000"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" /> Save Configuration
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default ArSystemOptionsComponent;
