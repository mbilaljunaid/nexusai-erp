import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";

export default function BackupRestore() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filtered, setFiltered] = useState<any[]>([]);
  const { data: backups = [] } = useQuery<any[]>({ queryKey: ["/api/backup"] });
  const formMetadata = getFormMetadata("backupRestore");

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Backup & Restore</h1>
          <p className="text-muted-foreground mt-1">Manage system backups and restoration</p>
        </div>
        <SmartAddButton formMetadata={formMetadata} onClick={() => setShowForm(true)} />
      </div>

      <FormSearchWithMetadata formMetadata={formMetadata} value={searchQuery} onChange={setSearchQuery} data={backups} onFilter={setFiltered} />

      <div className="grid gap-4">
        {filtered.length > 0 ? filtered.map((b: any) => (
          <Card key={b.name}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{b.name}</h3>
              <p className="text-sm text-muted-foreground">{b.size} • {b.status}</p>
            </CardContent>
          </Card>
        )) : <p className="text-muted-foreground text-center py-4">No backups found</p>}
      </div>
    </div>
  );
}
