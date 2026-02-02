import { Card, CardContent } from "@/components/ui/card";

export default function ArchiveManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Archive Management</h1>
        <p className="text-muted-foreground mt-1">Manage data archival and retention</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Archived Records</p>
          <p className="text-3xl font-bold mt-2">1,245</p>
        </CardContent>
      </Card>
    </div>
  );
}
