import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface UATScript {
  id: string;
  testName: string;
  steps: string[];
  expectedResults: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
}

export default function UATAutomation() {
  const { toast } = useToast();
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedModule, setSelectedModule] = useState("");

  const { data: scripts = [], isLoading } = useQuery<UATScript[]>({
    queryKey: ["/api/uat/scripts", selectedIndustry],
    enabled: !!selectedIndustry,
    queryFn: () =>
      fetch(`http://localhost:3001/api/uat/scripts/${selectedIndustry}`, { credentials: "include" }).then(
        (r) => r.json()
      ),
  });

  const { data: coverage, refetch: refetchCoverage } = useQuery({
    queryKey: ["/api/uat/coverage", selectedIndustry],
    enabled: !!selectedIndustry,
    queryFn: () =>
      fetch(`http://localhost:3001/api/uat/coverage/${selectedIndustry}`, { credentials: "include" }).then(
        (r) => r.json()
      ),
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `http://localhost:3001/api/uat/generate/${selectedIndustry}/${selectedModule}`, {
        count: 5,
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "UAT scripts generated successfully" });
      refetchCoverage();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate UAT scripts", variant: "destructive" });
    },
  });

  const industries = [
    { id: "manufacturing", name: "Manufacturing" },
    { id: "retail", name: "Retail" },
    { id: "finance", name: "Finance" },
    { id: "healthcare", name: "Healthcare" },
    { id: "construction", name: "Construction" },
  ];

  const modules = [
    { id: "erp", name: "ERP" },
    { id: "crm", name: "CRM" },
    { id: "hr", name: "HR" },
    { id: "projects", name: "Projects" },
  ];

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">UAT Automation</h1>
        <p className="text-muted-foreground mt-2">
          AI-generated test scripts with industry-specific scenarios
        </p>
      </div>

      {/* Script Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Generate UAT Scripts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Industry</label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger data-testid="select-industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind.id} value={ind.id} data-testid={`option-${ind.id}`}>
                      {ind.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Module</label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger data-testid="select-module">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((mod) => (
                    <SelectItem key={mod.id} value={mod.id} data-testid={`option-${mod.id}`}>
                      {mod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!selectedIndustry || !selectedModule || generateMutation.isPending}
            data-testid="button-generate-scripts"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Scripts"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Coverage Report */}
      {coverage && selectedIndustry && (
        <Card>
          <CardHeader>
            <CardTitle>Test Coverage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Coverage Score</span>
                <span className="text-2xl font-bold">{coverage.coverage.toFixed(0)}%</span>
              </div>
              <Progress value={coverage.coverage} />
            </div>
            {coverage.gaps.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Identified Gaps</h4>
                <ul className="space-y-1">
                  {coverage.gaps.map((gap: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-600" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {coverage.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {coverage.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generated Scripts */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : scripts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Generated Test Scripts ({scripts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scripts.map((script) => (
                <div
                  key={script.id}
                  className="p-3 border rounded-lg hover:bg-muted transition-colors"
                  data-testid={`script-${script.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold flex items-center gap-2">
                        {getPriorityIcon(script.priority)}
                        {script.testName}
                      </div>
                      <Badge variant="secondary" className="mt-1 mr-2">
                        {script.priority}
                      </Badge>
                      <Badge variant="outline">{script.estimatedTime} min</Badge>
                    </div>
                  </div>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                      View Steps ({script.steps.length})
                    </summary>
                    <div className="mt-2 space-y-2 pl-4">
                      {script.steps.map((step, idx) => (
                        <div key={idx} className="text-sm">
                          <strong>{idx + 1}.</strong> {step}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : selectedIndustry ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No scripts generated yet. Click "Generate Scripts" to begin.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
