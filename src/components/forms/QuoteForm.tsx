
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Opportunity } from "@shared/schema";

interface QuoteFormProps {
    opportunityId?: string; // If creating from opp
}

export function QuoteForm({ opportunityId }: QuoteFormProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // If quote is created from Opp, we want to auto-fill name
    const { data: opportunities = [] } = useQuery<Opportunity[]>({
        queryKey: ["/api/crm/opportunities"],
        enabled: !!opportunityId
    });

    const linkedOpp = opportunities.find(o => o.id === opportunityId);

    const [formData, setFormData] = useState({
        name: "",
        status: "Draft",
        expirationDate: "",
        description: "",
    });

    useEffect(() => {
        if (linkedOpp) {
            setFormData(prev => ({
                ...prev,
                name: `Quote for ${linkedOpp.name}`,
            }));
        }
    }, [linkedOpp]);


    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const submitMutation = useMutation({
        mutationFn: async () => {
            const payload: any = {
                name: formData.name,
                status: formData.status,
                description: formData.description,
            };
            if (formData.expirationDate) payload.expirationDate = new Date(formData.expirationDate).toISOString();
            if (opportunityId) payload.opportunityId = opportunityId;

            const newQuote = await apiRequest("POST", "/api/crm/quotes", payload) as any;

            // Auto-sync items if from Opp
            if (opportunityId && newQuote.id) {
                await apiRequest("POST", `/api/crm/quotes/${newQuote.id}/sync-opportunity`, { opportunityId });
            }
            return newQuote;
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Quote created successfully" });
            queryClient.invalidateQueries({ queryKey: ["/api/crm/quotes"] });
            setFormData({
                name: "",
                status: "Draft",
                expirationDate: "",
                description: "",
            });
        },
        onError: (err) => {
            console.error(err);
            toast({ title: "Error", description: "Failed to create quote", variant: "destructive" });
        }
    });

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    New Quote
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Create a formal quote for your customer</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Quote Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Quote Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="e.g. Q4 Software Licensing"
                            />
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
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Presented">Presented</SelectItem>
                                    <SelectItem value="Accepted">Accepted</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expirationDate">Expiration Date</Label>
                            <Input
                                id="expirationDate"
                                type="date"
                                value={formData.expirationDate}
                                onChange={(e) => handleChange("expirationDate", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder="Terms and conditions, or notes..."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={() => submitMutation.mutate()}
                            disabled={submitMutation.isPending || !formData.name}
                        >
                            {submitMutation.isPending ? "Creating..." : "Create Quote"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
