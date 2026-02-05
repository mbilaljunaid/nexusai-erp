import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
    role: "user" | "assistant";
    content: string;
    metric?: { label: string; value: string };
}

export function AnalyticsAssistant() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I'm your HR Analytics AI. Ask me about Headcount, Attrition, or Diversity." }
    ]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { role: "user" as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // Artificial Latency for realism
        setTimeout(() => {
            const query = userMsg.content.toLowerCase();
            let response: Message = { role: "assistant", content: "I didn't understand that query. Try asking about 'Headcount' or 'Turnover'." };

            if (query.includes("headcount")) {
                response = {
                    role: "assistant",
                    content: "Here is the latest Headcount data:",
                    metric: { label: "Total Headcount", value: "1,250" }
                };
            } else if (query.includes("attrition") || query.includes("turnover")) {
                response = {
                    role: "assistant",
                    content: "Voluntary Turnover is trending downwards.",
                    metric: { label: "Voluntary Turnover", value: "15.2%" }
                };
            } else if (query.includes("diversity") || query.includes("gender")) {
                response = {
                    role: "assistant",
                    content: "Gender Diversity is currently at:",
                    metric: { label: "Female Ratio", value: "42.0%" }
                };
            }

            setMessages(prev => [...prev, response]);
        }, 800);
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
                    <Sparkles className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        AI Analytics Assistant
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1 mt-4 pr-4">
                    <div className="space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="text-sm">{m.content}</p>
                                    {m.metric && (
                                        <Card className="mt-2 bg-background/50 border-none shadow-sm">
                                            <CardContent className="p-3">
                                                <p className="text-xs text-muted-foreground">{m.metric.label}</p>
                                                <p className="text-xl font-bold text-foreground">{m.metric.value}</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="mt-4 flex gap-2">
                    <Input
                        placeholder="Ask a question..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <Button size="icon" onClick={handleSend}><Send className="h-4 w-4" /></Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
