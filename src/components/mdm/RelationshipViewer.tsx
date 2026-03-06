
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Building2, ArrowRight, Network } from "lucide-react";
import { useLocation } from "wouter";

interface RelationshipViewerProps {
    partyId: string;
}

export function RelationshipViewer({ partyId }: RelationshipViewerProps) {
    const [, setLocation] = useLocation();

    const { data: relationships = [], isLoading } = useQuery<any[]>({
        queryKey: [`/api/mdm/parties/${partyId}/relationships`],
        enabled: !!partyId
    });

    if (isLoading) {
        return <div className="p-10 text-center">Loading Relationships...</div>;
    }

    if (relationships.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg bg-slate-50">
                <Network className="w-10 h-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Relationships Found</h3>
                <p className="text-muted-foreground text-sm max-w-sm text-center mt-2">
                    This party is not linked to any other organizations or people.
                </p>
                <Button className="mt-4" variant="outline">Add Relationship</Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Relationship Network</h3>
                <Button size="sm"><Network className="w-4 h-4 mr-2" /> Visualize Graph</Button>
            </div>

            <div className="grid gap-4">
                {relationships.map((rel: any) => (
                    <Card key={rel.id} className="cursor-pointer hover:border-blue-300 transition-colors" onClick={() => {
                        const otherId = rel.subjectId === partyId ? rel.objectId : rel.subjectId;
                        setLocation(`/mdm/parties/${otherId}`);
                    }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
                        <CardContent className="p-4 flex items-center gap-4">
                            {/* Icon for the RELATED party */}
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border shrink-0">
                                {rel.relatedPartyType === 'ORGANIZATION' ? <Building2 className="w-5 h-5 text-blue-600" /> : <User className="w-5 h-5 text-green-600" />}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{rel.relatedPartyName}</span>
                                    <Badge variant="outline" className="text-xs">{rel.relatedPartyType}</Badge>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                    <span>{rel.direction === 'Subject' ? 'is' : 'has'}</span>
                                    <Badge variant="secondary" className="font-mono text-xs">{rel.relationshipCode}</Badge>
                                    <span>{rel.direction === 'Subject' ? 'of' : ''} this party</span>
                                </div>
                            </div>

                            <ArrowRight className="w-4 h-4 text-gray-400" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
