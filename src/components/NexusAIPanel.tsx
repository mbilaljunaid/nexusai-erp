import { useState, useRef, useEffect } from "react";
import { useNexusAI } from "@/contexts/NexusAIContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Brain,
  X,
  Send,
  Loader2,
  Sparkles,
  Trash2,
  ChevronRight,
  AlertCircle,
  Settings,
  MessageSquarePlus,
  History,
  ChevronLeft,
  Search,
  Filter,
  Layers,
  PenLine,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";

type PanelView = "chat" | "history";

export function NexusAIPanel() {
  const {
    isOpen,
    isLoading,
    messages,
    currentModule,
    currentCapabilities,
    activeProvider,
    error,
    toggle,
    close,
    sendMessage,
    clearMessages,
    conversations,
    activeConversationId,
    loadConversation,
    startNewConversation,
    deleteConversation,
    additionalContextModules,
    setAdditionalContextModules,
    manualContext,
    setManualContext,
  } = useNexusAI();

  const [input, setInput] = useState("");
  const [panelView, setPanelView] = useState<PanelView>("chat");
  const [historySearch, setHistorySearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [showContextBar, setShowContextBar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  // Derive unique modules from conversations
  const conversationModules = Array.from(
    new Set(conversations.map(c => c.moduleContext).filter(Boolean))
  ) as string[];

  // Filter conversations by search + module
  const filteredConversations = conversations.filter(convo => {
    const matchesModule = moduleFilter === "all" || convo.moduleContext === moduleFilter;
    if (!historySearch.trim()) return matchesModule;
    const q = historySearch.toLowerCase();
    const titleMatch = (convo.title || "").toLowerCase().includes(q);
    const moduleMatch = (convo.moduleContext || "").toLowerCase().includes(q);
    return matchesModule && (titleMatch || moduleMatch);
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current && panelView === "chat") {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, panelView]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLoadConversation = async (id: string) => {
    await loadConversation(id);
    setPanelView("chat");
  };

  const handleNewConversation = () => {
    startNewConversation();
    setPanelView("chat");
  };

  // Suggested prompts based on current module
  const contextualSuggestions = currentCapabilities
    .filter(c => c.id !== "general")
    .flatMap(c => c.insights.slice(0, 2));

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={toggle}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
          aria-label="Open NexusAI"
        >
          <Brain className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
        </button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-200"
          onClick={close}
        />
      )}

      {/* Slide-over panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-background border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            {panelView === "history" && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPanelView("chat")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">
                {panelView === "history" ? "Conversation History" : "NexusAI"}
              </h2>
              {panelView === "chat" && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {currentModule}
                  </Badge>
                  {additionalContextModules.map(mod => (
                    <Badge key={mod} variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                      +{mod}
                    </Badge>
                  ))}
                  {activeProvider && (
                    <span className="text-[10px] text-muted-foreground">
                      {activeProvider.provider} · {activeProvider.model}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {panelView === "chat" && (
              <>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => setShowContextBar(prev => !prev)}
                  title="Context settings"
                >
                  <Layers className={cn("h-4 w-4", showContextBar ? "text-primary" : "text-muted-foreground")} />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => setPanelView("history")}
                  title="Conversation history"
                >
                  <History className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8"
                  onClick={handleNewConversation}
                  title="New conversation"
                >
                  <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearMessages} title="Delete conversation">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={close}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* No Provider Warning */}
        {!activeProvider && panelView === "chat" && (
          <div className="mx-4 mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-destructive">No AI Provider Configured</p>
              <p className="text-muted-foreground mt-0.5">
                Go to Platform Admin → AI Configuration to add a provider.
              </p>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs mt-1"
                onClick={() => { navigate("/admin/platform"); close(); }}
              >
                <Settings className="h-3 w-3 mr-1" /> Configure AI Provider
              </Button>
            </div>
          </div>
        )}
        {/* ═══ Context Bar ═══ */}
        {showContextBar && panelView === "chat" && (
          <div className="px-4 py-3 border-b border-border bg-muted/20 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              <Layers className="h-3 w-3" /> Multi-Module Context
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Finance", "Accounts Payable", "Accounts Receivable", "Fixed Assets", "Cash Management",
                "CRM", "Human Resources", "Projects", "Supply Chain", "Manufacturing", "Intercompany"
              ].map(mod => {
                const isActive = currentModule === mod || additionalContextModules.includes(mod);
                const isCurrentRoute = currentModule === mod;
                return (
                  <button
                    key={mod}
                    onClick={() => {
                      if (isCurrentRoute) return; // Can't toggle route-based context
                      setAdditionalContextModules(prev =>
                        prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
                      );
                    }}
                    className={cn(
                      "text-[10px] px-2 py-1 rounded-full border transition-colors",
                      isCurrentRoute
                        ? "bg-primary/10 border-primary/30 text-primary cursor-default"
                        : isActive
                          ? "bg-accent border-accent text-accent-foreground"
                          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {mod}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              <PenLine className="h-3 w-3" /> Manual Context
            </div>
            <Input
              placeholder="e.g., Working on Q1 budget for marketing department..."
              value={manualContext}
              onChange={e => setManualContext(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        )}


        {panelView === "history" && (
          <ScrollArea className="flex-1 px-4">
            <div className="py-4 space-y-3">
              {/* Search & Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                    className="pl-8 h-9 text-xs"
                  />
                  {historySearch && (
                    <button
                      className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setHistorySearch("")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {conversationModules.length > 1 && (
                  <Select value={moduleFilter} onValueChange={setModuleFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <Filter className="h-3 w-3 mr-1.5 text-muted-foreground" />
                      <SelectValue placeholder="All modules" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      {conversationModules.map(mod => (
                        <SelectItem key={mod} value={mod}>{mod}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-xs h-9"
                onClick={handleNewConversation}
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                Start New Conversation
              </Button>

              {filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {conversations.length === 0 ? "No conversation history yet" : "No conversations match your search"}
                  </p>
                </div>
              ) : (
                filteredConversations.map(convo => (
                  <div
                    key={convo.id}
                    className={cn(
                      "group flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors",
                      activeConversationId === convo.id && "bg-primary/5 border-primary/20"
                    )}
                    onClick={() => handleLoadConversation(convo.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{convo.title || "Untitled"}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {convo.moduleContext && (
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">
                            {convo.moduleContext}
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {convo.updatedAt
                            ? new Date(convo.updatedAt).toLocaleDateString(undefined, {
                                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                              })
                            : ""}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={(e) => { e.stopPropagation(); deleteConversation(convo.id); }}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}

        {/* ═══ Chat View ═══ */}
        {panelView === "chat" && (
          <>
            {/* Messages area */}
            <ScrollArea className="flex-1 px-4" ref={scrollRef}>
              <div className="py-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
                      <Sparkles className="h-8 w-8 text-primary/40" />
                    </div>
                    <h3 className="text-sm font-medium text-foreground mb-1">How can I help?</h3>
                    <p className="text-xs text-muted-foreground max-w-[260px]">
                      I'm context-aware and can assist with {currentModule} tasks, analysis, and navigation.
                    </p>

                    {/* Contextual suggestions */}
                    {contextualSuggestions.length > 0 && (
                      <div className="mt-6 w-full space-y-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                          Suggestions for {currentModule}
                        </p>
                        {contextualSuggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            className="w-full text-left text-xs p-2.5 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/20 transition-colors flex items-center gap-2 group"
                            onClick={() => {
                              setInput(suggestion);
                              inputRef.current?.focus();
                            }}
                          >
                            <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                              {suggestion}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Recent conversations shortcut */}
                    {conversations.length > 0 && (
                      <button
                        className="mt-4 text-xs text-primary hover:underline flex items-center gap-1"
                        onClick={() => setPanelView("history")}
                      >
                        <History className="h-3 w-3" />
                        View {conversations.length} past conversation{conversations.length !== 1 ? "s" : ""}
                      </button>
                    )}
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        )}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <Brain className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-medium text-primary">NexusAI</span>
                            {msg.moduleContext && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                                {msg.moduleContext}
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                        {msg.toolCalls && msg.toolCalls.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                            {msg.toolCalls.map((tc, i) => (
                              <div key={i}>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Sparkles className="h-2.5 w-2.5 text-primary" />
                                  <span className="font-medium">Tool: {tc.name}</span>
                                  {tc.result && <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 ml-1 text-emerald-600 border-emerald-300">✓ executed</Badge>}
                                </div>
                                {tc.result && (
                                  <pre className="mt-1 text-[10px] bg-background/50 rounded p-1.5 overflow-x-auto max-h-32 text-muted-foreground">
                                    {typeof tc.result === "string" ? tc.result : JSON.stringify(tc.result, null, 2)}
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Streaming response...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input area */}
            <div className="p-3 border-t border-border bg-muted/20">
              {error && !messages.length && (
                <p className="text-[10px] text-destructive mb-2 px-1">{error}</p>
              )}
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  placeholder={activeProvider ? `Ask NexusAI about ${currentModule}...` : "Configure AI provider first..."}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || !activeProvider}
                  className="text-sm h-10"
                />
                <Button
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || !activeProvider}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
                NexusAI uses your configured provider. Responses may vary by model.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
