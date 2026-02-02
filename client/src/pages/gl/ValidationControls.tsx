
import React from "react";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function ValidationControls() {
    const [controls, setControls] = React.useState<any>({});
    const [loading, setLoading] = React.useState(true);
    const ledgerId = "primary-ledger-id"; // Hardcoded for MVP context

    React.useEffect(() => {
        fetch(`/api/gl/ledgers/${ledgerId}/controls`)
            .then(res => res.json())
            .then(data => {
                setControls(data);
                setLoading(false);
            })
            .catch(err => console.error("Failed to load controls", err));
    }, []);

    const updateControl = async (field: string, value: any) => {
        // Optimistic update
        const newControls = { ...controls, [field]: value };
        setControls(newControls);

        try {
            await fetch(`/api/gl/ledgers/${ledgerId}/controls`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newControls)
            });
        } catch (e) {
            console.error("Failed to update control", e);
            // Revert on fail? For MVP, just log.
        }
    };

    if (loading) return <div>Loading controls...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Validation Controls</h1>
                <p className="text-muted-foreground">Manage system-wide enforcement levels for accounting integrity.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Period Enforcement</CardTitle>
                        <CardDescription>Control how the system handles transactions in different period states.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Strict Period Close</Label>
                                <p className="text-sm text-muted-foreground">Reject any entry dated in a 'Closed' period.</p>
                            </div>
                            <Switch
                                checked={controls.enforcePeriodClose ?? true}
                                onCheckedChange={(checked) => updateControl("enforcePeriodClose", checked)}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Future Entry Warning</Label>
                                <p className="text-sm text-muted-foreground">Warn user when entering dates in future periods.</p>
                            </div>
                            <Switch
                                checked={controls.preventFutureEntry ?? false}
                                onCheckedChange={(checked) => updateControl("preventFutureEntry", checked)}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Allow Prior Period Entry</Label>
                                <p className="text-sm text-muted-foreground">If period is Open, allow back-dated entries.</p>
                            </div>
                            <Switch
                                checked={controls.allowPriorPeriodEntry ?? true}
                                onCheckedChange={(checked) => updateControl("allowPriorPeriodEntry", checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Journal Integrity</CardTitle>
                        <CardDescription>Rules for journal sources, suspense accounts, and balancing.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Suspense Posting</Label>
                                <p className="text-sm text-muted-foreground">Automatically balance unbalanced journals to Suspense.</p>
                            </div>
                            <Switch
                                checked={controls.enableSuspense ?? false}
                                onCheckedChange={(checked) => updateControl("enableSuspense", checked)}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Require Approval &gt; $10k</Label>
                                <p className="text-sm text-muted-foreground">Enforce workflow for high-value manual entries.</p>
                            </div>
                            <Switch checked={true} />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Cross-Validation Enforcement</Label>
                                <p className="text-sm text-muted-foreground">Block combinations defined in CVR Manager.</p>
                            </div>
                            <Switch
                                checked={controls.enforceCvr ?? true}
                                onCheckedChange={(checked) => updateControl("enforceCvr", checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Source Control</CardTitle>
                        <CardDescription>Freeze specific journal sources from manual entry.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border p-3 rounded-md">
                                <div>
                                    <p className="font-medium">Subledger Sources (AP, AR)</p>
                                    <p className="text-xs text-muted-foreground">Prevent manual GL adjustment to control accounts.</p>
                                </div>
                                <Button variant="outline" size="sm">Configure</Button>
                            </div>
                            <div className="flex items-center justify-between border p-3 rounded-md">
                                <div>
                                    <p className="font-medium">Frozen Sources</p>
                                    <p className="text-xs text-muted-foreground">Manage list of frozen sources.</p>
                                </div>
                                <Button variant="outline" size="sm">Manage List</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
