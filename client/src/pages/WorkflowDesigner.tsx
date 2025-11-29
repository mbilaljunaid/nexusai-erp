import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, GitBranch, Zap, Settings } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface WorkflowState {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  states: WorkflowState[];
  automationRules: { trigger: string; action: string }[];
  active: boolean;
}

export default function WorkflowDesigner() {
  const { data: workflows = [] } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
    retry: false,
  });

  const createWorkflowMutation = useMutation({
    mutationFn: (data: Partial<Workflow>) => apiRequest("POST", "/api/workflows", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/workflows"] }),
  });

  const stats = {
    total: workflows.length,
    active: workflows.filter(w => w.active).length,
    totalStates: workflows.reduce((sum, w) => sum + w.states.length, 0),
    totalRules: workflows.reduce((sum, w) => sum + w.automationRules.length, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Workflow Designer</h1>
          <p className="text-muted-foreground text-sm">Create custom states and automation rules</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <GitBranch className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Workflows</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.totalStates}</p>
                <p className="text-xs text-muted-foreground">Custom States</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.totalRules}</p>
                <p className="text-xs text-muted-foreground">Automation Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-3">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold">{workflow.name}</p>
                      <Badge variant={workflow.active ? "default" : "secondary"}>
                        {workflow.active ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{workflow.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      {workflow.states.map((state) => (
                        <div key={state.id} className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: state.color }}
                          />
                          <span className="text-xs">{state.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="templates" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: "Kanban Board", states: 3 },
              { name: "Development", states: 5 },
              { name: "Bug Triage", states: 4 },
              { name: "Approval Chain", states: 6 },
            ].map((template, idx) => (
              <Card key={idx} className="hover-elevate cursor-pointer">
                <CardContent className="p-4">
                  <p className="font-semibold text-sm">{template.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{template.states} states</p>
                  <Button size="sm" className="mt-3 w-full">Use Template</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-3">
          {workflows.flatMap(w => w.automationRules.map((rule, idx) => (
            <Card key={`${w.id}-${idx}`} className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-sm">On {rule.trigger}</p>
                    <p className="text-xs text-muted-foreground">{rule.action}</p>
                  </div>
                  <Badge variant="secondary">AUTO</Badge>
                </div>
              </CardContent>
            </Card>
          )))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
