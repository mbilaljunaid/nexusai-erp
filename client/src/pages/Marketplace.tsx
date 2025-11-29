import { Card, CardContent } from "@/components/ui/card";

export default function Marketplace() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground mt-1">Publish and manage marketplace extensions</p>
      </div>
      <div className="grid gap-4">
        {[
          { ext: "Custom Integration", downloads: 142, rating: "4.8" },
          { ext: "Advanced Reports", downloads: 89, rating: "4.6" },
        ].map((ext) => (
          <Card key={ext.ext}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{ext.ext}</h3>
              <p className="text-sm text-muted-foreground">{ext.downloads} downloads • ⭐ {ext.rating}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
