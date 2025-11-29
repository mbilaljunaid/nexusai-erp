import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BackupRestore() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backup & Restore</h1>
        <p className="text-muted-foreground mt-1">Manage system backups and restoration</p>
      </div>
      <div className="grid gap-4">
        {[
          { backup: "Daily Backup 2025-02-29", size: "2.4 GB", status: "Completed" },
          { backup: "Daily Backup 2025-02-28", size: "2.3 GB", status: "Completed" },
        ].map((b) => (
          <Card key={b.backup}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{b.backup}</h3>
              <p className="text-sm text-muted-foreground">{b.size} • {b.status}</p>
              <Button size="sm" className="mt-3" data-testid={`button-restore-${b.backup.toLowerCase()}`}>Restore</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
