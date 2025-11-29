import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function OpportunityForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    account: "",
    stage: "lead",
    probability: 25,
    expectedValue: "",
    closeDate: "",
    description: "",
    owner: "",
    products: "",
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
        accountId: formData.account,
        stage: formData.stage,
        probability: formData.probability,
        expectedValue: expectedAmount,
        closeDate: formData.closeDate,
        description: formData.description,
        ownerId: formData.owner,
        products: formData.products
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Opportunity saved successfully" });
      setFormData({ name: "", account: "", stage: "lead", probability: 25, expectedValue: "", closeDate: "", description: "", owner: "", products: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save opportunity", variant: "destructive" });
    }
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Opportunity
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Create and manage sales opportunities</p>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">Account *</Label>
              <Select value={formData.account} onValueChange={(v) => handleChange("account", v)}>
                <SelectTrigger id="account">
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
                <SelectTrigger id="stage">
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
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="close">Close Date *</Label>
            <Input
              id="close"
              type="date"
              value={formData.closeDate}
              onChange={(e) => handleChange("closeDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Sales Owner</Label>
            <Select value={formData.owner} onValueChange={(v) => handleChange("owner", v)}>
              <SelectTrigger id="owner">
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="john">John Sales</SelectItem>
                <SelectItem value="jane">Jane Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="products">Products/Services</Label>
            <Textarea
              id="products"
              placeholder="List products/services included in this opportunity"
              value={formData.products}
              onChange={(e) => handleChange("products", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              placeholder="Additional notes about this opportunity"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-muted p-4 rounded-md">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Expected Value</p>
                <p className="text-lg font-semibold">${expectedAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Probability</p>
                <Badge>{formData.probability}%</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Weighted Value</p>
                <p className="text-lg font-semibold">${weightedValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "Saving..." : "Save Opportunity"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
