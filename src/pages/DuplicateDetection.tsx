import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { GitMerge, Check, User, Building2 } from "lucide-react";

export default function DuplicateDetection() {
  const { toast } = useToast();
  const [sets, setSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSet, setSelectedSet] = useState<any>(null);
  const [survivorId, setSurvivorId] = useState<string>("");

  useEffect(() => {
    fetchSets();
  }, []);

  const fetchSets = () => {
    setLoading(true);
    fetch('/api/mdm/quality/duplicates')
      .then(res => res.json())
      .then(data => {
        setSets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleResolve = async () => {
    if (!survivorId) return;
    try {
      const res = await fetch(`/api/mdm/quality/duplicates/${selectedSet.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ survivorPartyId: survivorId })
      });
      if (!res.ok) throw new Error("Failed");

      toast({ title: "Resolved", description: "Duplicate set merged successfully." });
      setSelectedSet(null);
      setSurvivorId("");
      fetchSets();
    } catch (e) {
      toast({ title: "Error", description: "Failed to resolve duplicate set.", variant: "destructive" });
    }
  };

  return (
    <StandardPage
      title="Duplicaion Console"
      description="Review and merge duplicate party records"
    >

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading potential duplicates...</div>
      ) : sets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <Check className="w-12 h-12 text-green-500 mb-4" />
          <h3 className="text-xl font-medium">No Duplicates Found</h3>
          <p className="text-muted-foreground">Your data is clean!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sets.map((set) => (
            <Card key={set.id} className="overflow-hidden">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{set.status}</Badge>
                    <span className="text-xs text-muted-foreground">ID: {set.id.substring(0, 8)}</span>
                    <span className="text-xs text-muted-foreground">Batch: {set.batch?.batchName}</span>
                  </div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {set.parties[0]?.party?.partyName}
                    <Badge variant="secondary" className="ml-2">+{set.parties.length - 1} matches</Badge>
                  </h3>
                </div>
                <Button onClick={() => setSelectedSet(set)}>Review & Merge</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Resolution Dialog */}
      <Dialog open={!!selectedSet} onOpenChange={(open) => !open && setSelectedSet(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Merge Duplicates</DialogTitle>
            <DialogDescription>Select the "Golden Record" to keep. Other records will be merged into it.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 max-h-[60vh] overflow-y-auto p-1">
            {selectedSet?.parties?.map((p: any) => (
              <Card
                key={p.partyId}
                className={cn(`cursor-pointer transition-all border-2 ${survivorId === p.partyId ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-transparent hover:border-slate-200 bg-slate-50'}`)}
                onClick={() => setSurvivorId(p.partyId)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    {p.party.partyType === 'ORGANIZATION' ? <Building2 className="w-5 h-5 text-gray-500" /> : <User className="w-5 h-5 text-gray-500" />}
                    <Badge variant={p.party.status === 'A' ? 'default' : 'secondary'}>{p.party.status}</Badge>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{p.party.partyName}</p>
                    <p className="text-xs font-mono text-muted-foreground">{p.party.partyNumber}</p>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Score:</span> {p.score}%</p>
                    <p><span className="text-muted-foreground">Email:</span> {p.party.email || '-'}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {p.party.primaryPhone || '-'}</p>
                  </div>
                  {survivorId === p.partyId && (
                    <div className="mt-2 flex items-center gap-2 text-primary text-sm font-medium">
                      <Check className="w-4 h-4" /> Selected as Survivor
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSet(null)}>Cancel</Button>
            <Button onClick={handleResolve} disabled={!survivorId}>
              <GitMerge className="w-4 h-4 mr-2" /> Merge Records
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StandardPage>
  );
}
