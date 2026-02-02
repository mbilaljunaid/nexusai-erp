import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Users, 
  FolderKanban, 
  CheckSquare, 
  BarChart3,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "lead" | "project" | "task" | "analytics";
  title: string;
  subtitle?: string;
  aiMatch?: boolean;
}

interface GlobalSearchProps {
  onSelect?: (result: SearchResult) => void;
}

export function GlobalSearch({ onSelect }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // todo: remove mock functionality
  const recentSearches: SearchResult[] = [
    { id: "1", type: "lead", title: "Sarah Johnson", subtitle: "TechCorp Inc." },
    { id: "2", type: "project", title: "Website Redesign", subtitle: "Marketing" },
    { id: "3", type: "task", title: "Review Q4 proposal", subtitle: "Due tomorrow" },
  ];

  const searchResults: SearchResult[] = query ? [
    { id: "4", type: "lead", title: "Mark Chen", subtitle: "Acme Corp", aiMatch: true },
    { id: "5", type: "project", title: "Mobile App Development", subtitle: "Engineering" },
    { id: "6", type: "task", title: "Send follow-up emails", subtitle: "3 leads", aiMatch: true },
    { id: "7", type: "analytics", title: "Q4 Sales Report", subtitle: "Generated Nov 28" },
  ] : [];

  const typeIcons = {
    lead: Users,
    project: FolderKanban,
    task: CheckSquare,
    analytics: BarChart3,
  };

  const handleSelect = (result: SearchResult) => {
    onSelect?.(result);
    setOpen(false);
    console.log("Selected:", result);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative w-64 justify-start text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
        data-testid="button-global-search"
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search leads, projects, tasks..." 
          value={query}
          onValueChange={setQuery}
          data-testid="input-search"
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {!query && (
            <CommandGroup heading="Recent">
              {recentSearches.map((result) => {
                const Icon = typeIcons[result.type];
                return (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3"
                    data-testid={`search-result-${result.id}`}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                      )}
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {query && searchResults.length > 0 && (
            <>
              <CommandGroup heading="Results">
                {searchResults.map((result) => {
                  const Icon = typeIcons[result.type];
                  return (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-3"
                      data-testid={`search-result-${result.id}`}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{result.title}</p>
                          {result.aiMatch && (
                            <Sparkles className="h-3 w-3 text-primary" />
                          )}
                        </div>
                        {result.subtitle && (
                          <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                        )}
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="AI Suggestions">
                <CommandItem className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm">Ask AI about "{query}"</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
