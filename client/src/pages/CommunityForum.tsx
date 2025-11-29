import { Card, CardContent } from "@/components/ui/card";

export default function CommunityForum() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Community Forum</h1>
        <p className="text-muted-foreground mt-1">User community and peer support</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Active Users</p><p className="text-3xl font-bold mt-1">4.2K</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Topics</p><p className="text-3xl font-bold mt-1">1.8K</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Avg Response</p><p className="text-3xl font-bold mt-1">2h</p></CardContent></Card>
      </div>
    </div>
  );
}
