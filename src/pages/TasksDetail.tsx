import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { ContextualSearch } from "@/components/ContextualSearch";

function TaskEntryForm() {
  return (
    <StandardPage
      title="Tasks"
      description="Manage project tasks and assignments"
      className="border rounded bg-muted/50 border-dashed text-center"
    >
      <p className="text-muted-foreground">Task Entry Form Placeholder</p>
    </StandardPage>
  );
}

export default function TasksDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const tasks = [{ id: 1, title: "Design homepage", status: "done", priority: "high" }, { id: 2, title: "Implement auth", status: "in_progress", priority: "urgent" }];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/projects">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <ContextualSearch
              placeholder="Search tasks..."
              fields={[{ key: "query", label: "Search", type: "text" }]}
              onSearch={(filters) => setSearchQuery(filters.query || "")}
            />
          </div>
          <Button>+ New Task</Button>
        </div>

        <div className="space-y-2">
          {tasks.filter((t: any) => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map((t: any) => (
            <Card key={t.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold">{t.title}</p><p className="text-sm text-muted-foreground">{t.status}</p></div><Badge>{t.priority}</Badge></div></CardContent></Card>
          ))}
        </div>

        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">+ Create New Task</h2>
          <TaskEntryForm />
        </div>
      </div>
    </div>
  );
}
