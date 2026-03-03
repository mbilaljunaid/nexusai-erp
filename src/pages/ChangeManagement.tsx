import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { GitBranch } from "lucide-react";
export default function ChangeManagement() {
  return (
    <StandardPage
      title="Change " />Change Management</h1><p className="text-muted-foreground">Track and manage organizational changes</p></div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Changes</p><p className="text-2xl font-bold">34</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Approved</p><p className="text-2xl font-bold text-green-600">28</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">In Progress</p><p className="text-2xl font-bold">6</p></CardContent></Card>
      </div>
    </StandardPage>
  );
}
