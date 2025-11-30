import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function OpportunityForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    accountId: "",
    stage: "lead",
    probability: 25,
    expectedValue: "",
    closeDate: "",
    description: "",
    ownerId: "",
    products: "",
    status: "open",
  });

  const stages = [
    { value: "lead", label: "Lead" },
    { value: "qualified", label: "Qualified" },
    { value: "proposal", label: "Proposal" },
    { value: "negotiation", label: "Negotiation" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
  ];

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const expectedAmount = parseFloat(formData.expectedValue) || 0;
  const weightedValue = expectedAmount * (formData.probability / 100);

  const submitMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/crm/opportunities", {
        name: formData.name,
        accountId: formData.accountId,
        stage: formData.stage,
        probability: formData.probability,
        expectedValue: expectedAmount,
        closeDate: formData.closeDate,
        description: formData.description,
        ownerId: formData.ownerId,
        products: formData.products,
        status: formData.status,
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Opportunity created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/opportunities"] });
      setFormData({
        name: "",
        accountId: "",
        stage: "lead",
        probability: 25,
        expectedValue: "",
        closeDate: "",
        description: "",
        ownerId: "",
        products: "",
        status: "open",
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create opportunity", variant: "destructive" });
    }
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Sales Opportunity
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Create and manage sales opportunities with probability-weighted forecasting</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Opportunity Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Opportunity Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Enterprise SaaS Deal"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                data-testid="input-opportunity-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">Account *</Label>
              <Select value={formData.accountId} onValueChange={(v) => handleChange("accountId", v)}>
                <SelectTrigger id="account" data-testid="select-account">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acme">Acme Corp</SelectItem>
                  <SelectItem value="techco">TechCo Inc</SelectItem>
                  <SelectItem value="finance">Finance Plus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Stage *</Label>
              <Select value={formData.stage} onValueChange={(v) => handleChange("stage", v)}>
                <SelectTrigger id="stage" data-testid="select-stage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stages.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prob">Win Probability ({formData.probability}%)</Label>
              <Input
                id="prob"
                type="range"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => handleChange("probability", parseInt(e.target.value))}
                data-testid="input-probability"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Expected Value *</Label>
              <Input
                id="value"
                type="number"
                placeholder="0.00"
                value={formData.expectedValue}
                onChange={(e) => handleChange("expectedValue", e.target.value)}
                data-testid="input-expected-value"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Weighted Value:</strong> ${weightedValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="close">Close Date *</Label>
              <Input
                id="close"
                type="date"
                value={formData.closeDate}
                onChange={(e) => handleChange("closeDate", e.target.value)}
                data-testid="input-close-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Sales Owner</Label>
              <Select value={formData.ownerId} onValueChange={(v) => handleChange("ownerId", v)}>
                <SelectTrigger id="owner" data-testid="select-owner">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john">John Sales</SelectItem>
                  <SelectItem value="jane">Jane Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="products">Products/Services</Label>
            <Textarea
              id="products"
              placeholder="List products/services included in this opportunity"
              value={formData.products}
              onChange={(e) => handleChange("products", e.target.value)}
              rows={3}
              data-testid="textarea-products"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional details about this opportunity"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              data-testid="textarea-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
              <SelectTrigger id="status" data-testid="select-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || !formData.name} data-testid="button-save-opportunity">
          {submitMutation.isPending ? "Saving..." : "Save Opportunity"}
        </Button>
        <Button variant="outline" data-testid="button-cancel-opportunity">Cancel</Button>
      </div>
    </div>
  );
}
