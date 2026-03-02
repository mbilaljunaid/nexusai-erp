import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Mail, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

export default function DunningConfiguration() {
    const { businessUnitId } = useEnterpriseStore();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [strategyName, setStrategyName] = useState("");
    const [levels, setLevels] = useState<any[]>([
        { daysOverdue: 7, action: "EMAIL", template: "Reminder 1" },
        { daysOverdue: 14, action: "EMAIL", template: "Reminder 2" },
        { daysOverdue: 30, action: "SUSPEND_SERVICES", template: "Final Notice" },
    ]);

    const { data: campaigns } = useQuery({
        queryKey: ["/api/billing/dunning-campaigns", businessUnitId],
        queryFn: async () => {
            const res = await fetch("/api/billing/dunning-campaigns", {
                headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined,
            });
            if (!res.ok) throw new Error("Failed to fetch campaigns");
            return res.json();
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/billing/dunning-campaigns", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(businessUnitId ? { "x-business-unit-id": businessUnitId } : {}),
                },
                body: JSON.stringify({ ...data, entBusinessUnitId: businessUnitId }),
            });
            if (!res.ok) throw new Error("Failed to save strategy");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Dunning strategy saved" });
            queryClient.invalidateQueries({ queryKey: ["/api/billing/dunning-campaigns"] });
        },
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dunning Configuration</h1>
                <p className="text-muted-foreground">Automated collections and payment reminders</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Dunning Strategy</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Strategy Name</label>
                            <Input
                                value={strategyName}
                                onChange={(e) => setStrategyName(e.target.value)}
                                placeholder="e.g., Standard 30-day"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">Dunning Levels</h3>
                            <div className="space-y-3">
                                {levels.map((level, i) => (
                                    <div key={i} className="border rounded-lg p-3">
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-xs">Days Overdue</label>
                                                <Input
                                                    type="number"
                                                    value={level.daysOverdue}
                                                    onChange={(e) => {
                                                        const newLevels = [...levels];
                                                        newLevels[i].daysOverdue = parseInt(e.target.value);
                                                        setLevels(newLevels);
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs">Action</label>
                                                <Select
                                                    value={level.action}
                                                    onValueChange={(value) => {
                                                        const newLevels = [...levels];
                                                        newLevels[i].action = value;
                                                        setLevels(newLevels);
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="EMAIL">Send Email</SelectItem>
                                                        <SelectItem value="SMS">Send SMS</SelectItem>
                                                        <SelectItem value="CALL">Automatic Call</SelectItem>
                                                        <SelectItem value="SUSPEND_SERVICES">Suspend Services</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className="text-xs">Template</label>
                                                <Input value={level.template} readOnly />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => saveMutation.mutate({ name: strategyName, levels })}
                            disabled={!strategyName || saveMutation.isPending}
                        >
                            Save Strategy
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Campaigns</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {campaigns?.map((campaign: any) => (
                            <div key={campaign.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-medium">{campaign.name}</div>
                                    <Badge>{campaign.status}</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Active customers: {campaign.customerCount}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Recovery rate: {campaign.recoveryRate}%
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <Button size="sm">
                                        <Play className="h-3 w-3 mr-1" />
                                        Run Now
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
