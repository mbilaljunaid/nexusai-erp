import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Localization() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Localization</h1>
        <p className="text-muted-foreground mt-1">Manage language and regional settings</p>
      </div>
      <div className="grid gap-4">
        {[
          { lang: "English", coverage: "100%", status: "Active" }
          { lang: "Spanish", coverage: "95%", status: "Active" }
        ].map((l) => (
          <Card key={l.lang}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{l.lang}</h3>
              <p className="text-sm text-muted-foreground">Translation coverage: {l.coverage}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
