import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Header, Footer } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video, FileCode2, FileText, FolderOpen, Search, Heart, Eye, 
  Clock, User, Filter, ArrowUpRight, Plus, Star, ThumbsUp, Loader2,
  BookOpen, Sparkles
} from "lucide-react";
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
  likes: number;
  views: number;
  featured: boolean;
  created_at: string;
}

interface FiltersData {
  modules: { slug: string; name: string }[];
  industries: { slug: string; name: string }[];
  apps: { id: string; name: string }[];
  difficulties: string[];
  types: string[];
}

const typeConfig: Record<string, { icon: any; color: string; title: string; description: string }> = {
  video: { icon: Video, color: "text-red-400", title: "Training Videos", description: "Community video tutorials and walkthroughs" },
  api: { icon: FileCode2, color: "text-cyan-400", title: "APIs & Integrations", description: "API documentation and integration samples" },
  guide: { icon: FileText, color: "text-yellow-400", title: "User Guides", description: "Step-by-step tutorials and how-to guides" },
  material: { icon: FolderOpen, color: "text-emerald-400", title: "Training Materials", description: "Courses, learning paths, and resources" },
  tutorial: { icon: BookOpen, color: "text-purple-400", title: "Tutorials", description: "Interactive learning tutorials" },
};

export default function TrainingContent() {
  const [, params] = useRoute("/training/:type");
  const contentType = params?.type || "videos";
  const type = contentType === "videos" ? "video" : contentType === "apis" ? "api" : contentType === "guides" ? "guide" : contentType === "materials" ? "material" : "video";
  
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const config = typeConfig[type] || typeConfig.video;
  const Icon = config.icon;

  const { data: filtersData } = useQuery<FiltersData>({
    queryKey: ["/api/training/filters"],
  });

  const { data: resourcesData, isLoading } = useQuery<{ resources: TrainingResource[]; counts: Record<string, number> }>({
    queryKey: ["/api/training", type, selectedModule, selectedIndustry, selectedDifficulty, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("type", type);
      if (selectedModule) params.set("module", selectedModule);
      if (selectedIndustry) params.set("industry", selectedIndustry);
      if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
      if (search) params.set("search", search);
      const res = await fetch(`/api/training?${params.toString()}`, {
        headers: { "x-tenant-id": "tenant1", "x-user-id": "user1", "x-user-role": "admin" },
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      return apiRequest("POST", `/api/training/${resourceId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
      toast({ title: "Success", description: "Your like has been recorded!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Please sign in to like content", variant: "destructive" });
    },
  });

  const resources = resourcesData?.resources || [];
  const counts = resourcesData?.counts || {};

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "intermediate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "advanced": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-xl bg-slate-800 ${config.color}`}>
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" data-testid="text-page-title">{config.title}</h1>
                <p className="text-slate-400">{config.description}</p>
              </div>
            </div>

            <Tabs value={type} className="mb-6">
              <TabsList className="bg-slate-800 border border-slate-700">
                <Link to="/training/videos">
                  <TabsTrigger value="video" className="data-[state=active]:bg-red-600" data-testid="tab-videos">
                    <Video className="w-4 h-4 mr-2" />
                    Videos {counts.video ? `(${counts.video})` : ""}
                  </TabsTrigger>
                </Link>
                <Link to="/training/apis">
                  <TabsTrigger value="api" className="data-[state=active]:bg-cyan-600" data-testid="tab-apis">
                    <FileCode2 className="w-4 h-4 mr-2" />
                    APIs {counts.api ? `(${counts.api})` : ""}
                  </TabsTrigger>
                </Link>
                <Link to="/training/guides">
                  <TabsTrigger value="guide" className="data-[state=active]:bg-yellow-600" data-testid="tab-guides">
                    <FileText className="w-4 h-4 mr-2" />
                    Guides {counts.guide ? `(${counts.guide})` : ""}
                  </TabsTrigger>
                </Link>
                <Link to="/training/materials">
                  <TabsTrigger value="material" className="data-[state=active]:bg-emerald-600" data-testid="tab-materials">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Materials {counts.material ? `(${counts.material})` : ""}
                  </TabsTrigger>
                </Link>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700"
                  data-testid="input-search"
                />
              </div>
              <Button 
                variant="outline" 
                className="border-slate-600"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Link to="/contributor/training/submit">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500" data-testid="button-submit-content">
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Content
                </Button>
              </Link>
            </div>

            {showFilters && (
              <Card className="bg-slate-800 border-slate-700 mb-6">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">Module</label>
                      <Select value={selectedModule} onValueChange={setSelectedModule}>
                        <SelectTrigger className="bg-slate-900 border-slate-600" data-testid="select-module">
                          <SelectValue placeholder="All Modules" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Modules</SelectItem>
                          {filtersData?.modules?.map(m => (
                            <SelectItem key={m.slug} value={m.slug}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">Industry</label>
                      <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                        <SelectTrigger className="bg-slate-900 border-slate-600" data-testid="select-industry">
                          <SelectValue placeholder="All Industries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Industries</SelectItem>
                          {filtersData?.industries?.map(i => (
                            <SelectItem key={i.slug} value={i.slug}>{i.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">Difficulty</label>
                      <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger className="bg-slate-900 border-slate-600" data-testid="select-difficulty">
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Levels</SelectItem>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              </div>
            ) : resources.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-16 text-center">
                  <Icon className={`w-16 h-16 mx-auto mb-4 ${config.color} opacity-50`} />
                  <h3 className="text-xl font-semibold mb-2">No content yet</h3>
                  <p className="text-slate-400 mb-6">Be the first to contribute {config.title.toLowerCase()}!</p>
                  <Link to="/contributor/training/submit">
                    <Button className="bg-blue-600 hover:bg-blue-500">
                      <Plus className="w-4 h-4 mr-2" />
                      Submit Content
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {resources.map(resource => (
                  <Card 
                    key={resource.id} 
                    className={`bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors ${resource.featured ? "ring-2 ring-yellow-500/30" : ""}`}
                    data-testid={`card-resource-${resource.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {resource.thumbnail_url ? (
                          <img 
                            src={resource.thumbnail_url} 
                            alt={resource.title}
                            className="w-40 h-24 object-cover rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div className={`w-40 h-24 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 ${config.color}`}>
                            <Icon className="w-8 h-8" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {resource.featured && (
                                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                    <Star className="w-3 h-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                                <Badge className={getDifficultyColor(resource.difficulty)}>
                                  {resource.difficulty}
                                </Badge>
                              </div>
                              <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{resource.title}</h3>
                              <p className="text-sm text-slate-400 line-clamp-2 mb-2">{resource.description}</p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => likeMutation.mutate(resource.id)}
                              disabled={likeMutation.isPending}
                              className="flex-shrink-0"
                              data-testid={`button-like-${resource.id}`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
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
                            {resource.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {resource.duration}
                              </span>
                            )}
                            <span>{formatDate(resource.created_at)}</span>
                          </div>

                          {(resource.modules?.length > 0 || resource.industries?.length > 0) && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {resource.modules?.slice(0, 3).map(m => (
                                <Badge key={m} variant="outline" className="text-xs border-slate-600">{m}</Badge>
                              ))}
                              {resource.industries?.slice(0, 2).map(i => (
                                <Badge key={i} variant="outline" className="text-xs border-slate-600">{i}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {resource.resource_url && (
                          <a 
                            href={resource.resource_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-shrink-0"
                          >
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-500" data-testid={`button-view-${resource.id}`}>
                              View
                              <ArrowUpRight className="w-3 h-3 ml-1" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <aside className="w-full lg:w-80 space-y-6">
            <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Become a Contributor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 mb-4">
                  Share your knowledge and earn reputation points! Get recognized for your contributions to the NexusAI community.
                </p>
                <ul className="text-sm text-slate-400 space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-400" />
                    Earn 5 points per like
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Earn 20-50 points per approved content
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    Build your reputation
                  </li>
                </ul>
                <Link to="/contributor/training/submit">
                  <Button className="w-full bg-blue-600 hover:bg-blue-500" data-testid="button-contribute-sidebar">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Content
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Content Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(typeConfig).map(([key, cfg]) => {
                  const TypeIcon = cfg.icon;
                  return (
                    <Link key={key} to={`/training/${key === "video" ? "videos" : key === "api" ? "apis" : key === "guide" ? "guides" : "materials"}`}>
                      <div className={`flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer ${type === key ? "bg-slate-700" : ""}`}>
                        <TypeIcon className={`w-5 h-5 ${cfg.color}`} />
                        <span className="text-sm">{cfg.title}</span>
                        {counts[key] && (
                          <Badge variant="outline" className="ml-auto text-xs">{counts[key]}</Badge>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Request New Filter</CardTitle>
                <CardDescription>Missing a module or industry?</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/contributor/training/filter-request">
                  <Button variant="outline" className="w-full border-slate-600" data-testid="button-request-filter">
                    Request New Category
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
