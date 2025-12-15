import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header, Footer } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { 
  Video, FileCode2, FileText, FolderOpen, ArrowLeft, Loader2, 
  CheckCircle, Plus, X, Sparkles
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FiltersData {
  modules: { slug: string; name: string }[];
  industries: { slug: string; name: string }[];
  apps: { id: string; name: string }[];
  difficulties: string[];
  types: string[];
}

const resourceSchema = z.object({
  type: z.enum(["video", "api", "guide", "material", "tutorial"]),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  resourceUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  thumbnailUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  duration: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  modules: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  apps: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

const filterRequestSchema = z.object({
  filterType: z.enum(["module", "industry", "app"]),
  filterValue: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type ResourceFormData = z.infer<typeof resourceSchema>;
type FilterRequestFormData = z.infer<typeof filterRequestSchema>;

const typeConfig: Record<string, { icon: any; color: string; title: string }> = {
  video: { icon: Video, color: "text-red-400", title: "Training Video" },
  api: { icon: FileCode2, color: "text-cyan-400", title: "API Documentation" },
  guide: { icon: FileText, color: "text-yellow-400", title: "User Guide" },
  material: { icon: FolderOpen, color: "text-emerald-400", title: "Training Material" },
  tutorial: { icon: FileText, color: "text-purple-400", title: "Tutorial" },
};

export default function TrainingContentSubmit() {
  const [, setLocation] = useLocation();
  const [, filterParams] = useRoute("/contributor/training/filter-request");
  const isFilterRequest = filterParams !== null;
  const { toast } = useToast();
  
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const { data: filtersData } = useQuery<FiltersData>({
    queryKey: ["/api/training/filters"],
  });

  const resourceForm = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      type: "video",
      title: "",
      description: "",
      resourceUrl: "",
      thumbnailUrl: "",
      duration: "",
      difficulty: "beginner",
      modules: [],
      industries: [],
      apps: [],
      tags: [],
    },
  });

  const filterForm = useForm<FilterRequestFormData>({
    resolver: zodResolver(filterRequestSchema),
    defaultValues: {
      filterType: "module",
      filterValue: "",
      description: "",
    },
  });

  const submitResourceMutation = useMutation({
    mutationFn: async (data: ResourceFormData) => {
      return apiRequest("POST", "/api/training", {
        ...data,
        modules: selectedModules,
        industries: selectedIndustries,
        tags,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/training"] });
      toast({ title: "Success!", description: "Your content has been submitted for review." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Please sign in to submit content", variant: "destructive" });
    },
  });

  const submitFilterMutation = useMutation({
    mutationFn: async (data: FilterRequestFormData) => {
      return apiRequest("POST", "/api/training/filter-request", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Success!", description: "Your filter request has been submitted." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Please sign in to request filters", variant: "destructive" });
    },
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const toggleModule = (module: string) => {
    setSelectedModules(prev => 
      prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module]
    );
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry) ? prev.filter(i => i !== industry) : [...prev, industry]
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="bg-green-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Submitted Successfully!</h1>
          <p className="text-slate-400 mb-8">
            {isFilterRequest 
              ? "Your filter request has been submitted and will be reviewed by our team."
              : "Your content has been submitted and will be reviewed by our team. Once approved, it will appear in the training content library and you'll earn reputation points!"
            }
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/training/videos">
              <Button className="bg-blue-600 hover:bg-blue-500">
                Browse Content
              </Button>
            </Link>
            <Button variant="outline" onClick={() => setSubmitted(false)} className="border-slate-600">
              Submit Another
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/training/videos">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Training Content
          </Button>
        </Link>

        {isFilterRequest ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                Request New Filter Category
              </CardTitle>
              <CardDescription>
                Request a new module, industry, or app filter to be added to the training content library.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...filterForm}>
                <form onSubmit={filterForm.handleSubmit((data) => submitFilterMutation.mutate(data))} className="space-y-6">
                  <FormField
                    control={filterForm.control}
                    name="filterType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Filter Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-900 border-slate-600" data-testid="select-filter-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="module">Module</SelectItem>
                            <SelectItem value="industry">Industry</SelectItem>
                            <SelectItem value="app">App/Integration</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={filterForm.control}
                    name="filterValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-slate-900 border-slate-600" placeholder="e.g., Healthcare, Project Management" data-testid="input-filter-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={filterForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="bg-slate-900 border-slate-600 min-h-[100px]" placeholder="Explain why this filter should be added..." data-testid="input-filter-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-500"
                    disabled={submitFilterMutation.isPending}
                    data-testid="button-submit-filter"
                  >
                    {submitFilterMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-400" />
                Submit Training Content
              </CardTitle>
              <CardDescription>
                Share your knowledge with the NexusAI community. All submissions are reviewed before publishing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...resourceForm}>
                <form onSubmit={resourceForm.handleSubmit((data) => submitResourceMutation.mutate(data))} className="space-y-6">
                  <FormField
                    control={resourceForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-900 border-slate-600" data-testid="select-content-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(typeConfig).map(([key, cfg]) => {
                              const Icon = cfg.icon;
                              return (
                                <SelectItem key={key} value={key}>
                                  <span className="flex items-center gap-2">
                                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                                    {cfg.title}
                                  </span>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={resourceForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-slate-900 border-slate-600" placeholder="e.g., Getting Started with NexusAI CRM" data-testid="input-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={resourceForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="bg-slate-900 border-slate-600 min-h-[100px]" placeholder="Describe what users will learn..." data-testid="input-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={resourceForm.control}
                      name="resourceUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resource URL</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-slate-900 border-slate-600" placeholder="https://..." data-testid="input-url" />
                          </FormControl>
                          <FormDescription>Link to your content</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={resourceForm.control}
                      name="thumbnailUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thumbnail URL (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-slate-900 border-slate-600" placeholder="https://..." data-testid="input-thumbnail" />
                          </FormControl>
                          <FormDescription>Preview image</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={resourceForm.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-slate-900 border-slate-600" data-testid="select-difficulty">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={resourceForm.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-slate-900 border-slate-600" placeholder="e.g., 15 min, 2 hours" data-testid="input-duration" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormLabel className="block mb-2">Modules (optional)</FormLabel>
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-900 border border-slate-600 rounded-md max-h-40 overflow-y-auto">
                      {filtersData?.modules?.map(m => (
                        <Badge
                          key={m.slug}
                          variant={selectedModules.includes(m.slug) ? "default" : "outline"}
                          className={`cursor-pointer ${selectedModules.includes(m.slug) ? "bg-blue-600" : "border-slate-500"}`}
                          onClick={() => toggleModule(m.slug)}
                        >
                          {m.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FormLabel className="block mb-2">Industries (optional)</FormLabel>
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-900 border border-slate-600 rounded-md max-h-40 overflow-y-auto">
                      {filtersData?.industries?.map(i => (
                        <Badge
                          key={i.slug}
                          variant={selectedIndustries.includes(i.slug) ? "default" : "outline"}
                          className={`cursor-pointer ${selectedIndustries.includes(i.slug) ? "bg-green-600" : "border-slate-500"}`}
                          onClick={() => toggleIndustry(i.slug)}
                        >
                          {i.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FormLabel className="block mb-2">Tags (optional)</FormLabel>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        className="bg-slate-900 border-slate-600"
                        placeholder="Add a tag..."
                        data-testid="input-tag"
                      />
                      <Button type="button" variant="outline" onClick={addTag} className="border-slate-600">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
                    disabled={submitResourceMutation.isPending}
                    data-testid="button-submit-content"
                  >
                    {submitResourceMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit for Review"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
