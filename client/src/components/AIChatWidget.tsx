
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Send, Bot, User, X, Sparkles, Check, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Message {
    id: string;
    role: "user" | "system";
    content: string;
    type?: "text" | "action-confirmation" | "result";
    actionData?: any; // For pending actions
    resultData?: any; // For executed results
    originalInput?: string; // To re-send for execution if needed
}

interface AIChatWidgetProps {
    context?: string;
    userId?: string;
}

export function AIChatWidget({ context = "general", userId = "user-1" }: AIChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "system", content: "Hello! I'm your AI Controller. Ask me to post journals or create invoices.", type: "text" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, type: "text" };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // 1. Parse Intent (using new Agentic Engine endpoint)
            const res = await apiRequest("POST", "/api/intent/parse", { text: userMsg.content, context });
            const analysis = await res.json();
            // Expected: { actionCode: string | null, params: any, confidence: number }

            if (analysis.actionCode && analysis.confidence > 0.6) {
                // 2. Propose Action
                const systemMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "system",
                    content: `I can help with that. I've detected you want to run: ${analysis.actionCode}.`,
                    type: "action-confirmation",
                    originalInput: userMsg.content,
                    actionData: {
                        actionCode: analysis.actionCode,
                        params: analysis.params,
                        confidence: analysis.confidence
                    }
                };
                setMessages(prev => [...prev, systemMsg]);
            } else {
                // Fallback for unclear intent
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: "system",
                    content: "I'm not sure what you mean. Try saying 'Post a journal for supplies'.",
                    type: "text"
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: "system", content: "Error connecting to AI service.", type: "text" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const executeAction = async (msg: Message) => {
        setIsLoading(true);
        // Optimistic update to show we are starting
        const systemMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, {
            id: systemMsgId,
            role: "system",
            content: "Initializing execution...",
            type: "text"
        }]);

        try {
            // Use streaming endpoint
            const response = await fetch(`/api/intent/stream-execute?text=${encodeURIComponent(msg.originalInput || "")}&userId=${encodeURIComponent(userId)}&context=${encodeURIComponent(context)}`);

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                const lines = buffer.split("\n\n");
                buffer = lines.pop() || ""; // Keep incomplete line

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const dataStr = line.slice(6);
                        try {
                            const data = JSON.parse(dataStr);

                            if (data.type === "status") {
                                // Update the last message with status
                                setMessages(prev => prev.map(m =>
                                    m.id === systemMsgId ? { ...m, content: `[${data.step}] ${data.message}` } : m
                                ));
                            } else if (data.type === "result") {
                                // Final result
                                setMessages(prev => [...prev, {
                                    id: Date.now().toString(),
                                    role: "system",
                                    content: "Execution completed.",
                                    type: "result",
                                    resultData: data.result
                                }]);
                            } else if (data.type === "error") {
                                setMessages(prev => [...prev, {
                                    id: Date.now().toString(),
                                    role: "system",
                                    content: `Error: ${data.message}`,
                                    type: "text"
                                }]);
                            }
                        } catch (e) {
                            console.error("Failed to parse stream data", e);
                        }
                    }
                }
            }
        } catch (error: any) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "system",
                content: `Execution failed: ${error.message}`,
                type: "text"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Render Result Content based on data type
    const renderResult = (data: any) => {
        return <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">{JSON.stringify(data, null, 2)}</pre>;
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {/* Chat Window */}
            {isOpen && (
                <Card className="w-[380px] h-[500px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-5">
                    <CardHeader className="p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Bot className="h-5 w-5" />
                                <div>
                                    <CardTitle className="text-sm font-bold">Ask the Controller</CardTitle>
                                    <div className="text-xs opacity-90">Agentic AI Assistant</div>
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden relative">
                        <ScrollArea className="h-full p-4">
                            <div className="flex flex-col gap-4">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <Avatar className="h-8 w-8 border">
                                            {msg.role === 'system' ? <Bot className="h-5 w-5 p-1" /> : <User className="h-5 w-5 p-1" />}
                                        </Avatar>
                                        <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                            {/* Text Bubble */}
                                            <div className={`p-3 rounded-xl text-sm ${msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                : 'bg-muted rounded-tl-none'
                                                }`}>
                                                {msg.content}
                                            </div>

                                            {/* Interactive Elements for System */}
                                            {msg.type === "action-confirmation" && msg.actionData && (
                                                <div className="flex flex-col gap-2 mt-1 w-full p-3 border rounded-lg bg-card shadow-sm">
                                                    <div className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                                        <Sparkles className="h-3 w-3" /> Suggested Action
                                                    </div>
                                                    <div className="text-sm font-medium">{msg.actionData.actionCode}</div>
                                                    <div className="text-xs text-muted-foreground">Confidence: {msg.actionData.confidence}</div>
                                                    <div className="flex gap-2 mt-2">
                                                        <Button
                                                            size="sm"
                                                            className="w-full gap-1"
                                                            onClick={() => executeAction(msg)}
                                                            disabled={isLoading}
                                                        >
                                                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                                            Execute
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {msg.type === "result" && msg.resultData && (
                                                <div className="w-full mt-1">
                                                    {renderResult(msg.resultData)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-3 border-t bg-background">
                        <form
                            className="flex w-full gap-2"
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        >
                            <Input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask AI..."
                                className="flex-1"
                                disabled={isLoading}
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}

            {/* FAB */}
            {!isOpen && (
                <Button
                    size="lg"
                    className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition-transform"
                    onClick={() => setIsOpen(true)}
                >
                    <Sparkles className="h-6 w-6 text-white" />
                </Button>
            )}
        </div>
    );
}
