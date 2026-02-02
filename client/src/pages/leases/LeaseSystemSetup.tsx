import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function LeaseSystemSetup() {
    const { toast } = useToast();

    // Mock State - In real app, fetch from /api/lease/settings
    const [settings, setSettings] = useState({
        defaultDiscountRate: "0.045",
        lowValueThreshold: "5000",
        shortTermThresholdMonths: "12",
        autoCapitalize: true,
        glAccounts: {
            rouAsset: "15000",
            leaseLiability: "25000",
            interestExpense: "61000",
            amortizationExpense: "62000"
        }
    });

    const handleChange = (field: string, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleGlChange = (field: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            glAccounts: { ...prev.glAccounts, [field]: value }
        }));
    };

    const handleSave = () => {
        // Simulate API Save
        toast({
            title: "Settings Saved",
            description: "System options have been updated successfully.",
        });
    };

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Lease System Setup
                    </h1>
                    <p className="text-muted-foreground mt-1">Configure global IFRS 16 / ASC 842 parameters</p>
                </div>
                <Button onClick={handleSave}>Save Changes</Button>
            </div>

            <Tabs defaultValue="general">
                <TabsList>
                    <TabsTrigger value="general">General Options</TabsTrigger>
                    <TabsTrigger value="accounting">GL Mapping</TabsTrigger>
                    <TabsTrigger value="thresholds">Exemptions</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Calculation Defaults</CardTitle>
                            <CardDescription>Default values applied to new leases</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Default Discount Rate (decimal)</Label>
                                    <Input
                                        type="number" step="0.001"
                                        value={settings.defaultDiscountRate}
                                        onChange={e => handleChange("defaultDiscountRate", e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">e.g. 0.045 for 4.5% Incremental Borrowing Rate</p>
                                </div>
                                <div className="flex items-center justify-between space-x-2 pt-8">
                                    <Label>Auto-Capitalize ROU Assets</Label>
                                    <Switch
                                        checked={settings.autoCapitalize}
                                        onCheckedChange={v => handleChange("autoCapitalize", v)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="accounting">
                    <Card>
                        <CardHeader>
                            <CardTitle>Chart of Accounts Mapping</CardTitle>
                            <CardDescription>Default GL codes for automatic journal entry creation</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>ROU Asset Account</Label>
                                    <Input value={settings.glAccounts.rouAsset} onChange={e => handleGlChange("rouAsset", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Lease Liability Account</Label>
                                    <Input value={settings.glAccounts.leaseLiability} onChange={e => handleGlChange("leaseLiability", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Interest Expense Account</Label>
                                    <Input value={settings.glAccounts.interestExpense} onChange={e => handleGlChange("interestExpense", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Amortization Expense Account</Label>
                                    <Input value={settings.glAccounts.amortizationExpense} onChange={e => handleGlChange("amortizationExpense", e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="thresholds">
                    <Card>
                        <CardHeader>
                            <CardTitle>IFRS 16 / ASC 842 Exemptions</CardTitle>
                            <CardDescription>Configure thresholds for Low Value and Short Term lease exemptions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Low Value Asset Threshold ($)</Label>
                                    <Input
                                        type="number"
                                        value={settings.lowValueThreshold}
                                        onChange={e => handleChange("lowValueThreshold", e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Usually $5,000 USD for IFRS 16</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Short Term Lease Threshold (Months)</Label>
                                    <Input
                                        type="number"
                                        value={settings.shortTermThresholdMonths}
                                        onChange={e => handleChange("shortTermThresholdMonths", e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Usually 12 months</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
