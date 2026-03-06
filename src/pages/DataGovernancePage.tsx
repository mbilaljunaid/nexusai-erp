import { formatDateTime } from "@/lib/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Database, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function DataGovernancePage() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const { data: stats = {
    recordsManaged: 0,
    dataQualityScore: 0,
    policies: 0,
    openDuplicateSets: 0
  }, isLoading: loading, refetch: fetchStats } = useQuery({
    queryKey: ['mdmStats'],
    queryFn: async () => {
      const res = await fetch('/api/mdm/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }
  });

  const runBatch = async () => {
    try {
      const res = await fetch('/api/mdm/quality/match-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchName: "Manual Run " + formatDateTime(new Date()) })
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      toast({
        title: "Batch Started",
        description: `Found ${data.candidatesFound} potential duplicates.`
      });
      // Refresh stats
      await fetchStats();

    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to run batch process.",
        variant: "destructive"
      });
    }
  };

  return (
    <StandardPage
      title="Data Governance"
      description="Manage data quality, compliance, and lineage"
      actions={
        <div className="flex gap-2">
          <Button onClick={runBatch}>
            <Play className="w-4 h-4 mr-2" />
            Run Deduplication
          </Button>
        </div>
      }
    >

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Records Managed</p>
            <p className="text-2xl font-bold">{loading ? "..." : stats.recordsManaged}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Data Quality Score</p>
            <p className="text-2xl font-bold text-green-600">{loading ? "..." : stats.dataQualityScore}%</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-slate-50" onClick={() => setLocation("/mdm/duplicates")} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Open Duplicate Sets</p>
            <p className="text-2xl font-bold text-orange-600">{loading ? "..." : stats.openDuplicateSets}</p>
            <p className="text-xs text-muted-foreground mt-1">Click to resolve</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Active Policies</p>
            <p className="text-2xl font-bold">{loading ? "..." : stats.policies}</p>
          </CardContent>
        </Card>
      </div>
    </StandardPage>
  );
}
