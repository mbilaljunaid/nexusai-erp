import { formatDate} from"@/lib/dateUtils";
import { useState, useRef, useEffect, useMemo} from"react";
import { useNexusAI} from"@/contexts/NexusAIContext";
import { Button} from"@/components/ui/button";
import { Input} from"@/components/ui/input";
import { Badge} from"@/components/ui/badge";
import { ScrollArea} from"@/components/ui/scroll-area";
import { cn} from"@/lib/utils";
import { useLocation} from"wouter";
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
  History as HistoryIcon,
  ChevronLeft,
  Search,
  Filter,
  Layers,
  PenLine,
  Zap,
  Check,
  CheckCircle2,
  Clock,
} from"lucide-react";

export function NexusAIPanel() {
  const [panelView, setPanelView] = useState<"chat" |"history">("chat");
  const [showContextBar, setShowContextBar] = useState(false);
  const [, setLocation] = useLocation();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    isOpen,
    isLoading,
    messages,
    currentModule,
    capabilities,
    activeProvider,
    error,
    toggle,
    close,
    sendMessage,
    clearMessages,
    conversations,
    loadConversation,
    startNewConversation,
    additionalContextModules,
    setAdditionalContextModules,
    manualContext,
    setManualContext,
    agentMode,
    setAgentMode,
    activePage,
    pageMetadata,
    executeTool,
    nudges,
 } = useNexusAI();

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
     }
   }
 }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const content = input;
    setInput("");
    await sendMessage(content);
 };

  const handleNewConversation = () => {
    startNewConversation();
    setPanelView("chat");
 };

  const { quickActions, contextualSuggestions} = useMemo(() => {
    const caps = capabilities.find(c => c.module === currentModule);
    return {
      quickActions: caps?.quickActions || [],
      contextualSuggestions: caps?.insights || []
   };
 }, [capabilities, currentModule]);

  return (
    <>
      {/* FAB Trigger moved to global layout or rendered here if not already present */}
      {!isOpen && (
        <Button
          onClick={toggle}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 hover:scale-110 transition-all duration-300 group"
          title="Open NexusAI"
        >
          <div className="relative">
            <Brain className="h-6 w-6 text-primary-foreground group-hover:rotate-12 transition-transform" />
            {nudges && nudges.length > 0 && (
              <span className="absolute -top-3 -right-3 h-5 w-5 bg-destructive rounded-full border-2 border-background flex items-center justify-center text-[10px] text-destructive-foreground font-bold animate-pulse">
                {nudges.length}
              </span>
            )}
          </div>
        </Button>
      )}

      {/* Slide-over panel */}
      <div
        className={cn(
         "fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ?"translate-x-0" :"translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            {panelView ==="history" && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPanelView("chat")} title="Back to chat" aria-label="Previous">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">
                {panelView ==="history" ?"Conversation History" :"NexusAI"}
              </h2>
              {panelView ==="chat" && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {currentModule}
                  </Badge>
                  {additionalContextModules.map(mod => (
                    <Badge key={mod} variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                      +{mod}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {panelView ==="chat" && (
              <>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => setShowContextBar(prev => !prev)}
                  title="Context & Agent settings" aria-label="Layers"
                >
                  <Layers className={cn("h-4 w-4", showContextBar ?"text-primary" :"text-muted-foreground")} />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => setPanelView("history")}
                  title="Conversation history" aria-label="History"
                >
                  <HistoryIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8"
                  onClick={handleNewConversation}
                  title="New conversation" aria-label="New message"
                >
                  <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearMessages} title="Delete conversation" aria-label="Delete">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={close} title="Close panel" aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ═══ Context & Agent Bar ═══ */}
        {showContextBar && panelView ==="chat" && (
          <div className="px-4 py-3 border-b border-border bg-muted/20 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                <Zap className="h-3 w-3" /> Agent Mode
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["auditor","planner","executor","verifier","general"] as const).map(m => (
                  <Button variant="default" size="sm"
                    key={m}
                    onClick={() => setAgentMode(m)}
                    className={cn(
                     "text-[10px] px-2 py-1 rounded-md border capitalize transition-colors",
                      agentMode === m
                        ?"bg-primary text-primary-foreground border-primary"
                        :"border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                <Layers className="h-3 w-3" /> Multi-Module Context
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Finance","Accounts Payable","Accounts Receivable","Fixed Assets","Cash Management",
                 "CRM","Human Resources","Projects","Supply Chain","Manufacturing","Intercompany"
                ].map(mod => {
                  const isActive = currentModule === mod || additionalContextModules.includes(mod);
                  const isCurrentRoute = currentModule === mod;
                  return (
                    <Button variant="default" size="sm"
                      key={mod}
                      onClick={() => {
                        if (isCurrentRoute) return;
                        setAdditionalContextModules(prev =>
                          prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
                        );
                     }}
                      className={cn(
                       "text-[10px] px-2 py-1 rounded-full border transition-colors",
                        isCurrentRoute
                          ?"bg-primary/10 border-primary/30 text-primary cursor-default"
                          : isActive
                            ?"bg-accent border-accent text-accent-foreground"
                            :"border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {mod}
                    </Button>
                  );
               })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                <PenLine className="h-3 w-3" /> Manual Context
              </div>
              <Input
                placeholder="e.g., Working on Q1 budget..."
                value={manualContext}
                onChange={e => setManualContext(e.target.value)}
                className="h-8 text-xs font-medium"
              />
            </div>
          </div>
        )}

        {/* ═══ Nudges Bar (HR) ═══ */}
        {nudges && nudges.length > 0 && panelView ==="chat" && (
          <div className="px-4 py-2 border-b border-border bg-emerald-50/50 flex gap-2 overflow-x-auto scrollbar-hide">
            {nudges.map((n: any) => (
              <Button variant="default" size="sm"
                key={n.id}
                onClick={() => setInput(n.text)}
                className="flex-shrink-0 border text-[10px] text-emerald-700 flex items-center gap-1.5 shadow-sm hover: transition-colors italic whitespace-nowrap"
              >
                <Clock className="h-3 w-3" /> {n.text}
              </Button>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {panelView ==="history" ? (
            <ScrollArea className="flex-1 px-4">
              <div className="py-4 space-y-3">
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search conversations..." className="pl-9 h-9 text-xs" />
                </div>
                {conversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-xs">No conversations found</div>
                ) : (
                  conversations.map(convo => (
                    <Button variant="default"
                      key={convo.id}
                      onClick={() => loadConversation(convo.id)}
                      className={cn(
                       "w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group relative",
                        convo.id === conversations[0]?.id &&"bg-muted/30"
                      )}
                    >
                      <div className="font-medium text-xs truncate pr-6">{convo.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2">
                        <span className="capitalize">{convo.moduleContext}</span>
                        <span>•</span>
                        <span>{convo.updatedAt ? formatDate(convo.updatedAt) :'Just now'}</span>
                      </div>
                      <div className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
              <div className="py-4 space-y-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center animate-pulse">
                      <Brain className="h-8 w-8 text-primary/40" />
                    </div>
                    <h3 className="text-sm font-medium text-foreground mb-1">How can I help?</h3>
                    <p className="text-xs text-muted-foreground max-w-64">
                      I'm context-aware and can assist with {currentModule} tasks and insights.
                    </p>

                    {/* Proactive Quick Actions */}
                    {quickActions.length > 0 && (
                      <div className="mt-4 w-full space-y-3">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase text-center tracking-widest mb-2">
                          Proactive Actions for this page
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {quickActions.map((action, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start gap-2 h-10 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 text-primary transition-all group"
                              onClick={() => {
                                sendMessage(action.prompt);
                             }}
                            >
                              <Sparkles className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
                              <span className="font-bold text-xs">{action.label}</span>
                            </Button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 py-2">
                          <div className="h-px flex-1 bg-border/50" />
                          <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-tighter">or try a suggestion</span>
                          <div className="h-px flex-1 bg-border/50" />
                        </div>
                      </div>
                    )}

                    <div className="mt-2 w-full space-y-2">
                      {contextualSuggestions.map((suggestion, i) => (
                        <Button variant="default" size="sm"
                          key={i}
                          className="w-full text-left text-xs border hover:/50 hover:/20 transition-colors flex items-center gap-2 group"
                          onClick={() => setInput(suggestion)}
                        >
                          <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {suggestion}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={cn("flex", msg.role ==="user" ?"justify-end" :"justify-start")}>
                      <div className={cn(
                       "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed relative group",
                        msg.role ==="user" ?"bg-primary text-primary-foreground rounded-br-sm" :"bg-muted text-foreground rounded-bl-sm"
                      )}>
                        {msg.role ==="assistant" && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Brain className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-bold text-primary tracking-tight">NexusAI</span>
                            {msg.moduleContext && <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-primary/20">{msg.moduleContext}</Badge>}
                          </div>
                        )}
                        <div className="whitespace-pre-wrap break-words">{msg.content}</div>

                        {/* Suggested Actions */}
                        {(msg.actionType ==="confirmation" || (msg.toolCalls && msg.toolCalls.some(tc => !tc.result))) && msg.actionDetails && (
                          <div className="mt-3 p-3 border rounded-lg bg-card text-card-foreground shadow-sm animate-in zoom-in-95 duration-200">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1.5">
                              <Sparkles className="h-3 w-3 text-primary" /> Action Proposal
                            </div>
                            <div className="text-xs font-bold">{msg.actionDetails.entity}: {msg.actionDetails.type}</div>
                            <Button
                              size="sm"
                              className="h-8 w-full mt-3 gap-1.5 text-xs font-bold"
                              onClick={() => executeTool(msg.actionDetails!.type, msg.actionDetails!.params)}
                            >
                              <Check className="h-3.5 w-3.5" /> Confirm Execution
                            </Button>
                          </div>
                        )}

                        {/* Execution Results */}
                        {msg.toolCalls && msg.toolCalls.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
                            {msg.toolCalls.map((tc, idx) => (
                              <div key={idx} className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold uppercase tracking-tight">
                                  <CheckCircle2 className="h-3 w-3" /> Result: {tc.name}
                                </div>
                                {tc.result && (
                                  <div className="bg-background/50 border border-border/30 rounded p-2 overflow-x-auto max-h-40">
                                    <pre className="text-[10px] font-mono text-muted-foreground">
                                      {typeof tc.result ==='string' ? tc.result : JSON.stringify(tc.result, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground font-medium italic">NexusAI is thinking...</span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer Input */}
        {panelView ==="chat" && (
          <div className="p-4 bg-background border-t border-border mt-auto">
            <div className="relative flex items-center">
              <Input
                ref={inputRef}
                placeholder="Message NexusAI..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key ==="Enter" && handleSend()}
                className="pr-10 h-10 text-sm font-medium py-6"
                disabled={isLoading}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 text-muted-foreground hover:text-primary h-8 w-8"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                title="Send message" aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
