import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, TrendingUp, Plus } from "lucide-react";

export function BudgetEntryForm() {
  const [quickTab, setQuickTab] = useState("quick");
  const [budgetCycle, setBudgetCycle] = useState("");
  const [department, setDepartment] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState({
    jan: "", feb: "", mar: "", apr: "", may: "", jun: "",
    jul: "", aug: "", sep: "", oct: "", nov: "", dec: ""
  });
  const [showAISuggestion, setShowAISuggestion] = useState(false);

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
        <p className="text-sm text-muted-foreground mt-1">Create and manage budget allocations by department and cost center</p>
      </div>

      <Tabs value={quickTab} onValueChange={setQuickTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="quick">Quick Entry</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-6">
          {/* Header Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cycle">Budget Cycle *</Label>
                  <Select value={budgetCycle} onValueChange={setBudgetCycle}>
                    <SelectTrigger id="cycle">
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
                    <SelectTrigger id="dept">
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
                    <SelectTrigger id="cc">
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

              <div className="flex gap-2 pt-2">
                <Badge variant="secondary">Version 1</Badge>
                <Badge variant="outline">Status: Draft</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Columns Info */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <Card>
              <CardContent className="p-3">
                <p className="text-muted-foreground">Last Year Actual</p>
                <p className="font-semibold text-lg">$245,000</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-muted-foreground">Current YTD Actual</p>
                <p className="font-semibold text-lg">$182,500</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-muted-foreground">Budget vs Actual %</p>
                <p className="font-semibold text-lg">-15.3%</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Suggestion */}
          {showAISuggestion && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-900 dark:text-blue-100 ml-2">
                <strong>AI Suggestion:</strong> Based on 5% historical growth trend, recommend monthly allocation of <code className="bg-white dark:bg-slate-900 px-1 rounded text-blue-700 dark:text-blue-300 font-mono">$20,417</code> per month.
              </AlertDescription>
            </Alert>
          )}

          {/* Monthly Budget Grid */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Monthly Allocation</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAISuggestion(!showAISuggestion)}
                  className="gap-1"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Suggest
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {months.map((month, idx) => (
                  <div key={month} className="space-y-1">
                    <Label htmlFor={`month-${month}`} className="text-xs">{monthLabels[idx]}</Label>
                    <Input
                      id={`month-${month}`}
                      type="number"
                      placeholder="0"
                      value={monthlyBudget[month as keyof typeof monthlyBudget]}
                      onChange={(e) => setMonthlyBudget({
                        ...monthlyBudget,
                        [month]: e.target.value
                      })}
                      className="text-sm h-9"
                    />
                  </div>
                ))}
              </div>

              {/* Totals Row */}
              <div className="border-t pt-4 grid grid-cols-3 md:grid-cols-6 gap-3">
                {months.map((month, idx) => {
                  const val = parseFloat(monthlyBudget[month as keyof typeof monthlyBudget]) || 0;
                  return (
                    <div key={`total-${month}`} className="text-xs">
                      <p className="text-muted-foreground text-xs mb-1">Subtotal</p>
                      <p className="font-semibold text-sm">${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    </div>
                  );
                })}
              </div>

              {/* Annual Total */}
              <div className="bg-muted p-4 rounded-md border-2 border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Annual Total</p>
                <p className="text-2xl font-bold font-mono">${calculateTotal()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes & Assumptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="narrative">Budget Narrative</Label>
                <Textarea
                  id="narrative"
                  placeholder="Enter key assumptions and business drivers for this budget..."
                  className="min-h-24 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Save Draft
            </Button>
            <Button variant="outline">Request Review</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-sm">Advanced features include detailed project allocation, multi-level breakdowns, and cross-department cost center assignments.</p>
              <p className="text-muted-foreground text-sm mt-2">Coming soon in advanced view...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Right Sidebar Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Budget Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-semibold">65%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Approvers Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">Awaiting approval from:</p>
            <Badge variant="outline">Finance Manager</Badge>
            <Badge variant="outline">CFO</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Deadline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-semibold">2 days remaining</p>
            <p className="text-muted-foreground text-xs">Due: Dec 15, 2024</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
