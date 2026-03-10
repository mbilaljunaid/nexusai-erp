import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, FileText, User, Calendar } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";

export default function ActivityTimeline() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredActivities, setFilteredActivities] = useState<any[]>([]);
  const { data: activities = [] } = useQuery<any[]>({
    queryKey: ["/api/activities"],
  });
  const formMetadata = getFormMetadata("activity");

  return (
    <StandardPage
      title="Activity Timeline"
      description="All interactions and activities across your org"
    >

      <FormSearchWithMetadata
        formMetadata={formMetadata}
        value={searchQuery}
        onChange={setSearchQuery}
        data={activities}
        onFilter={setFilteredActivities}
      />

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Activities</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {filteredActivities.length > 0 ? filteredActivities.map((act: any, idx: number) => (
            <div key={idx} className="flex gap-4 p-3 border rounded">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{act.type}: {act.subject}</p>
                <p className="text-sm text-muted-foreground mt-1">{act.user || "—"}</p>
              </div>
            </div>
          )) : <p className="text-muted-foreground text-center py-4">No activities found</p>}
        </CardContent>
      </Card>
    </StandardPage>
  );
}
