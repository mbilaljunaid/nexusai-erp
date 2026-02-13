import React from 'react';
import { Megaphone, Mail, FileText, Users, BarChart3, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';

export default function Marketing() {
    const campaigns = [
        { id: '1', name: 'Q1 Product Launch', status: 'active', leads: 1245, conversion: 12.3 },
        { id: '2', name: 'Enterprise Outreach', status: 'scheduled', leads: 0, conversion: 0 },
        { id: '3', name: 'Holiday Promotion', status: 'completed', leads: 3421, conversion: 18.7 },
    ];

    const blogPosts = [
        { id: '1', title: '10 Ways ERP Improves Manufacturing', author: 'John Doe', status: 'published', views: 5420 },
        { id: '2', title: 'Guide to AI in Finance', author: 'Sarah Smith', status: 'draft', views: 0 },
        { id: '3', title: 'HR Compliance Best Practices', author: 'Mike Johnson', status: 'published', views: 3210 },
    ];

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Marketing</h1>
                        <p className="text-muted-foreground">Manage campaigns, content, and lead generation</p>
                    </div>
                    <Button>
                        <Megaphone className="w-4 h-4 mr-2" />
                        New Campaign
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">12,458</div>
                                    <div className="text-sm text-muted-foreground">Total Leads</div>
                                </div>
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">14.2%</div>
                                    <div className="text-sm text-muted-foreground">Conversion Rate</div>
                                </div>
                                <BarChart3 className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">8</div>
                                    <div className="text-sm text-muted-foreground">Active Campaigns</div>
                                </div>
                                <Megaphone className="w-8 h-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">24</div>
                                    <div className="text-sm text-muted-foreground">Blog Posts</div>
                                </div>
                                <FileText className="w-8 h-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="campaigns">
                    <TabsList>
                        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="leads">Leads</TabsTrigger>
                    </TabsList>

                    {/* Campaigns */}
                    <TabsContent value="campaigns" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Marketing Campaigns</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {campaigns.map((campaign) => (
                                        <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <Megaphone className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">{campaign.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {campaign.leads} leads • {campaign.conversion}% conversion
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                                                    {campaign.status}
                                                </Badge>
                                                <Button variant="outline" size="sm">View</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Content */}
                    <TabsContent value="content" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Blog Posts</CardTitle>
                                    <Button size="sm">
                                        <FileText className="w-4 h-4 mr-2" />
                                        New Post
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {blogPosts.map((post) => (
                                        <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <FileText className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">{post.title}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        By {post.author} • {post.views} views
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                                    {post.status}
                                                </Badge>
                                                <Button variant="outline" size="sm">Edit</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Leads */}
                    <TabsContent value="leads">
                        <Card>
                            <CardHeader>
                                <CardTitle>Lead Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Lead tracking coming soon...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
