import { Card, CardContent } from "@/components/ui/card";

export default function DuplicateDetection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Duplicate Detection</h1>
        <p className="text-muted-foreground mt-1">Identify and merge duplicate records</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Duplicate Groups Found</p>
          <p className="text-3xl font-bold mt-1">12</p>
        </CardContent>
      </Card>
    </div>
  );
}
