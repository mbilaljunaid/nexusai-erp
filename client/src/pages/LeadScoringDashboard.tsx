import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function LeadScoringDashboard() {
  const scoreDistribution = [
    { range: "0-20", count: 45 },
    { range: "21-40", count: 32 },
    { range: "41-60", count: 28 },
    { range: "61-80", count: 18 },
    { range: "81-100", count: 12 },
  ];

  const scoreFactors = [
    { factor: "Email Engagement", weight: 25, impact: "High" },
    { factor: "Website Activity", weight: 20, impact: "High" },
    { factor: "Company Size", weight: 15, impact: "Medium" },
    { factor: "Industry Match", weight: 20, impact: "High" },
    { factor: "Job Title", weight: 20, impact: "Medium" },
  ];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lead Scoring Dashboard</h1>
        <p className="text-muted-foreground mt-1">AI-powered lead scoring model and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Leads</p>
            <p className="text-3xl font-bold mt-1">135</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">High Quality (80+)</p>
            <p className="text-3xl font-bold mt-1">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Average Score</p>
            <p className="text-3xl font-bold mt-1">52.3</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Score Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Scoring Factors</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {scoreFactors.map((factor) => (
              <div key={factor.factor} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm font-medium">{factor.factor}</span>
                <div className="flex gap-2">
                  <Badge variant="secondary">{factor.weight}%</Badge>
                  <Badge className={factor.impact === "High" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}>{factor.impact}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
