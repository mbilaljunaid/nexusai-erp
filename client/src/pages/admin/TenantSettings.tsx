
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

export default function TenantSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch current tenant settings
    const { data: tenant = {}, isLoading } = useQuery({
        queryKey: ["/api/tenant/current"],
        queryFn: async () => {
            const res = await fetch("/api/tenant/current");
            if (!res.ok) throw new Error("Failed to fetch tenant");
            return res.json();
        }
    });

    const settings = tenant.settings || {};

    // Mutation to update settings
    const updateSettingsMutation = useMutation({
        mutationFn: async (newSettings: any) => {
            const res = await fetch(`/api/tenant/${tenant.id}/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSettings),
            });
            if (!res.ok) throw new Error("Failed to update settings");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/tenant/current"] });
            toast({ title: "Settings Updated", description: "Tenant configuration saved." });
        },
        onError: () => {
            toast({ variant: "destructive", title: "Update Failed", description: "Could not save settings." });
        }
    });

    const handleToggle = (key: string, value: boolean) => {
        updateSettingsMutation.mutate({ ...settings, [key]: value });
    };

    const handleExport = () => {
        window.location.href = "/api/tenant/export";
    };

    if (isLoading) return <div>Loading settings...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Tenant Settings</h1>
                <Button onClick={handleExport} variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Feature Flags</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="enable-ai">Enable AI Copilot</Label>
                            <Switch
                                id="enable-ai"
                                checked={settings.enable_ai !== false}
                                onCheckedChange={(c) => handleToggle('enable_ai', c)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="enable-crm">Enable CRM Module</Label>
                            <Switch
                                id="enable-crm"
                                checked={settings.enable_crm !== false}
                                onCheckedChange={(c) => handleToggle('enable_crm', c)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="enable-maint">Enable Maintenance Module</Label>
                            <Switch
                                id="enable-maint"
                                checked={settings.enable_maintenance !== false}
                                onCheckedChange={(c) => handleToggle('enable_maintenance', c)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Tenant Profile</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <p><span className="font-semibold">Name:</span> {tenant.name}</p>
                        <p><span className="font-semibold">Slug:</span> {tenant.slug}</p>
                        <p><span className="font-semibold">ID:</span> {tenant.id}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
