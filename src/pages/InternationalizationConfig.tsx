import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function InternationalizationConfig() {
  return (
    <StandardPage
      title="Internaion (i18n)"
      description="Multi-language support configuration"
    >
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
    </StandardPage>
  );
}
