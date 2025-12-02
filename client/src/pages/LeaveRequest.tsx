import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";

export default function LeaveRequest() {
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [filteredLeaves, setFilteredLeaves] = useState<any[]>([]);
  const { data: leaves = [] } = useQuery<any[]>({
    queryKey: ["/api/hr/leave-requests"],
  });
  const formMetadata = getFormMetadata("leaveRequest");

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Leave Requests</h1>
          <p className="text-muted-foreground mt-1">Manage and track employee leave requests</p>
        </div>
        <SmartAddButton formMetadata={formMetadata} onClick={() => setShowLeaveForm(true)} />
      </div>

      <FormSearchWithMetadata
        formMetadata={formMetadata}
        value={searchQuery}
        onChange={setSearchQuery}
        data={leaves}
        onFilter={setFilteredLeaves}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Available Days</p>
            <p className="text-3xl font-bold mt-1">15</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Used Days</p>
            <p className="text-3xl font-bold mt-1">5</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending Approvals</p>
            <p className="text-3xl font-bold mt-1">2</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Leave History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {filteredLeaves.length > 0 ? filteredLeaves.map((req: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-2 border rounded">
              <div>
                <p className="font-medium text-sm">{req.type}</p>
              </div>
              <Badge className={req.status === "Approved" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>{req.status}</Badge>
            </div>
          )) : <p className="text-muted-foreground text-center py-4">No leave requests found</p>}
        </CardContent>
      </Card>
    </div>
  );
}
