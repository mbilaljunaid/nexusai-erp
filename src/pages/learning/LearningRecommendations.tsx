import React, { useState } from 'react';
import { StandardPage } from '@/components/layout/StandardPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, BookOpen, Star, GraduationCap, TrendingUp, Check } from 'lucide-react';

const RECOMMENDATIONS = [
    {
        employee: 'Alice Martinez (3210)',
        role: 'Data Analyst',
        courses: [
            { title: 'Python for Data Science', hours: 8, relevance: 98, reason: 'Skill Gap: Python (Required for role)', type: 'Technical' },
            { title: 'Machine Learning Fundamentals', hours: 12, relevance: 92, reason: 'Career Path: Data Engineer trajectory', type: 'Technical' },
            { title: 'Storytelling with Data (Tableau)', hours: 4, relevance: 85, reason: 'Competency: Data Visualization gap', type: 'Technical' },
        ]
    },
    {
        employee: 'James Park (2045)',
        role: 'Sr. Software Engineer',
        courses: [
            { title: 'Leadership Foundations for ICs', hours: 6, relevance: 95, reason: 'HiPo Flag: Succession candidate for EM role', type: 'Leadership' },
            { title: 'Cloud Architecture (AWS)', hours: 16, relevance: 80, reason: 'Skill Gap: Cloud hosting (team goal)', type: 'Technical' },
        ]
    }
];

export default function LearningRecommendations() {
    const { toast } = useToast();
    const [assigned, setAssigned] = useState<Set<string>>(new Set());

    const handleAssign = (key: string, title: string) => {
        setAssigned((prev) => {
            const next = new Set(prev);
            next.add(key);
            return next;
        });
        toast({ title: 'Course Assigned', description: `"${title}" has been added to the employee's learning plan.` });
    };

    return (
        <StandardPage
            title="AI Learning Recommendations"
            description="Oracle-style ML engine that recommends courses based on role requirements, skill gaps, career goals, and succession plans."
            actions={
                <Button variant="secondary" onClick={() => toast({ title: 'Refreshing model', description: 'AI engine re-running against latest skill gap data.' })}>
                    <Sparkles className="mr-2 h-4 w-4" /> Refresh All Recommendations
                </Button>
            }
        >
            <div className="space-y-8">
                {RECOMMENDATIONS.map((rec) => (
                    <Card key={rec.employee}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                    <div>
                                        <CardTitle className="text-base">{rec.employee}</CardTitle>
                                        <CardDescription>{rec.role}</CardDescription>
                                    </div>
                                </div>
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Sparkles className="h-3 w-3 text-primary" />
                                    {rec.courses.length} AI Recommendations
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {rec.courses.map((c) => {
                                const key = `${rec.employee}-${c.title}`;
                                const isAssigned = assigned.has(key);
                                return (
                                    <div key={c.title} className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${isAssigned ? 'bg-green-500/5 border-green-500/30' : 'bg-muted/30 border-border'}`}>
                                        <div className="flex items-start gap-4">
                                            <div className="flex flex-col items-center justify-center p-2 bg-primary/10 rounded-lg">
                                                <Star className="h-5 w-5 text-primary mb-0.5" />
                                                <span className="text-xs font-bold text-primary">{c.relevance}%</span>
                                            </div>
                                            <div>
                                                <div className="font-medium flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                    {c.title}
                                                    <Badge variant="outline" className="text-xs">{c.type}</Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-4">
                                                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {c.reason}</span>
                                                    <span>{c.hours} hrs</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant={isAssigned ? 'ghost' : 'default'}
                                            size="sm"
                                            onClick={() => !isAssigned && handleAssign(key, c.title)}
                                            className={isAssigned ? 'text-green-500' : ''}
                                        >
                                            {isAssigned ? <><Check className="mr-1 h-4 w-4" /> Assigned</> : 'Assign →'}
                                        </Button>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </StandardPage>
    );
}
