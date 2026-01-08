import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Check, Layers, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { TrialBalanceGrid } from "@/components/finance/TrialBalanceGrid";
import { FiscalPeriods } from "@/components/finance/FiscalPeriods";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { GlJournal, GlJournalBatch } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import { AIChatWidget } from "@/components/AIChatWidget";

export default function GeneralLedger() {
  const [activeTab, setActiveTab] = useState("journals");

  return (
    <div className="space-y-6 relative min-h-screen">
      <AIChatWidget context="finance" />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            General Ledger
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage journals, batches, approvals, and financial reports.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "journals" && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Journal
            </Button>
          )}
          {activeTab === "batches" && (
            <Button variant="outline">
              <Layers className="mr-2 h-4 w-4" />
              New Batch
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="journals" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-background border">
          <TabsTrigger value="journals">Journals</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="periods">Fiscal Periods</TabsTrigger>
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
        </TabsList>

        <TabsContent value="journals">
          <JournalList />
        </TabsContent>

        <TabsContent value="batches">
          <BatchList />
        </TabsContent>

        <TabsContent value="approvals">
          <ApprovalList />
        </TabsContent>

        <TabsContent value="periods">
          <FiscalPeriods />
        </TabsContent>

        <TabsContent value="trial-balance">
          <TrialBalanceGrid />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function JournalList() {
  const { data: journals, isLoading } = useQuery<GlJournal[]>({
    queryKey: ["/api/gl/journals"]
  });
  const { toast } = useToast();

  const reverseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/gl/journals/${id}/reverse`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gl/journals"] });
      toast({ title: "Journal Reversed", description: "A reversal entry has been created." });
    },
    onError: (e: Error) => {
      toast({ title: "Reversal Failed", description: e.message, variant: "destructive" });
    }
  });

  if (isLoading) return <div>Loading journals...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Journal #</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {journals?.map((j) => (
              <TableRow key={j.id}>
                <TableCell className="font-medium">{j.journalNumber}</TableCell>
                <TableCell>{j.description}</TableCell>
                <TableCell>
                  <Badge variant={j.status === "Posted" ? "default" : "secondary"}>
                    {j.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={j.approvalStatus === "Approved" ? "success" : j.approvalStatus === "Required" ? "destructive" : "outline"}>
                    {j.approvalStatus}
                  </Badge>
                </TableCell>
                <TableCell>{j.periodId}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" title="Reverse"
                      disabled={j.status !== "Posted"}
                      onClick={() => reverseMutation.mutate(j.id)}
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function BatchList() {
  // Placeholder for Batches UI
  const { data: batches } = useQuery<GlJournalBatch[]>({
    queryKey: ["/api/gl/batches"], // Just using cache key pattern, route might need GET
    enabled: false // Disable until GET route exists
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal Batches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Layers className="mx-auto h-12 w-12 opacity-20 mb-4" />
          <p>Journal Batch Management is coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ApprovalList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Check className="mx-auto h-12 w-12 opacity-20 mb-4" />
          <p>No pending approvals found.</p>
        </div>
      </CardContent>
    </Card>
  );
}
