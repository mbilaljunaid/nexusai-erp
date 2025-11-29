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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingDown } from "lucide-react";

export function ForecastSubmissionForm() {
  const [scenarioType, setScenarioType] = useState("base");
  const [confidenceLevel, setConfidenceLevel] = useState("medium");
  const [forecastData, setForecastData] = useState({
    q1: "125000",
    q2: "135000",
    q3: "140000",
    q4: "155000"
  });

  const prevForecast = { q1: 120000, q2: 130000, q3: 138000, q4: 152000 };
  
  const calcVariance = (current: number, prev: number) => {
    return ((current - prev) / prev * 100).toFixed(1);
  };

  const variances = {
    q1: calcVariance(parseFloat(forecastData.q1), prevForecast.q1),
    q2: calcVariance(parseFloat(forecastData.q2), prevForecast.q2),
    q3: calcVariance(parseFloat(forecastData.q3), prevForecast.q3),
    q4: calcVariance(parseFloat(forecastData.q4), prevForecast.q4)
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold">Forecast Submission</h2>
        <p className="text-sm text-muted-foreground mt-1">Submit quarterly revenue and expense forecasts for FY 2025</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Forecast Cycle</p>
            <p className="font-semibold text-sm">Q4 2024</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Department</p>
            <p className="font-semibold text-sm">Sales & Marketing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Submitted by</p>
            <p className="font-semibold text-sm">Sarah Chen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge variant="outline" className="mt-1">Draft</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Forecast Scenario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { value: "optimistic", label: "Optimistic", desc: "Strong market conditions, all initiatives succeed" },
              { value: "base", label: "Base Case", desc: "Normal growth trajectory with expected execution" },
              { value: "conservative", label: "Conservative", desc: "Market challenges, implementation delays" }
            ].map((option) => (
              <label key={option.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors" style={{borderColor: scenarioType === option.value ? 'hsl(var(--primary))' : 'hsl(var(--border))'}}>
                <input
                  type="radio"
                  name="scenario"
                  value={option.value}
                  checked={scenarioType === option.value}
                  onChange={(e) => setScenarioType(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forecast Data Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quarterly Forecast</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {["Q1", "Q2", "Q3", "Q4"].map((quarter, idx) => {
              const key = quarter.toLowerCase() as keyof typeof forecastData;
              const variance = parseFloat(variances[key]);
              const showVarianceWarning = Math.abs(variance) > 5;

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={key} className="font-medium text-sm">{quarter} 2025</Label>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Previous forecast: </span>
                      <span className="font-mono">${prevForecast[key].toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id={key}
                      type="number"
                      placeholder="0"
                      value={forecastData[key]}
                      onChange={(e) => setForecastData({ ...forecastData, [key]: e.target.value })}
                      className="font-mono text-sm"
                    />
                    <div className={`px-3 py-2 rounded text-sm font-semibold min-w-fit ${
                      showVarianceWarning 
                        ? 'bg-orange-100 dark:bg-orange-950 text-orange-900 dark:text-orange-100' 
                        : 'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100'
                    }`}>
                      {variance > 0 ? '+' : ''}{variance}%
                    </div>
                  </div>

                  {/* Variance Explanation (required if >5%) */}
                  {showVarianceWarning && (
                    <div className="space-y-2 ml-3 pl-3 border-l-2 border-orange-400">
                      <p className="text-xs font-medium text-orange-900 dark:text-orange-100">
                        Variance explanation required ({Math.abs(variance)}% change)
                      </p>
                      <Textarea
                        placeholder={`Explain why ${quarter} forecast changed by ${variance}%...`}
                        className="min-h-16 text-sm"
                      />
                      <Select defaultValue="">
                        <SelectTrigger className="w-full text-sm">
                          <SelectValue placeholder="Root cause" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="market">Market change</SelectItem>
                          <SelectItem value="internal">Internal factor</SelectItem>
                          <SelectItem value="timing">Timing adjustment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Confidence Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Confidence Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { value: "high", label: "High", desc: "Strong conviction based on data and commitments" },
              { value: "medium", label: "Medium", desc: "Reasonable confidence with some uncertainty" },
              { value: "low", label: "Low", desc: "Significant uncertainties or market volatility" }
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-muted" style={{borderColor: confidenceLevel === option.value ? 'hsl(var(--primary))' : 'hsl(var(--border))'}}>
                <input
                  type="radio"
                  name="confidence"
                  value={option.value}
                  checked={confidenceLevel === option.value}
                  onChange={(e) => setConfidenceLevel(e.target.value)}
                />
                <div>
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="justification" className="text-sm">Confidence Justification</Label>
            <Textarea
              id="justification"
              placeholder="Explain the basis for your confidence level..."
              className="min-h-20 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Key Drivers & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Key Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Market growth rate, product launches, customer wins..."
              className="min-h-24 text-sm"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Risks & Mitigations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Potential headwinds and your mitigation strategies..."
              className="min-h-24 text-sm"
            />
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
        <CardContent className="p-4 text-sm">
          <p className="font-medium mb-2">Forecast Summary</p>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Q1</p>
              <p className="font-semibold">${(parseFloat(forecastData.q1) || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Q2</p>
              <p className="font-semibold">${(parseFloat(forecastData.q2) || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Q3</p>
              <p className="font-semibold">${(parseFloat(forecastData.q3) || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Q4</p>
              <p className="font-semibold">${(parseFloat(forecastData.q4) || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="border-t border-blue-200 dark:border-blue-900 mt-3 pt-3 font-semibold text-sm">
            <p>Annual Total: ${(parseFloat(forecastData.q1) + parseFloat(forecastData.q2) + parseFloat(forecastData.q3) + parseFloat(forecastData.q4)).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button className="gap-2">Save Draft</Button>
        <Button>Submit</Button>
        <Button variant="outline">Submit & Lock</Button>
        <Button variant="ghost">Cancel</Button>
      </div>
    </div>
  );
}
