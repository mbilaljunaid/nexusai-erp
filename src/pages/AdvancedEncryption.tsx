import { Card, CardContent } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";

export default function AdvancedEncryption() {
  return (
    <StandardPage
      title="Advanceon"
      description="End-to-end encryption and key management"
    >
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Encryption Status</p>
          <p className="text-3xl font-bold mt-1">AES-256</p>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
