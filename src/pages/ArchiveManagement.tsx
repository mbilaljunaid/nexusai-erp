import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function ArchiveManagement() {
  return (
    <StandardPage
      title="Archivet"
      description="Manage data archival and retention"
    >
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Archived Records</p>
          <p className="text-3xl font-bold mt-2">1,245</p>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
