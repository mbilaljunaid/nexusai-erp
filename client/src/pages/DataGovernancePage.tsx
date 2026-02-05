import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function DataGovernancePage() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [stats, setStats] = useState({
    recordsManaged: 0,
    dataQualityScore: 0,
    policies: 0,
    openDuplicateSets: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mdm/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const runBatch = async () => {
    try {
      const res = await fetch('/api/mdm/quality/match-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchName: "Manual Run " + new Date().toLocaleString() })
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      toast({
        title: "Batch Started",
        description: `Found ${data.candidatesFound} potential duplicates.`
      });
      // Refresh stats
      const statsRes = await fetch('/api/mdm/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to run batch process.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Database className="w-8 h-8" />Data Governance
          </h1>
          <p className="text-muted-foreground">Manage data quality, compliance, and lineage</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runBatch}>
            <Play className="w-4 h-4 mr-2" />
            Run Deduplication
          </Button>
        </div>
      </div>

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
        <Card className="cursor-pointer hover:bg-slate-50" onClick={() => setLocation("/mdm/duplicates")}>
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
    </div>
  );
}
