import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PerformanceReviews() {
  const { toast } = useToast();
  const [newReview, setNewReview] = useState({ employee: "", rating: "4.0", status: "In Progress" });

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["/api/hr/performance-reviews"],
    queryFn: () => fetch("/api/hr/performance-reviews").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/hr/performance-reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/performance-reviews"] });
      setNewReview({ employee: "", rating: "4.0", status: "In Progress" });
      toast({ title: "Performance review created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/hr/performance-reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/performance-reviews"] });
      toast({ title: "Review deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Performance Reviews</h1>
        <p className="text-muted-foreground mt-1">Track employee performance and evaluations</p>
      </div>

      <Card data-testid="card-new-review">
        <CardHeader><CardTitle className="text-base">Create Performance Review</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Employee name" value={newReview.employee} onChange={(e) => setNewReview({ ...newReview, employee: e.target.value })} data-testid="input-employee" />
            <Select value={newReview.rating} onValueChange={(v) => setNewReview({ ...newReview, rating: v })}>
              <SelectTrigger data-testid="select-rating"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2.0">2.0</SelectItem>
                <SelectItem value="3.0">3.0</SelectItem>
                <SelectItem value="4.0">4.0</SelectItem>
                <SelectItem value="5.0">5.0</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newReview.status} onValueChange={(v) => setNewReview({ ...newReview, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button disabled={createMutation.isPending || !newReview.employee} className="w-full" data-testid="button-create-review">
            <Plus className="w-4 h-4 mr-2" /> Create Review
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Performance Reviews</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : reviews.length === 0 ? <p className="text-muted-foreground text-center py-4">No reviews</p> : reviews.map((rev: any) => (
            <div key={rev.id} className="flex items-center justify-between p-3 border rounded hover-elevate" data-testid={`review-${rev.id}`}>
              <div>
                <p className="font-medium">{rev.employee}</p>
                <p className="text-sm text-muted-foreground">Rating: {rev.rating}/5</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge>{rev.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${rev.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
