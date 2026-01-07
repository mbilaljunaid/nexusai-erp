import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, TrendingUp, Plus, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function BudgetEntryForm() {
  const { toast } = useToast();
  const [quickTab, setQuickTab] = useState("quick");
  const [budgetCycle, setBudgetCycle] = useState("");
  const [department, setDepartment] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState({
    jan: "", feb: "", mar: "", apr: "", may: "", jun: "",
    jul: "", aug: "", sep: "", oct: "", nov: "", dec: ""
  });
  const [showAISuggestion, setShowAISuggestion] = useState(false);

  const handleSaveDraft = async () => {
    if (!budgetCycle || !department || !costCenter) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        budgetCycle,
        department,
        costCenter,
        totalBudget: parseFloat(totalBudget) || 0,
        amounts: monthlyBudget
      };
      
      await api.epm.budgets.create(payload);
      setSuccessMessage("Budget saved successfully!");
      toast({ title: "Success", description: "Budget entry created" });
      
      setBudgetCycle("");
      setDepartment("");
      setCostCenter("");
      setTotalBudget("");
      setMonthlyBudget({
        jan: "", feb: "", mar: "", apr: "", may: "", jun: "",
        jul: "", aug: "", sep: "", oct: "", nov: "", dec: ""
      });
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const calculateTotal = () => {
    return months.reduce((sum, month) => {
      const val = parseFloat(monthlyBudget[month as keyof typeof monthlyBudget]) || 0;
      return sum + val;
    }, 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-semibold">Budget Entry</h2>
        <p className="text-sm text-muted-foreground mt-1">Create and manage budget allocations by department and cost center with monthly breakdowns</p>
      </div>

      <Tabs value={quickTab} onValueChange={setQuickTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="quick">Quick Entry</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cycle">Budget Cycle *</Label>
                  <Select value={budgetCycle} onValueChange={setBudgetCycle}>
                    <SelectTrigger id="cycle" data-testid="select-budget-cycle">
                      <SelectValue placeholder="Select cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fy2024">FY 2024</SelectItem>
                      <SelectItem value="fy2025">FY 2025</SelectItem>
                      <SelectItem value="fy2026">FY 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept">Department *</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger id="dept" data-testid="select-department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales & Marketing</SelectItem>
                      <SelectItem value="ops">Operations</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="it">IT & Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cc">Cost Center *</Label>
                  <Select value={costCenter} onValueChange={setCostCenter}>
                    <SelectTrigger id="cc" data-testid="select-cost-center">
                      <SelectValue placeholder="Select cost center" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cc-001">CC-001: Field Sales</SelectItem>
                      <SelectItem value="cc-002">CC-002: Sales Operations</SelectItem>
                      <SelectItem value="cc-003">CC-003: Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total">Total Budget Amount *</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-sm text-muted-foreground">$</span>
                  <Input
                    id="total"
                    type="number"
                    placeholder="250000"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    className="pl-6"
                    data-testid="input-total-budget"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Badge variant="secondary">Version 1</Badge>
                <Badge variant="outline">Status: Draft</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <Card>
              <CardContent className="p-3">
                <p className="text-muted-foreground">Last Year Actual</p>
                <p className="font-semibold text-lg" data-testid="text-last-year">$245,000</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-muted-foreground">Current YTD Actual</p>
                <p className="font-semibold text-lg" data-testid="text-current-ytd">$182,500</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-muted-foreground">Budget vs Actual %</p>
                <p className="font-semibold text-lg" data-testid="text-variance">-15.3%</p>
              </CardContent>
            </Card>
          </div>

          {showAISuggestion && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900 dark:text-blue-100 ml-2 space-y-1">
                <p><strong>AI Budget Recommendation:</strong></p>
                <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                  <li>Recommended allocation: 15% increase vs last year</li>
                  <li>Peak spending period: Q3 (historically)</li>
                  <li>Cost optimization: Focus on {department} discretionary spend</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowAISuggestion(!showAISuggestion)} className="gap-1" data-testid="button-ai-recommend">
              <Sparkles className="h-4 w-4" />AI Recommend
            </Button>
            <Button onClick={handleSaveDraft} disabled={isLoading} data-testid="button-save-budget">
              {isLoading ? "Saving..." : successMessage ? "Saved!" : "Save Budget"}
            </Button>
            <Button variant="outline" data-testid="button-save-draft">Save Draft</Button>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Monthly Allocation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {months.map((month, idx) => (
                  <div key={month} className="space-y-1">
                    <Label className="text-xs">{monthLabels[idx]}</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={monthlyBudget[month as keyof typeof monthlyBudget]}
                      onChange={(e) => setMonthlyBudget({ ...monthlyBudget, [month]: e.target.value })}
                      className="text-xs"
                      data-testid={`input-budget-${month}`}
                    />
                  </div>
                ))}
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100" data-testid="text-monthly-total">
                  Total: ${calculateTotal()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Advanced Options</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Textarea placeholder="Add notes, assumptions, or additional details..." className="min-h-32" data-testid="textarea-budget-notes" />
              <Button data-testid="button-submit-advanced">Submit for Approval</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {successMessage && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-sm text-green-900 dark:text-green-100 ml-2">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
