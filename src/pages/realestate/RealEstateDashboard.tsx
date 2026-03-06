import { formatDate } from "@/lib/dateUtils";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PropertyManagementService, LeaseManagementService, ListingPortalService } from '@/services/realEstateService';
import { Building, FileText, Globe } from 'lucide-react';
import { StandardPage } from "@/components/layout/StandardPage";


export default function RealEstateDashboard() {
    const [properties, setProperties] = useState<any[]>([]);
    const [leases, setLeases] = useState<any[]>([]);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [propertiesData, leasesData, listingsData] = await Promise.all([
                PropertyManagementService.getProperties(),
                LeaseManagementService.getLeases({ status: 'active' }),
                ListingPortalService.getListings({ status: 'published' })
            ]);
            setProperties(propertiesData);
            setLeases(leasesData);
            setListings(listingsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>;
    }

    return (
        <StandardPage title="Real Estate Platform">
            

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            Properties
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{properties.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Active Leases
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{leases.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            Published Listings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{listings.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Occupancy Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">87%</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="properties">
                <TabsList>
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                    <TabsTrigger value="leases">Leases</TabsTrigger>
                    <TabsTrigger value="listings">Listings</TabsTrigger>
                </TabsList>

                <TabsContent value="properties" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Property Portfolio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {properties.map(property => (
                                    <div key={property.id} className="flex items-center justify-between p-3 border rounded">
                                        <div>
                                            <div className="font-medium">{property.property_name}</div>
                                            <div className="text-sm text-gray-500">
                                                {property.city}, {property.state} • {property.total_units} units
                                            </div>
                                        </div>
                                        <Badge>{property.property_type}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="leases" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Leases</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {leases.map(lease => (
                                    <div key={lease.id} className="flex items-center justify-between p-3 border rounded">
                                        <div>
                                            <div className="font-medium">{lease.lease_number}</div>
                                            <div className="text-sm text-gray-500">
                                                {lease.properties?.property_name} - Unit {lease.property_units?.unit_number}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ${lease.monthly_rent}/mo • Ends {formatDate(lease.end_date)}
                                            </div>
                                        </div>
                                        <Badge variant="default">{lease.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="listings" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Published Listings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {listings.map(listing => (
                                    <div key={listing.id} className="border rounded-lg overflow-hidden">
                                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                            <Building className="h-12 w-12 text-gray-400" />
                                        </div>
                                        <div className="p-4">
                                            <div className="font-medium">{listing.listing_title}</div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {listing.properties?.city}, {listing.properties?.state}
                                            </div>
                                            <div className="text-lg font-bold mt-2">
                                                ${listing.list_price?.toLocaleString()}/mo
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                                <span>{listing.property_units?.bedrooms} bed</span>
                                                <span>•</span>
                                                <span>{listing.property_units?.bathrooms} bath</span>
                                                <span>•</span>
                                                <span>{listing.property_units?.sqft} sqft</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
