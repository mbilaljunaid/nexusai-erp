import { Card, CardContent } from "@/components/ui/card";

export default function InternationalizationConfig() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Internationalization (i18n)</h1>
        <p className="text-muted-foreground mt-1">Multi-language support configuration</p>
      </div>
      <div className="grid gap-4">
        {[
          { lang: "English", region: "US", coverage: "100%" },
          { lang: "Spanish", region: "ES", coverage: "100%" },
          { lang: "French", region: "FR", coverage: "95%" },
        ].map((l) => (
          <Card key={l.lang}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{l.lang} ({l.region})</h3>
              <p className="text-sm text-muted-foreground">Coverage: {l.coverage}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
