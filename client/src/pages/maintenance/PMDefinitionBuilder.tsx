
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Repeat, Search, Save, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function PMDefinitionBuilder() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [, setLocation] = useLocation();

    // Form State
    const [pmType, setPmType] = useState<"TIME" | "METER">("TIME");
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        assetId: "",
        workDefinitionId: "",
        frequency: 1,
        frequencyUom: "MONTH",
        meterInterval: 0,
        isFloating: false
    });

    // 1. Fetch Assets
    const { data: assets } = useQuery({
        queryKey: ["/api/maintenance/assets"],
        queryFn: () => fetch("/api/maintenance/assets").then(r => r.json())
    });

    // 2. Fetch Work Definitions (Templates)
    const { data: templates } = useQuery({
        queryKey: ["/api/maintenance/library/definitions"],
        queryFn: () => fetch("/api/maintenance/library/definitions").then(r => r.json())
    });

    // 3. Create Mutation
    const createPMMutation = useMutation({
        mutationFn: async (data: any) => {
            const payload = {
                ...data,
                triggerType: pmType,
                // Clean payload based on type
                frequency: pmType === 'TIME' ? data.frequency : null,
                frequencyUom: pmType === 'TIME' ? data.frequencyUom : null,
                intervalValue: pmType === 'METER' ? data.meterInterval : null
            };

            const res = await fetch("/api/maintenance/pm-definitions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "PM Schedule created." });
            setLocation("/maintenance/pm"); // Redirect back to PM Manager
        },
        onError: (err) => {
            toast({ title: "Error", description: "Failed to create PM.", variant: "destructive" });
        }
    });

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => setLocation("/maintenance/pm")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Preventive Maintenance Plan</h1>
                    <p className="text-muted-foreground">Define recurring maintenance logic for assets.</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>1. General Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Plan Name</Label>
                                <Input
                                    placeholder="e.g. Monthly HVAC Service"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Input
                                    placeholder="Brief description of the maintenance plan"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Target */}
                    <Card>
                        <CardHeader>
                            <CardTitle>2. Asset & Work Template</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Asset</Label>
                                    <Select onValueChange={v => setFormData({ ...formData, assetId: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select Asset" /></SelectTrigger>
                                        <SelectContent>
                                            {assets?.map((a: any) => (
                                                <SelectItem key={a.id} value={a.id}>{a.assetNumber} - {a.description}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Work Definition (Template)</Label>
                                    <Select onValueChange={v => setFormData({ ...formData, workDefinitionId: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select Template" /></SelectTrigger>
                                        <SelectContent>
                                            {templates?.map((t: any) => (
                                                <SelectItem key={t.id} value={t.id}>{t.name} (v{t.version})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Scheduling Logic */}
                    <Card>
                        <CardHeader>
                            <CardTitle>3. Scheduling Logic</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <RadioGroup
                                defaultValue="TIME"
                                className="flex gap-6"
                                onValueChange={(v: any) => setPmType(v)}
                            >
                                <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 w-full">
                                    <RadioGroupItem value="TIME" id="r1" />
                                    <Label htmlFor="r1" className="cursor-pointer flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> Time Based
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 w-full">
                                    <RadioGroupItem value="METER" id="r2" />
                                    <Label htmlFor="r2" className="cursor-pointer flex items-center gap-2">
                                        <Repeat className="h-4 w-4" /> Meter Based
                                    </Label>
                                </div>
                            </RadioGroup>

                            {pmType === 'TIME' && (
                                <div className="p-4 bg-muted/20 rounded-lg space-y-4 border">
                                    <div className="flex items-end gap-4">
                                        <div className="grid gap-2 flex-1">
                                            <Label>Frequency</Label>
                                            <Input
                                                type="number"
                                                value={formData.frequency}
                                                onChange={e => setFormData({ ...formData, frequency: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="grid gap-2 flex-1">
                                            <Label>Unit</Label>
                                            <Select
                                                defaultValue="MONTH"
                                                onValueChange={v => setFormData({ ...formData, frequencyUom: v })}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="DAY">Days</SelectItem>
                                                    <SelectItem value="WEEK">Weeks</SelectItem>
                                                    <SelectItem value="MONTH">Months</SelectItem>
                                                    <SelectItem value="YEAR">Years</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="float"
                                            aria-label="Floating Schedule"
                                            checked={formData.isFloating}
                                            onChange={e => setFormData({ ...formData, isFloating: e.target.checked })}
                                        />
                                        <Label htmlFor="float">Floating (Next Due calculated from Last Completion, not scheduled date)</Label>
                                    </div>
                                </div>
                            )}

                            {pmType === 'METER' && (
                                <div className="p-4 bg-muted/20 rounded-lg space-y-4 border">
                                    <div className="grid gap-2">
                                        <Label>Trigger Every (Interval)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                placeholder="1000"
                                                value={formData.meterInterval}
                                                onChange={e => setFormData({ ...formData, meterInterval: parseInt(e.target.value) })}
                                            />
                                            <span className="text-muted-foreground text-sm font-medium">Units (km/hours/cycles)</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </CardContent>
                    </Card>
                </div>

                {/* Summary / Actions */}
                <div className="col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader><CardTitle>Review</CardTitle></CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Type:</span>
                                <span className="font-semibold">{pmType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Asset:</span>
                                <span className="font-semibold">{formData.assetId ? "Selected" : "Pending"}</span>
                            </div>
                            <div className="bg-primary/10 text-primary p-3 rounded text-center font-medium">
                                {pmType === 'TIME' ? `Every ${formData.frequency} ${formData.frequencyUom}(s)` : `Every ${formData.meterInterval} Units`}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={() => createPMMutation.mutate(formData)}
                                disabled={!formData.name || !formData.assetId || !formData.workDefinitionId || createPMMutation.isPending}
                            >
                                {createPMMutation.isPending ? "Saving..." : "Create Plan"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
