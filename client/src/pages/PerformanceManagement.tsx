import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, TrendingUp, Star, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function PerformanceManagement() {
  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/performance-reviews"],
    retry: false,
  });

  const stats = {
    total: reviews.length,
    inProgress: reviews.filter((r: any) => r.status === "in_progress").length,
    completed: reviews.filter((r: any) => r.status === "completed").length,
    avgScore: ((reviews.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / (reviews.length || 1)) * 100).toFixed(0),
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">Performance Management</h1>
        <p className="text-muted-foreground text-sm">Reviews, goals, and feedback</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Reviews</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <div><p className="text-2xl font-semibold">{stats.inProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div><p className="text-2xl font-semibold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-orange-500" />
            <div><p className="text-2xl font-semibold">{stats.avgScore}%</p>
              <p className="text-xs text-muted-foreground">Avg Score</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="reviews" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="reviews">
          {reviews.map((review: any) => (
            <Card key={review.id}><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{review.employeeName}</p>
                  <p className="text-sm text-muted-foreground">Rating: {(review.score * 100).toFixed(0)}%</p></div>
                <Badge variant={review.status === "completed" ? "default" : "secondary"}>{review.status}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="goals"><p className="text-muted-foreground">Employee goal tracking and objectives</p></TabsContent>
        <TabsContent value="feedback"><p className="text-muted-foreground">360-degree feedback system</p></TabsContent>
      </Tabs>
    </div>
  );
}
