import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Calendar, Users, Play, Save } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";

export default function MarketingAutomationCanvas() {
    const [nodes, setNodes] = useState<any[]>([]);
    const [connections, setConnections] = useState<any[]>([]);

    return (
        <StandardPage
            title="Marketing Automation Canvas"
            description="Visual workflow builder for campaigns"
            actions={
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Save className="h-4 w-4 mr-2" />
                        Save Workflow
                    </Button>
                    <Button>
                        <Play className="h-4 w-4 mr-2" />
                        Activate
                    </Button>
                </div>
            }
        >

            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Workflow Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send SMS
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Task
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            <Users className="h-4 w-4 mr-2" />
                            Add to Segment
                        </Button>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Workflow Canvas</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[600px] border-2 border-dashed rounded-lg flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <p className="text-lg font-medium">Drag actions here to build workflow</p>
                            <p className="text-sm mt-2">Connect nodes to create automation sequences</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
