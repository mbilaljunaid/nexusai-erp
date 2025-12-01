import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function ProjectsModule() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects & Agile</h1>
          <p className="text-muted-foreground">Manage projects, sprints, and tasks</p>
        </div>
        <Button data-testid="button-create-project">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-3xl font-bold mt-2">8</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Active Sprints</p>
              <p className="text-3xl font-bold mt-2">5</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Tasks In Progress</p>
              <p className="text-3xl font-bold mt-2">23</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Team Velocity</p>
              <p className="text-3xl font-bold mt-2">45 pts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Platform Migration", progress: 75, status: "in-progress" }
              { name: "Mobile App", progress: 45, status: "in-progress" }
              { name: "API Redesign", progress: 90, status: "in-progress" }
            ].map((proj) => (
              <div key={proj.name} className="p-3 border rounded">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-sm">{proj.name}</p>
                  <Badge>{proj.progress}%</Badge>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${proj.progress}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sprint Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { sprint: "Sprint 25", completed: 32, remaining: 8, status: "active" }
              { sprint: "Sprint 26", completed: 0, remaining: 40, status: "planned" }
            ].map((s) => (
              <div key={s.sprint} className="p-3 border rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{s.sprint}</p>
                    <p className="text-xs text-muted-foreground">{s.completed} done, {s.remaining} remaining</p>
                  </div>
                  <Badge variant={s.status === "active" ? "default" : "outline"}>{s.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
