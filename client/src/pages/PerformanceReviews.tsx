import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PerformanceReviews() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Reviews</h1>
        <p className="text-muted-foreground mt-1">Track employee performance and evaluations</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">2025 Performance Reviews</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { emp: "Alice Johnson", rating: 4.5, status: "Completed" },
            { emp: "Bob Smith", rating: 4.2, status: "Completed" },
            { emp: "Carol Davis", rating: 3.8, status: "In Progress" },
          ].map((rev, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium">{rev.emp}</p>
                <p className="text-sm text-muted-foreground">Rating: ⭐ {rev.rating}/5</p>
              </div>
              <Badge className={rev.status === "Completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>{rev.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
