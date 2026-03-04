import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Plus, Building2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Location {
    id: string;
    address1: string;
    address2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
    siteUses?: string[];
    createdAt: string;
}

export default function LocationManager() {
    const [selectedParty, setSelectedParty] = useState<string>("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [formData, setFormData] = useState({
        address1: "",
        address2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
        siteUses: [] as string[],
    });

    const queryClient = useQueryClient();

    // Fetch locations for selected party
    const { data: locations = [], isLoading } = useQuery({
        queryKey: ["/api/mdm/parties", selectedParty, "locations"],
        enabled: !!selectedParty,
        queryFn: async () => {
            const res = await fetch(`/api/mdm/parties/${selectedParty}/locations`);
            return res.json();
        },
    });

    // Create location
    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetch("/api/mdm/locations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mdm/parties", selectedParty, "locations"] });
            setIsCreateOpen(false);
            resetForm();
        },
    });

    const resetForm = () => {
        setFormData({
            address1: "",
            address2: "",
            city: "",
            state: "",
            postalCode: "",
            country: "US",
            siteUses: [],
        });
    };

    return (
        <StandardPage title="Location Manager">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    
                    <p className="text-muted-foreground">
                        Manage addresses and site uses
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={!selectedParty}>
                            <Plus className="w-4 h-4 mr-2" />
                            New Location
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Location</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="address1">Address Line 1</Label>
                                <Input
                                    id="address1"
                                    value={formData.address1}
                                    onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                                    placeholder="123 Main Street"
                                />
                            </div>

                            <div>
                                <Label htmlFor="address2">Address Line 2</Label>
                                <Input
                                    id="address2"
                                    value={formData.address2}
                                    onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                                    placeholder="Suite 100"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="San Francisco"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="state">State/Province</Label>
                                    <Input
                                        id="state"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        placeholder="CA"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="postalCode">Postal Code</Label>
                                    <Input
                                        id="postalCode"
                                        value={formData.postalCode}
                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                        placeholder="94102"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Select
                                        value={formData.country}
                                        onValueChange={(value) => setFormData({ ...formData, country: value })}
                                    >
                                        <SelectTrigger id="country">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="US">United States</SelectItem>
                                            <SelectItem value="CA">Canada</SelectItem>
                                            <SelectItem value="GB">United Kingdom</SelectItem>
                                            <SelectItem value="AU">Australia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => createMutation.mutate(formData)}
                                    disabled={!formData.address1 || !formData.city || createMutation.isPending}
                                    className="flex-1"
                                >
                                    Create Location
                                </Button>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Party Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Party</CardTitle>
                    <CardDescription>Choose a party to view/manage locations</CardDescription>
                </CardHeader>
                <CardContent>
                    <Input
                        placeholder="Enter Party ID..."
                        value={selectedParty}
                        onChange={(e) => setSelectedParty(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        Tip: Use party search to find IDs
                    </p>
                </CardContent>
            </Card>

            {/* Locations List */}
            {selectedParty && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Locations</h2>
                    {isLoading ? (
                        <p className="text-muted-foreground">Loading locations...</p>
                    ) : locations.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No locations found for this party</p>
                                <p className="text-sm">Click "New Location" to add one</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {locations.map((location: Location) => (
                                <Card key={location.id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                                            <div className="flex-1">
                                                <CardTitle className="text-base">{location.address1}</CardTitle>
                                                {location.address2 && (
                                                    <p className="text-sm text-muted-foreground">{location.address2}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="text-sm">
                                            <p>{location.city}, {location.state} {location.postalCode}</p>
                                            <p>{location.country}</p>
                                        </div>

                                        {location.siteUses && location.siteUses.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {location.siteUses.map((use, idx) => (
                                                    <Badge key={idx} variant="outline">
                                                        <Building2 className="w-3 h-3 mr-1" />
                                                        {use}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        <p className="text-xs text-muted-foreground pt-2 border-t">
                                            ID: {location.id}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </StandardPage>
    );
}
