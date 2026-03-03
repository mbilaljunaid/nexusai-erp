import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Badge } from "@/components/ui/badge";

export default function NotificationCenter() {
  return (
    <StandardPage
      title="Notificer</h1>
        <p className="text-muted-foreground mt-1">Unified notification management</p>
      </div>
      <div className="grid gap-4">
        {[
          { msg: "New lead assigned to you", time: "10 min ago", read: false },
          { msg: "Deal closed: Acme Corp", time: "1 hour ago", read: true },
        ].map((n, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <p className="font-medium">{n.msg}</p>
              <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
