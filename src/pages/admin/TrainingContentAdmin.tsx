import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Video, FileCode2, FileText, FolderOpen, Search, ArrowLeft, Loader2,
  CheckCircle, XCircle, Clock, Star, Eye, ThumbsUp, User, ExternalLink,
  Filter, MoreVertical
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TrainingResource {
  id: string;
  type: string;
  title: string;
  description: string | null;
  resource_url: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  difficulty: string;
  modules: string[];
  industries: string[];
  apps: string[];
  tags: string[];
  submitted_by: string;
  author_name?: string;
  status: string;
  review_notes?: string;
  likes: number;
  views: number;
  featured: boolean;
  created_at: string;
}

interface FilterRequest {
  id: string;
  filter_type: string;
  filter_value: string;
  description: string | null;
  requested_by: string;
  requester_name?: string;
  status: string;
  created_at: string;
}

const typeConfig: Record<string, { icon: any; color: string; title: string }> = {
  video: { icon: Video, color: "text-red-400", title: "Video" },
  api: { icon: FileCode2, color: "text-cyan-400", title: "API" },
  guide: { icon: FileText, color: "text-yellow-400", title: "Guide" },
  material: { icon: FolderOpen, color: "text-emerald-400", title: "Material" },
  tutorial: { icon: FileText, color: "text-purple-400", title: "Tutorial" },
};

const statusConfig: Record<string, { color: string; icon: any }> = {
  pending: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  approved: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
  rejected: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
};

export default function TrainingContentAdmin() {
  const [activeTab, setActiveTab] = useState("content");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedResource, setSelectedResource] = useState<TrainingResource | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: resourcesData, isLoading: resourcesLoading } = useQuery<{ resources: TrainingResource[]; counts: Record<string, number> }>({
    queryKey: ["/api/admin/training", { 
      status: statusFilter !== "all" ? statusFilter : undefined, 
      type: typeFilter !== "all" ? typeFilter : undefined 
    }],
  });

  const { data: filterRequests, isLoading: filtersLoading } = useQuery<FilterRequest[]>({
    queryKey: ["/api/admin/training/filter-requests", { status: "pending" }],
  });

  const updateResourceMutation = useMutation({
    mutationFn: async ({ id, status, reviewNotes, featured }: { id: string; status?: string; reviewNotes?: string; featured?: boolean }) => {
      return apiRequest("PATCH", `/api/admin/training/${id}`, { status, reviewNotes, featured });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/training"] });
      setReviewDialogOpen(false);
      setSelectedResource(null);
      setReviewNotes("");
      toast({ title: "Success", description: "Resource updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update resource", variant: "destructive" });
    },
  });

  const updateFilterMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/admin/training/filter-requests/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/training/filter-requests"] });
      toast({ title: "Success", description: "Filter request updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update filter request", variant: "destructive" });
    },
  });

  const resources = resourcesData?.resources || [];
  const counts = resourcesData?.counts || {};

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const openReviewDialog = (resource: TrainingResource, action: "approve" | "reject") => {
    setSelectedResource(resource);
    setReviewNotes("");
    setReviewDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/platform">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Training Content Administration</h1>
              <p className="text-sm text-slate-400">Manage community training content submissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusConfig.pending.color}>
              <Clock className="w-3 h-3 mr-1" />
              {counts.pending || 0} Pending
            </Badge>
            <Badge className={statusConfig.approved.color}>
              <CheckCircle className="w-3 h-3 mr-1" />
              {counts.approved || 0} Approved
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border border-slate-700 mb-6">
            <TabsTrigger value="content" data-testid="tab-content">
              Training Content
            </TabsTrigger>
            <TabsTrigger value="filters" data-testid="tab-filters">
              Filter Requests
              {filterRequests && filterRequests.length > 0 && (
                <Badge className="ml-2 bg-yellow-500/20 text-yellow-400">{filterRequests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search submissions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-700" data-testid="select-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-700" data-testid="select-type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="api">APIs</SelectItem>
                  <SelectItem value="guide">Guides</SelectItem>
                  <SelectItem value="material">Materials</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {resourcesLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              </div>
            ) : resources.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-16 text-center">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                  <h3 className="text-xl font-semibold mb-2">No submissions found</h3>
                  <p className="text-slate-400">There are no training content submissions matching your filters.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {resources.map(resource => {
                  const typeConf = typeConfig[resource.type] || typeConfig.video;
                  const TypeIcon = typeConf.icon;
                  const statusConf = statusConfig[resource.status] || statusConfig.pending;
                  const StatusIcon = statusConf.icon;

                  return (
                    <Card key={resource.id} className="bg-slate-800 border-slate-700" data-testid={`card-resource-${resource.id}`}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 ${typeConf.color}`}>
                            <TypeIcon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={statusConf.color}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {resource.status}
                                  </Badge>
                                  <Badge variant="outline" className="border-slate-600">{typeConf.title}</Badge>
                                  {resource.featured && (
                                    <Badge className="bg-yellow-500/20 text-yellow-400">
                                      <Star className="w-3 h-3 mr-1" />
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-lg font-semibold text-white">{resource.title}</h3>
                                <p className="text-sm text-slate-400 line-clamp-2">{resource.description}</p>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {resource.status === "pending" && (
                                    <>
                                      <DropdownMenuItem onClick={() => openReviewDialog(resource, "approve")}>
                                        <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => openReviewDialog(resource, "reject")}>
                                        <XCircle className="w-4 h-4 mr-2 text-red-400" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuItem onClick={() => updateResourceMutation.mutate({ id: resource.id, featured: !resource.featured })}>
                                    <Star className={`w-4 h-4 mr-2 ${resource.featured ? "text-yellow-400" : ""}`} />
                                    {resource.featured ? "Unfeature" : "Feature"}
                                  </DropdownMenuItem>
                                  {resource.resource_url && (
                                    <DropdownMenuItem asChild>
                                      <a href={resource.resource_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View Content
                                      </a>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {resource.author_name || "Anonymous"}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {resource.likes} likes
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {resource.views} views
                              </span>
                              <span>{formatDate(resource.created_at)}</span>
                            </div>

                            {resource.review_notes && (
                              <div className="mt-2 p-2 bg-slate-700/50 rounded text-sm text-slate-300">
                                <strong>Review notes:</strong> {resource.review_notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="filters">
            {filtersLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              </div>
            ) : !filterRequests || filterRequests.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-16 text-center">
                  <Filter className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                  <h3 className="text-xl font-semibold mb-2">No filter requests</h3>
                  <p className="text-slate-400">There are no pending filter category requests.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterRequests.map(request => (
                  <Card key={request.id} className="bg-slate-800 border-slate-700" data-testid={`card-filter-${request.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="border-slate-600 capitalize">{request.filter_type}</Badge>
                            <Badge className={statusConfig.pending.color}>Pending</Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-white">{request.filter_value}</h3>
                          <p className="text-sm text-slate-400">{request.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {request.requester_name || "Anonymous"}
                            </span>
                            <span>{formatDate(request.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-500 text-green-400 hover:bg-green-500/20"
                            onClick={() => updateFilterMutation.mutate({ id: request.id, status: "approved" })}
                            disabled={updateFilterMutation.isPending}
                            data-testid={`button-approve-filter-${request.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-400 hover:bg-red-500/20"
                            onClick={() => updateFilterMutation.mutate({ id: request.id, status: "rejected" })}
                            disabled={updateFilterMutation.isPending}
                            data-testid={`button-reject-filter-${request.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
            <DialogDescription>
              {selectedResource?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Review Notes (optional)</label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about this decision..."
                className="bg-slate-900 border-slate-600"
                data-testid="input-review-notes"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)} className="border-slate-600">
              Cancel
            </Button>
            <Button
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500/20"
              onClick={() => updateResourceMutation.mutate({ id: selectedResource!.id, status: "rejected", reviewNotes })}
              disabled={updateResourceMutation.isPending}
              data-testid="button-confirm-reject"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-500"
              onClick={() => updateResourceMutation.mutate({ id: selectedResource!.id, status: "approved", reviewNotes })}
              disabled={updateResourceMutation.isPending}
              data-testid="button-confirm-approve"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
