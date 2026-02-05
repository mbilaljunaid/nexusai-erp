import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookMarked } from "lucide-react";

export default function LMSContent() {
  const modules = [
    { id: "MOD001", name: "Introduction to Data Structures", course: "CSE101", lessons: 12, status: "PUBLISHED" },
    { id: "MOD002", name: "HTML & CSS Basics", course: "CSE102", lessons: 8, status: "DRAFT" },
  ];
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center"><div><h1 className="text-3xl font-bold">LMS & Content Delivery</h1></div><Button data-testid="button-upload-content"><Plus className="h-4 w-4 mr-2" /> Upload Content</Button></div>
      <div className="grid gap-4">
        {modules.map(m => (
          <Card key={m.id} className="hover-elevate" data-testid={`card-module-${m.id}`}>
            <CardContent className="pt-6"><div className="flex justify-between items-start"><div><h3 className="font-semibold">{m.name}</h3><p className="text-sm text-muted-foreground">{m.course}</p><p className="text-sm">{m.lessons} Lessons</p></div><Badge>{m.status}</Badge></div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
