import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProductReviewsRatings() {
  const { toast } = useToast();
  const [newReview, setNewReview] = useState({ productId: "", customerName: "", rating: "5", status: "pending" });

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["/api/product-reviews"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/product-reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-reviews"] });
      setNewReview({ productId: "", customerName: "", rating: "5", status: "pending" });
      toast({ title: "Review submitted" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/product-reviews/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-reviews"] });
      toast({ title: "Review deleted" });
    }
  });

  const approved = reviews.filter((r: any) => r.status === "approved").length;
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum: number, r: any) => sum + (parseFloat(r.rating) || 0), 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Star className="h-8 w-8" />
          Product Reviews & Ratings
        </h1>
        <p className="text-muted-foreground mt-2">Customer feedback, ratings, moderation, and publishing</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Reviews</p>
            <p className="text-2xl font-bold">{reviews.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Rating</p>
            <p className="text-2xl font-bold text-yellow-600">{avgRating}/5</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">{approved}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600">{reviews.length - approved}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-review">
        <CardHeader><CardTitle className="text-base">Submit Review</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Product ID" value={newReview.productId} onChange={(e) => setNewReview({ ...newReview, productId: e.target.value })} data-testid="input-prodid" className="text-sm" />
            <Input placeholder="Customer Name" value={newReview.customerName} onChange={(e) => setNewReview({ ...newReview, customerName: e.target.value })} data-testid="input-name" className="text-sm" />
            <Select value={newReview.rating} onValueChange={(v) => setNewReview({ ...newReview, rating: v })}>
              <SelectTrigger data-testid="select-rating" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Star</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newReview.status} onValueChange={(v) => setNewReview({ ...newReview, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newReview)} disabled={createMutation.isPending || !newReview.productId} size="sm" data-testid="button-submit">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Reviews</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : reviews.length === 0 ? <p className="text-muted-foreground text-center py-4">No reviews</p> : reviews.map((r: any) => (
            <div key={r.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`review-${r.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{r.productId} - {r.customerName}</p>
                <p className="text-xs text-muted-foreground">{"⭐".repeat(parseInt(r.rating))} ({r.rating}/5)</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={r.status === "approved" ? "default" : "secondary"} className="text-xs">{r.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(r.id)} data-testid={`button-delete-${r.id}`} className="h-7 w-7">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
