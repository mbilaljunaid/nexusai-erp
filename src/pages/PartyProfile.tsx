import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, MapPin, Phone, Mail, Globe, Hash } from "lucide-react";
import { useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { RelationshipViewer } from "@/components/mdm/RelationshipViewer";

export default function PartyProfile() {
    const [, params] = useRoute("/mdm/parties/:id");
    const partyId = (params as any)?.id;

    const { data, isLoading } = useQuery<{ party: any, profile: any }>({
        queryKey: [`/api/mdm/parties/${partyId}`],
        enabled: !!partyId
    });

    const { data: locations = [] } = useQuery<any[]>({
        queryKey: [`/api/mdm/parties/${partyId}/locations`],
        enabled: !!partyId
    });

    if (isLoading || !data) {
        return <StandardPage title="Loading..." description=""><div className="p-10 text-center">Loading Profile...</div></StandardPage>;
    }

    const { party, profile } = data;

    return (
        <StandardPage
            title={party.partyName}
            description={party.partyNumber}
            breadcrumbs={[{ label: "MDM", href: "/mdm/governance" }, { label: "Registry", href: "/mdm/parties" }, { label: party.partyName }]}
            actions={
                <div className="flex gap-2">
                    <Badge variant={party.status === 'A' ? 'default' : 'secondary'} className="text-sm px-4">
                        {party.status === 'A' ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            }
        >
            <div className="space-y-6">
                <Card>
                    <CardContent className="pt-6 flex gap-6 items-start">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border">
                            {party.partyType === 'ORGANIZATION' ? <Building2 className="w-8 h-8 text-blue-600" /> : <User className="w-8 h-8 text-green-600" />}
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                {party.partyName}
                                <Badge variant="outline">{party.partyType}</Badge>
                            </h2>
                            <div className="flex gap-4 text-sm text-muted-foreground pt-2">
                                <span className="flex items-center gap-1"><Hash className="w-4 h-4" /> {party.partyNumber}</span>
                                {party.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {party.email}</span>}
                                {party.primaryPhone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {party.primaryPhone}</span>}
                                {party.url && <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {party.url}</span>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="overview">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="locations">Addresses ({locations.length})</TabsTrigger>
                        <TabsTrigger value="contacts">Contacts</TabsTrigger>
                        <TabsTrigger value="relationships">Relationships</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle>Profile Details</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-6">
                                {party.partyType === 'ORGANIZATION' ? (
                                    <>
                                        <div className="space-y-2"><Label>DUNS Number</Label><Input value={profile?.dunsNumber || '-'} readOnly /></div>
                                        <div className="space-y-2"><Label>Tax Reference</Label><Input value={profile?.taxReference || '-'} readOnly /></div>
                                        <div className="space-y-2"><Label>Ceo Name</Label><Input value={profile?.ceoName || '-'} readOnly /></div>
                                        <div className="space-y-2"><Label>Employees</Label><Input value={profile?.employeesTotal || '-'} readOnly /></div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2"><Label>First Name</Label><Input value={profile?.firstName || '-'} readOnly /></div>
                                        <div className="space-y-2"><Label>Last Name</Label><Input value={profile?.lastName || '-'} readOnly /></div>
                                        <div className="space-y-2"><Label>Gender</Label><Input value={profile?.gender || '-'} readOnly /></div>
                                        <div className="space-y-2"><Label>Date of Birth</Label><Input value={profile?.dateOfBirth || '-'} readOnly /></div>
                                    </>
                                )}
                                <div className="space-y-2"><Label>Source System</Label><Input value={party.sourceSystem || 'NexusAI'} readOnly /></div>
                                <div className="space-y-2"><Label>External Reference</Label><Input value={party.sourceSystemReference || '-'} readOnly /></div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="locations" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {locations.map((site: any) => (
                                <Card key={site.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-2">
                                                <Badge>{site.identifyingAddressFlag ? 'Primary' : 'Address'}</Badge>
                                                <Badge variant="outline">{site.status}</Badge>
                                            </div>
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                            <div>
                                                <p className="font-medium">{site.location?.address1}</p>
                                                {site.location?.address2 && <p>{site.location?.address2}</p>}
                                                <p>{site.location?.city}, {site.location?.state} {site.location?.postalCode}</p>
                                                <p className="text-sm text-muted-foreground mt-1">{site.location?.country}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {locations.length === 0 && (
                                <div className="text-center py-10 col-span-2 text-muted-foreground border-2 border-dashed rounded-lg">
                                    No addresses found.
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="contacts">
                        <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg bg-orange-50/50">
                            Contacts module not yet linked in Phase 8.
                        </div>
                    </TabsContent>

                    <TabsContent value="relationships" className="mt-6">
                        <RelationshipViewer partyId={partyId || ""} />
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPage>
    );
}
