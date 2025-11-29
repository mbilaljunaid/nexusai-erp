import { Card, CardContent } from "@/components/ui/card";

export default function VirtualAssistant() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Virtual Assistant Configuration</h1>
        <p className="text-muted-foreground mt-1">Configure AI assistant and chatbot settings</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium">AI Model</p>
          <p className="font-semibold text-lg mt-2">GPT-4o-mini</p>
        </CardContent>
      </Card>
    </div>
  );
}
