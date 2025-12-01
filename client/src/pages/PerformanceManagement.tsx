import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";
import { Target, TrendingUp, Star, AlertCircle, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Review {
  id: string;
  employeeName: string;
  status: string;
  score: number;
}

export default function PerformanceManagement() {
  const [activeNav, setActiveNav] = useState("reviews");
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/performance-reviews"],
    retry: false,
  });

  const stats = {
    total: (reviews || []).length,
    inProgress: (reviews || []).filter((r: any) => r.status === "in_progress").length,
    completed: (reviews || []).filter((r: any) => r.status === "completed").length,
    avgScore: (reviews || []).length > 0 ? (((reviews || []).reduce((sum: number, r: any) => sum + (r.score || 0), 0) / (reviews || []).length) * 100).toFixed(0) : 0,
  };

  const navItems = [
    { id: "reviews", label: "Reviews", icon: Target, color: "text-blue-500" },
    { id: "goals", label: "Goals", icon: TrendingUp, color: "text-green-500" },
    { id: "feedback", label: "Feedback", icon: Star, color: "text-purple-500" },
    { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">Performance Management</h1>
        <p className="text-muted-foreground text-sm">Reviews, goals, and feedback</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Target className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-semibold">{stats.total}</p><p className="text-xs text-muted-foreground">Reviews</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><AlertCircle className="h-5 w-5 text-yellow-500" /><div><p className="text-2xl font-semibold">{stats.inProgress}</p><p className="text-xs text-muted-foreground">In Progress</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><TrendingUp className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-semibold">{stats.completed}</p><p className="text-xs text-muted-foreground">Completed</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Star className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-semibold">{stats.avgScore}%</p><p className="text-xs text-muted-foreground">Avg Score</p></div></div></CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "reviews" && (
        <div className="space-y-3">
          {(reviews || []).map((review: any) => (
            <Card key={review.id} className="hover-elevate"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="font-semibold">{review.employeeName}</p><p className="text-sm text-muted-foreground">Rating: {(review.score * 100).toFixed(0)}%</p></div><Badge variant={review.status === "completed" ? "default" : "secondary"}>{review.status}</Badge></div></CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "goals" && <Card><CardContent className="p-4"><p className="text-muted-foreground">Employee goal tracking and objectives</p></CardContent></Card>}
      {activeNav === "feedback" && <Card><CardContent className="p-4"><p className="text-muted-foreground">360-degree feedback and reviews</p></CardContent></Card>}
      {activeNav === "analytics" && <Card><CardContent className="p-4"><p className="text-muted-foreground">Performance analytics and trends</p></CardContent></Card>}
    </div>
  );
}
