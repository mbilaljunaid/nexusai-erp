import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Award, Plus, Search, Trash2, Star, User, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/shared/EmptyState";

interface Competency {
    id: string;
    name: string;
    category: string;
    description?: string;
    proficiencyLevels: string[];
}

interface Skill {
    id: string;
    competencyId: string;
    competencyName: string;
    proficiency: number;
    acquiredDate?: string;
    endorsed: boolean;
}

interface Person {
    id: string;
    name: string;
    department: string;
}

export default function CompetencyManagement() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [selectedPerson, setSelectedPerson] = useState<string>("");

    const [competencyModal, setCompetencyModal] = useState({
        isOpen: false,
        name: "",
        category: "Technical",
        description: ""
    });

    const [skillModal, setSkillModal] = useState({
        isOpen: false,
        competencyId: "",
        competencyName: "",
        proficiency: 3
    });

    // Fetch competencies
    const { data: competencies = [], isLoading: loadingCompetencies } = useQuery<Competency[]>({
        queryKey: ['/talent/competencies'],
        queryFn: async () => {
            const res = await fetch('/api/talent/competencies');
            if (!res.ok) return [];
            return res.json();
        }
    });

    // Fetch people for selector
    const { data: people = [] } = useQuery<Person[]>({
        queryKey: ['/api/hr/persons'],
        queryFn: async () => {
            const res = await fetch('/api/hr/persons');
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((p: any) => ({
                id: p.id,
                name: `${p.firstName} ${p.lastName}`,
                department: p.department || 'N/A'
            }));
        }
    });

    // Fetch person's skills
    const { data: personSkills = [] } = useQuery<Skill[]>({
        queryKey: ['/talent/profile/skills', selectedPerson],
        queryFn: async () => {
            if (!selectedPerson) return [];

            const res = await fetch(`/api/talent/profile/${selectedPerson}/skills`);
            if (!res.ok) return [];
            return res.json();
        },
        enabled: !!selectedPerson
    });

    // Create competency mutation
    const createCompetencyMutation = useMutation({
        mutationFn: async (data: { name: string; category: string; description: string }) => {
            const res = await fetch('/api/talent/competencies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to create competency');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/talent/competencies'] });
            toast({ title: 'Competency Created', description: 'New competency added to library' });
            setCompetencyModal({ isOpen: false, name: '', category: 'Technical', description: '' });
        },
        onError: () => {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to create competency' });
        }
    });

    // Add skill mutation
    const addSkillMutation = useMutation({
        mutationFn: async (data: { personId: string; competencyId: string; proficiency: number }) => {
            const res = await fetch('/api/talent/profile/skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to add skill');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/talent/profile/skills', selectedPerson] });
            toast({ title: 'Skill Added', description: `${skillModal.competencyName} added to profile` });
            setSkillModal({ isOpen: false, competencyId: '', competencyName: '', proficiency: 3 });
        },
        onError: () => {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to add skill' });
        }
    });

    // Remove skill mutation
    const removeSkillMutation = useMutation({
        mutationFn: async (skillId: string) => {
            const res = await fetch(`/api/talent/profile/skills/${skillId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to remove skill');
            return skillId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/talent/profile/skills', selectedPerson] });
            toast({ title: 'Skill Removed', description: 'Skill removed from profile' });
        },
        onError: () => {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove skill' });
        }
    });

    const filteredCompetencies = competencies.filter(comp => {
        const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comp.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || comp.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(competencies.map(c => c.category)));

    const getProficiencyLabel = (level: number) => {
        const labels = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'];
        return labels[level - 1] || 'Unknown';
    };

    const getProficiencyColor = (level: number) => {
        if (level >= 5) return 'bg-purple-600';
        if (level >= 4) return 'bg-blue-600';
        if (level >= 3) return 'bg-green-600';
        if (level >= 2) return 'bg-yellow-600';
        return 'bg-gray-600';
    };

    return (
        <div className="space-y-6 p-4">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Award className="h-8 w-8" />
                    Competency Management
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage competencies and employee skill profiles
                </p>
            </div>

            {/* Competency Library Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <CardTitle>Competency Library</CardTitle>
                        <CardDescription>Organization-wide competency catalog</CardDescription>
                    </div>
                    <Button onClick={() => setCompetencyModal({ ...competencyModal, isOpen: true })}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Competency
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search competencies..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Categories</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Competency Grid */}
                    {loadingCompetencies ? (
                        <div className="text-center py-8 text-muted-foreground">Loading competencies...</div>
                    ) : filteredCompetencies.length === 0 ? (
                        <EmptyState compact title="No competencies found" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCompetencies.map(comp => (
                                <Card key={comp.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{comp.name}</h4>
                                                <Badge variant="outline" className="mt-1">
                                                    {comp.category}
                                                </Badge>
                                            </div>
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        {comp.description && (
                                            <p className="text-sm text-muted-foreground mt-2">{comp.description}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Skill Profile Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Skill Profile Management</CardTitle>
                    <CardDescription>View and manage employee competencies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <Label>Select Employee</Label>
                            <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose an employee..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {people.map(person => (
                                        <SelectItem key={person.id} value={person.id}>
                                            {person.name} - {person.department}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            disabled={!selectedPerson}
                            onClick={() => setSkillModal({ ...skillModal, isOpen: true })}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Skill
                        </Button>
                    </div>

                    {selectedPerson ? (
                        personSkills.length === 0 ? (
                            <EmptyState compact title="No skills assigned yet" description='Click "Add Skill" to get started.' />
                        ) : (
                            <div className="space-y-3">
                                {personSkills.map(skill => (
                                    <Card key={skill.id}>
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium">{skill.competencyName}</h4>
                                                        {skill.endorsed && (
                                                            <Badge variant="default" className="bg-green-600">
                                                                <Star className="h-3 w-3 mr-1" />
                                                                Endorsed
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map(level => (
                                                                <div
                                                                    key={level}
                                                                    className={cn(`h-2 w-8 rounded ${level <= skill.proficiency ? getProficiencyColor(skill.proficiency) : 'bg-gray-200'}`)}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">
                                                            {getProficiencyLabel(skill.proficiency)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => removeSkillMutation.mutate(skill.id)} aria-label="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )
                    ) : (
                        <EmptyState icon={User} title="Select an employee" description="Choose an employee to view and manage their skill profile." />
                    )}
                </CardContent>
            </Card>

            {/* Create Competency Modal */}
            <Dialog open={competencyModal.isOpen} onOpenChange={(open) => !open && setCompetencyModal({ isOpen: false, name: '', category: 'Technical', description: '' })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Competency</DialogTitle>
                        <DialogDescription>Create a new competency for the organization library</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="comp-name">Competency Name *</Label>
                            <Input
                                id="comp-name"
                                value={competencyModal.name}
                                onChange={(e) => setCompetencyModal({ ...competencyModal, name: e.target.value })}
                                placeholder="e.g., Python Programming"
                            />
                        </div>
                        <div>
                            <Label htmlFor="comp-category">Category *</Label>
                            <Select
                                value={competencyModal.category}
                                onValueChange={(val) => setCompetencyModal({ ...competencyModal, category: val })}
                            >
                                <SelectTrigger id="comp-category">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Technical">Technical</SelectItem>
                                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                                    <SelectItem value="Business">Business</SelectItem>
                                    <SelectItem value="Language">Language</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="comp-description">Description</Label>
                            <Input
                                id="comp-description"
                                value={competencyModal.description}
                                onChange={(e) => setCompetencyModal({ ...competencyModal, description: e.target.value })}
                                placeholder="Brief description of this competency"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCompetencyModal({ isOpen: false, name: '', category: 'Technical', description: '' })}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => createCompetencyMutation.mutate(competencyModal)}
                            disabled={!competencyModal.name || createCompetencyMutation.isPending}
                        >
                            Create Competency
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Skill Modal */}
            <Dialog open={skillModal.isOpen} onOpenChange={(open) => !open && setSkillModal({ isOpen: false, competencyId: '', competencyName: '', proficiency: 3 })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Skill to Profile</DialogTitle>
                        <DialogDescription>Assign a competency with proficiency level</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="skill-comp">Select Competency *</Label>
                            <Select
                                value={skillModal.competencyId}
                                onValueChange={(val) => {
                                    const comp = competencies.find(c => c.id === val);
                                    setSkillModal({ ...skillModal, competencyId: val, competencyName: comp?.name || '' });
                                }}
                            >
                                <SelectTrigger id="skill-comp">
                                    <SelectValue placeholder="Choose a competency..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {competencies
                                        .filter(c => !personSkills.some(s => s.competencyId === c.id))
                                        .map(comp => (
                                            <SelectItem key={comp.id} value={comp.id}>
                                                {comp.name} ({comp.category})
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Proficiency Level: {getProficiencyLabel(skillModal.proficiency)}</Label>
                            <div className="pt-4">
                                <Slider
                                    value={[skillModal.proficiency]}
                                    onValueChange={([val]) => setSkillModal({ ...skillModal, proficiency: val })}
                                    min={1}
                                    max={5}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                    <span>Beginner</span>
                                    <span>Expert</span>
                                    <span>Master</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSkillModal({ isOpen: false, competencyId: '', competencyName: '', proficiency: 3 })}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => addSkillMutation.mutate({
                                personId: selectedPerson,
                                competencyId: skillModal.competencyId,
                                proficiency: skillModal.proficiency
                            })}
                            disabled={!skillModal.competencyId || addSkillMutation.isPending}
                        >
                            Add Skill
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
