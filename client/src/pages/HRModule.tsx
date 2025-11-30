import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Briefcase } from "lucide-react";

export default function HRModule() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HR Module</h1>
          <p className="text-muted-foreground">Manage recruitment, employees, and training programs</p>
        </div>
        <Button data-testid="button-post-job">
          <Plus className="w-4 h-4 mr-2" />
          Post Job
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold mt-1">45</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Positions</p>
                <p className="text-2xl font-bold mt-1">5</p>
              </div>
              <Briefcase className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Active Candidates</p>
              <p className="text-2xl font-bold mt-1">23</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Training Programs</p>
              <p className="text-2xl font-bold mt-1">8</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Job Postings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Senior Developer</p>
                  <p className="text-sm text-muted-foreground">Engineering</p>
                </div>
                <Badge>7 applications</Badge>
              </div>
            </div>
            <div className="p-3 border rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Product Manager</p>
                  <p className="text-sm text-muted-foreground">Product</p>
                </div>
                <Badge>12 applications</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Training</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded">
              <p className="font-medium text-sm">Leadership Development</p>
              <p className="text-xs text-muted-foreground mt-1">Start: Jan 15, 2024</p>
            </div>
            <div className="p-3 border rounded">
              <p className="font-medium text-sm">Technical Skills Workshop</p>
              <p className="text-xs text-muted-foreground mt-1">Start: Jan 22, 2024</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
