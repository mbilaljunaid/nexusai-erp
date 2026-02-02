import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Clock, FileCheck } from "lucide-react";

export default function DocumentManagement() {
  const [viewType, setViewType] = useState("documents");
  const { data: documents = [] } = useQuery<any[]>({ queryKey: ["/api/documents/list"] });
  const { data: approvals = [] } = useQuery<any[]>({ queryKey: ["/api/documents/approvals"] });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Document Management</h1>
        <p className="text-muted-foreground mt-2">Manage documents and approvals</p>
      </div>

      <div className="flex gap-2">
        <Button variant={viewType === "documents" ? "default" : "outline"} data-testid="button-view-documents">
          <FileText className="h-4 w-4 mr-2" />
          Documents ({documents.length})
        </Button>
        <Button variant={viewType === "approvals" ? "default" : "outline"} data-testid="button-view-approvals">
          <FileCheck className="h-4 w-4 mr-2" />
          Approvals ({approvals.length})
        </Button>
      </div>

      {viewType === "documents" && (
        <div className="space-y-3">
          {documents.map((doc: any) => (
            <Card key={doc.id} data-testid={`card-document-${doc.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">{doc.documentName}</h4>
                      <p className="text-xs text-muted-foreground">Owner: {doc.owner}</p>
                    </div>
                  </div>
                  <Badge>{doc.documentType}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewType === "approvals" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvals.map((approval: any) => (
            <Card key={approval.id} data-testid={`card-approval-${approval.id}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    {approval.documentId}
                  </span>
                  <Badge variant={approval.approvalStatus === "approved" ? "default" : "outline"}>{approval.approvalStatus}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{approval.comments}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
