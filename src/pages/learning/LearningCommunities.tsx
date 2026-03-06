import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Users, BookOpen, FolderTree, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";


interface Community {
    id: string;
    name: string;
    parentId?: string;
    level: number;
    memberCount: number;
    courseCount: number;
    children?: Community[];
}

export default function LearningCommunities() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

    const { data: communities = [] } = useQuery<any>({
        queryKey: ["/api/learning/communities"],
    });

    const { data: communityCourses = [] } = useQuery<any>({
        queryKey: ["/api/learning/communities", selectedCommunityId, "courses"],
        enabled: !!selectedCommunityId,
    });

    const filteredCommunities = communities.filter((c: Community) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Build hierarchy for display
    const renderCommunity = (community: Community, depth: number = 0) => {
        const selected = selectedCommunityId === community.id;

        return (
            <StandardPage title="Learning Communities">
                <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                    className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${selected ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                        }`}
                    style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
                    onClick={() => setSelectedCommunityId(community.id)}
                >
                    {community.children && community.children.length > 0 && (
                        <ChevronRight className="w-4 h-4" />
                    )}
                    <FolderTree className="w-4 h-4" />
                    <span className="flex-1 font-medium">{community.name}</span>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {community.memberCount}
                        </div>
                        <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {community.courseCount}
                        </div>
                    </div>
                </div>
                {community.children && community.children.map((child) => renderCommunity(child, depth + 1))}
            </StandardPage>
        );
    };

    const selectedCommunity = communities.find((c: Community) => c.id === selectedCommunityId);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                
                <p className="text-muted-foreground">
                    Browse courses by organizational hierarchy
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search communities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hierarchy Tree */}
                <Card>
                    <CardHeader>
                        <CardTitle>Organization Hierarchy</CardTitle>
                        <CardDescription>Select a community to view courses</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[600px] overflow-y-auto">
                        {filteredCommunities.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No communities found</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredCommunities
                                    .filter((c: Community) => !c.parentId)
                                    .map((c: Community) => renderCommunity(c))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Community Courses */}
                <Card>
                    <CardHeader>
                        <CardTitle>Community Courses</CardTitle>
                        <CardDescription>
                            {selectedCommunity
                                ? `Courses available in ${selectedCommunity.name}`
                                : "Select a community"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!selectedCommunity ? (
                            <p className="text-center py-12 text-muted-foreground">
                                Select a community to view available courses
                            </p>
                        ) : communityCourses.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No courses available in this community</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                {communityCourses.map((course: any) => (
                                    <Card key={course.id}>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">{course.title}</CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {course.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline">{course.category}</Badge>
                                                <Badge variant="secondary">{course.level}</Badge>
                                                <Badge variant="outline">{course.duration}h</Badge>
                                            </div>
                                            <Button size="sm" className="w-full">
                                                View Course
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
