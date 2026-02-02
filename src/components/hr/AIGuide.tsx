import React, { useState, useEffect, useRef } from "react";
import {
    Sparkles,
    X,
    MessageSquare,
    Send,
    Bot,
    User,
    Loader2,
    Calendar,
    Clock,
    CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { i18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
}

interface Nudge {
    id: string;
    text: string;
    type: string;
}

export function AIGuide() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "ai", content: "Hi! I'm your NexusAI HR Buddy. Ask me about your leave balances, timesheet status, or team performance." }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data: nudges } = useQuery<Nudge[]>({
        queryKey: ["/api/hr-self-service/me/ai/nudges"],
    });

    const chatMutation = useMutation({
        mutationFn: async (message: string) => {
            const res = await fetch("/api/hr-self-service/me/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
            if (!res.ok) throw new Error("AI query failed");
            return res.json();
        },
        onSuccess: (data) => {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: data.response }]);
        },
    });

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        chatMutation.mutate(input);
        setInput("");
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            {!isOpen ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full shadow-2xl bg-teal-600 hover:bg-teal-700 hover:scale-110 transition-all duration-300 relative group"
                >
                    <Sparkles className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
                    {nudges && nudges.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold animate-pulse">
                            {nudges.length}
                        </span>
                    )}
                </Button>
            ) : (
                <Card className="w-[400px] h-[600px] shadow-2xl flex flex-col border-none overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                    <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white pb-6 pt-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Bot className="h-6 w-6 text-teal-200" />
                                <div>
                                    <CardTitle className="text-lg font-bold">NexusAI Buddy</CardTitle>
                                    <p className="text-xs text-teal-100/80 font-medium">Always online • HR Specialist</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    {/* Quick Nudges Bar */}
                    <div className="bg-teal-50 dark:bg-zinc-900 px-4 py-3 flex gap-3 overflow-x-auto border-b">
                        {nudges?.map((n) => (
                            <div key={n.id} className="flex-shrink-0 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-full text-[10px] font-bold text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50 flex items-center gap-2 shadow-sm italic">
                                <Clock className="h-3 w-3" /> {n.text}
                            </div>
                        ))}
                    </div>

                    <CardContent className="flex-1 p-0 relative">
                        <ScrollArea className="h-full p-4">
                            <div className="space-y-4">
                                {messages.map((m) => (
                                    <div key={m.id} className={cn(
                                        "flex gap-3",
                                        m.role === "user" ? "flex-row-reverse" : ""
                                    )}>
                                        <div className={cn(
                                            "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                            m.role === "ai" ? "bg-teal-100 text-teal-600" : "bg-zinc-100 text-zinc-600"
                                        )}>
                                            {m.role === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                        </div>
                                        <div className={cn(
                                            "max-w-[80%] p-3 text-sm font-medium",
                                            m.role === "ai" ? "bg-muted rounded-2xl rounded-tl-none" : "bg-teal-600 text-white rounded-2xl rounded-tr-none shadow-md"
                                        )}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                                {chatMutation.isPending && (
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                        <div className="p-3 bg-muted rounded-2xl rounded-tl-none">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-4 bg-background border-t">
                        <div className="flex w-full items-center gap-2">
                            <Input
                                placeholder="Example: How much leave do I have?"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                className="bg-zinc-50 dark:bg-zinc-900 border-none focus-visible:ring-teal-500 font-medium"
                                disabled={chatMutation.isPending}
                            />
                            <Button size="icon" onClick={handleSend} disabled={!input.trim() || chatMutation.isPending} className="bg-teal-600 hover:bg-teal-700 shadow-md">
                                <Send className="h-4 w-4 text-white" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
