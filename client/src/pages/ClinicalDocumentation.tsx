import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ClinicalDocumentation() {
  const { toast } = useToast();
  const [newNote, setNewNote] = useState({ noteId: "", encounterId: "", providerId: "", chiefComplaint: "", status: "draft" });

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["/api/healthcare-notes"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/healthcare-notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/healthcare-notes"] });
      setNewNote({ noteId: "", encounterId: "", providerId: "", chiefComplaint: "", status: "draft" });
      toast({ title: "Clinical note created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/healthcare-notes/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/healthcare-notes"] });
      toast({ title: "Note deleted" });
    }
  });

  const finalized = notes.filter((n: any) => n.status === "finalized").length;
  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Clinical Documentation & EMR/EHR
        </h1>
        <p className="text-muted-foreground mt-2">SOAP notes, progress notes, problem lists, care plans, and discharge summaries</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Notes</p>
            <p className="text-2xl font-bold">{notes.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold text-yellow-600">{notes.filter((n: any) => n.status === "draft").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Finalized</p>
            <p className="text-2xl font-bold text-green-600">{finalized}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Signed</p>
            <p className="text-2xl font-bold text-blue-600">{notes.filter((n: any) => n.status === "signed").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-note">
        <CardHeader><CardTitle className="text-base">Create Clinical Note</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Note ID" value={newNote.noteId} onChange={(e) => setNewNote({ ...newNote, noteId: e.target.value })} data-testid="input-noteid" className="text-sm" />
            <Input placeholder="Encounter ID" value={newNote.encounterId} onChange={(e) => setNewNote({ ...newNote, encounterId: e.target.value })} data-testid="input-encid" className="text-sm" />
            <Input placeholder="Provider ID" value={newNote.providerId} onChange={(e) => setNewNote({ ...newNote, providerId: e.target.value })} data-testid="input-provid" className="text-sm" />
            <Input placeholder="Chief Complaint" value={newNote.chiefComplaint} onChange={(e) => setNewNote({ ...newNote, chiefComplaint: e.target.value })} data-testid="input-complaint" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newNote)} disabled={createMutation.isPending || !newNote.noteId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : notes.length === 0 ? <p className="text-muted-foreground text-center py-4">No notes</p> : notes.map((n: any) => (
            <div key={n.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`note-${n.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{n.noteId}</p>
                <p className="text-xs text-muted-foreground">Encounter: {n.encounterId} • {n.chiefComplaint}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={n.status === "signed" ? "default" : "secondary"} className="text-xs">{n.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(n.id)} data-testid={`button-delete-${n.id}`} className="h-7 w-7">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
