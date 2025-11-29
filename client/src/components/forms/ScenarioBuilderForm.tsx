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
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Sparkles, AlertCircle } from "lucide-react";

export function ScenarioBuilderForm() {
  const [scenarioName, setScenarioName] = useState("20% Revenue Decline");
  const [adjustmentType, setAdjustmentType] = useState("percentage");
  const [revenueAdj, setRevenueAdj] = useState(-20);
  const [cogsAdj, setCOGSAdj] = useState(-12);
  const [opexAdj, setOpexAdj] = useState(5);
  const [taxAdj, setTaxAdj] = useState(0);

  // Base case data
  const baseCase = {
    revenue: 1000,
    cogs: 600,
    grossProfit: 400,
    opex: 250,
    ebitda: 150,
    netIncome: 120
  };

  // Calculate scenario
  const scenario = {
    revenue: baseCase.revenue * (1 + revenueAdj / 100),
    cogs: baseCase.cogs * (1 + cogsAdj / 100),
    grossProfit: 0,
    opex: baseCase.opex * (1 + opexAdj / 100),
    ebitda: 0,
    netIncome: 0
  };
  
  scenario.grossProfit = scenario.revenue - scenario.cogs;
  scenario.ebitda = scenario.grossProfit - scenario.opex;
  scenario.netIncome = scenario.ebitda * (1 + taxAdj / 100);

  const impactData = [
    { metric: "Revenue", base: baseCase.revenue, scenario: scenario.revenue },
    { metric: "Gross Profit", base: baseCase.grossProfit, scenario: scenario.grossProfit },
    { metric: "EBITDA", base: baseCase.ebitda, scenario: scenario.ebitda },
    { metric: "Net Income", base: baseCase.netIncome, scenario: scenario.netIncome }
  ];

  const sensData = [
    { revenueChange: -20, impact: -28 },
    { revenueChange: -10, impact: -14 },
    { revenueChange: 0, impact: 0 },
    { revenueChange: 10, impact: 14 },
    { revenueChange: 20, impact: 28 }
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-semibold">Scenario Modeling</h2>
        <p className="text-sm text-muted-foreground mt-1">Build and analyze financial scenarios with what-if analysis</p>
      </div>

      <Tabs defaultValue="builder" className="space-y-4">
        <TabsList>
          <TabsTrigger value="builder">Scenario Builder</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensitivity Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          {/* Scenario Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scenario Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Scenario Name</Label>
                  <Input
                    id="name"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    placeholder="e.g., 20% Revenue Decline"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base">Base Scenario</Label>
                  <Select defaultValue="approved-budget">
                    <SelectTrigger id="base" className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved-budget">FY2024 Approved Budget</SelectItem>
                      <SelectItem value="last-year">Last Year Actual</SelectItem>
                      <SelectItem value="forecast">Current Forecast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  placeholder="Describe the scenario context and assumptions..."
                  className="min-h-20 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* What-If Sliders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                What-If Analysis
                <Badge variant="secondary" className="ml-auto">Interactive Sliders</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Revenue Adjustment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Revenue Adjustment</Label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{revenueAdj > 0 ? '+' : ''}{revenueAdj}%</span>
                    <span className="text-xs text-muted-foreground font-mono">${(scenario.revenue).toFixed(0)}K</span>
                  </div>
                </div>
                <Slider
                  value={[revenueAdj]}
                  onValueChange={(val) => setRevenueAdj(val[0])}
                  min={-50}
                  max={50}
                  step={5}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground">Range: -50% to +50%</div>
              </div>

              {/* COGS Adjustment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">COGS Adjustment</Label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{cogsAdj > 0 ? '+' : ''}{cogsAdj}%</span>
                    <span className="text-xs text-muted-foreground font-mono">${(scenario.cogs).toFixed(0)}K</span>
                  </div>
                </div>
                <Slider
                  value={[cogsAdj]}
                  onValueChange={(val) => setCOGSAdj(val[0])}
                  min={-30}
                  max={30}
                  step={2}
                  className="w-full"
                />
              </div>

              {/* OpEx Adjustment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">OpEx Adjustment</Label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{opexAdj > 0 ? '+' : ''}{opexAdj}%</span>
                    <span className="text-xs text-muted-foreground font-mono">${(scenario.opex).toFixed(0)}K</span>
                  </div>
                </div>
                <Slider
                  value={[opexAdj]}
                  onValueChange={(val) => setOpexAdj(val[0])}
                  min={-20}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Tax Adjustment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Tax Rate Adjustment</Label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{taxAdj > 0 ? '+' : ''}{taxAdj}%</span>
                  </div>
                </div>
                <Slider
                  value={[taxAdj]}
                  onValueChange={(val) => setTaxAdj(val[0])}
                  min={-10}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Driver Rules (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Driver-Based Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Create proportional relationships between metrics (e.g., if revenue +10%, then COGS adjusts +6%)</p>
              <Button variant="outline" size="sm" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Add Driver Rule
              </Button>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
            <CardContent className="p-4 flex gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  If this scenario executes, profit margin drops to {((scenario.ebitda / scenario.revenue) * 100).toFixed(1)}% (from {((baseCase.ebitda / baseCase.revenue) * 100).toFixed(1)}%)
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">Consider cost reduction initiatives to mitigate impact.</p>
              </div>
            </CardContent>
          </Card>

          {/* Comparison View */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Base vs Scenario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Revenue", base: baseCase.revenue, scenario: scenario.revenue },
                  { label: "Gross Profit", base: baseCase.grossProfit, scenario: scenario.grossProfit },
                  { label: "EBITDA", base: baseCase.ebitda, scenario: scenario.ebitda },
                  { label: "Net Income", base: baseCase.netIncome, scenario: scenario.netIncome }
                ].map((item) => {
                  const change = ((item.scenario - item.base) / item.base * 100);
                  return (
                    <div key={item.label} className="p-3 border rounded-lg space-y-2">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <div className="space-y-1">
                        <p className="text-xs"><span className="text-muted-foreground">Base:</span> <span className="font-mono font-semibold">${item.base.toFixed(0)}K</span></p>
                        <p className="text-xs"><span className="text-muted-foreground">Scenario:</span> <span className="font-mono font-semibold">${item.scenario.toFixed(0)}K</span></p>
                      </div>
                      <div className={`text-xs font-semibold ${change < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button className="gap-1">
              <Sparkles className="h-4 w-4" />
              Run Sensitivity
            </Button>
            <Button variant="outline">Compare Scenarios</Button>
            <Button variant="outline">Save as Scenario</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">KPI Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={impactData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="base" fill="#3b82f6" name="Base Case" />
                  <Bar dataKey="scenario" fill="#ef4444" name={scenarioName} />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="font-mono font-semibold">${scenario.revenue.toFixed(0)}K</p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {((scenario.revenue - baseCase.revenue) / baseCase.revenue * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">Gross Profit</p>
                    <p className="font-mono font-semibold">${scenario.grossProfit.toFixed(0)}K</p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {((scenario.grossProfit - baseCase.grossProfit) / baseCase.grossProfit * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">EBITDA</p>
                    <p className="font-mono font-semibold">${scenario.ebitda.toFixed(0)}K</p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {((scenario.ebitda - baseCase.ebitda) / baseCase.ebitda * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">Net Income</p>
                    <p className="font-mono font-semibold">${scenario.netIncome.toFixed(0)}K</p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {((scenario.netIncome - baseCase.netIncome) / baseCase.netIncome * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Waterfall Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon: Waterfall chart showing impact breakdown by component</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensitivity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sensitivity Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">For every 1% revenue change, operating income changes 2.5%</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sensData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="revenueChange" label={{ value: "Revenue Change (%)", position: "insideBottom", offset: -10 }} />
                  <YAxis label={{ value: "Operating Income Impact (%)", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="impact" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm">Export for Board Presentation</Button>
        <Button variant="outline" size="sm">Share Analysis</Button>
      </div>
    </div>
  );
}
