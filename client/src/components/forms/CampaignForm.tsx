import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function CampaignForm() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: "",
        type: "Email",
        status: "Planned",
        startDate: "",
        expectedRevenue: "",
        budgetedCost: "",
        description: "",
    });

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const submitMutation = useMutation({
        mutationFn: async () => {
            return apiRequest("POST", "/api/crm/campaigns", {
                name: formData.name,
                type: formData.type,
                status: formData.status,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                expectedRevenue: formData.expectedRevenue ? Number(formData.expectedRevenue) : null,
                budgetedCost: formData.budgetedCost ? Number(formData.budgetedCost) : null,
                description: formData.description,
            });
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Campaign created successfully" });
            queryClient.invalidateQueries({ queryKey: ["/api/crm/campaigns"] });
            setFormData({
                name: "",
                type: "Email",
                status: "Planned",
                startDate: "",
                expectedRevenue: "",
                budgetedCost: "",
                description: "",
            });
        },
        onError: (err) => {
            console.error(err);
            toast({ title: "Error", description: "Failed to create campaign", variant: "destructive" });
        }
    });

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Megaphone className="w-6 h-6" />
                    Marketing Campaign
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Plan and execute marketing campaigns to generate leads</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Campaign Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Campaign Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="e.g. Q4 Webinar Series"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val) => handleChange("type", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Conference">Conference</SelectItem>
                                    <SelectItem value="Webinar">Webinar</SelectItem>
                                    <SelectItem value="Email">Email</SelectItem>
                                    <SelectItem value="Social Media">Social Media</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => handleChange("status", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Planned">Planned</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Aborted">Aborted</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => handleChange("startDate", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expectedRevenue">Expected Revenue ($)</Label>
                            <Input
                                id="expectedRevenue"
                                type="number"
                                value={formData.expectedRevenue}
                                onChange={(e) => handleChange("expectedRevenue", e.target.value)}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="budgetedCost">Budgeted Cost ($)</Label>
                            <Input
                                id="budgetedCost"
                                type="number"
                                value={formData.budgetedCost}
                                onChange={(e) => handleChange("budgetedCost", e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder="Campaign objectives and details..."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={() => submitMutation.mutate()}
                            disabled={submitMutation.isPending || !formData.name}
                        >
                            {submitMutation.isPending ? "Creating..." : "Create Campaign"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
