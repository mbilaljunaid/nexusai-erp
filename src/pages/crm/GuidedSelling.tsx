import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronRight, CheckCircle2, Package, Search, ArrowRight, Server, Shield, Cloud, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

type Question = {
    id: string;
    text: string;
    options: {
        text: string;
        points: Record<string, number>; // Points added to product scores
        icon?: JSX.Element;
    }[];
};

type Product = {
    id: string;
    name: string;
    category: string;
    basePrice: number;
    description: string;
    icon: JSX.Element;
};

export default function GuidedSelling() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isComplete, setIsComplete] = useState(false);

    const questions: Question[] = [
        {
            id: "deployment",
            text: "How does the customer plan to deploy the solution?",
            options: [
                { text: "Fully Cloud (SaaS)", points: { "NEX-ENT": 1, "NEX-PRO": 1, "NEX-CLD": 5 }, icon: <Cloud className="h-4 w-4" /> },
                { text: "On-Premise", points: { "NEX-ONP": 5, "NEX-ENT": 2 }, icon: <Server className="h-4 w-4" /> },
                { text: "Hybrid", points: { "NEX-ENT": 4, "SEC-ADV": 2 }, icon: <Shield className="h-4 w-4" /> }
            ]
        },
        {
            id: "users",
            text: "How many active users will require licenses?",
            options: [
                { text: "1 - 50", points: { "NEX-PRO": 5 }, icon: <UserIcon count={1} /> },
                { text: "50 - 500", points: { "NEX-ENT": 3, "NEX-PRO": 1 }, icon: <UserIcon count={2} /> },
                { text: "500+", points: { "NEX-ENT": 5, "SEC-ADV": 3 }, icon: <UserIcon count={3} /> }
            ]
        },
        {
            id: "industry",
            text: "Does the customer operate in a highly regulated industry (e.g., Healthcare, Finance)?",
            options: [
                { text: "Yes, strict compliance required", points: { "SEC-ADV": 5, "NEX-ONP": 2, "COMP-MOD": 5 } },
                { text: "No, standard security is sufficient", points: { "NEX-CLD": 2, "NEX-PRO": 1 } }
            ]
        }
    ];

    const products: Product[] = [
        { id: "NEX-ENT", name: "NexusAI Enterprise Edition", category: "Core Platform", basePrice: 45000, description: "Full-scale ERP suite for large organizations with hybrid deployments.", icon: <Server className="h-6 w-6 text-blue-500" /> },
        { id: "NEX-PRO", name: "NexusAI Professional", category: "Core Platform", basePrice: 15000, description: "Essential tools for mid-market businesses.", icon: <Package className="h-6 w-6 text-emerald-500" /> },
        { id: "NEX-CLD", name: "NexusAI Pure Cloud", category: "Core Platform", basePrice: 25000, description: "100% SaaS deployment managed by NexusAI.", icon: <Cloud className="h-6 w-6 text-sky-500" /> },
        { id: "NEX-ONP", name: "NexusAI On-Premise", category: "Core Platform", basePrice: 65000, description: "Self-hosted solution for complete control.", icon: <Server className="h-6 w-6 text-slate-500" /> },
        { id: "SEC-ADV", name: "Advanced Security & Encryption Pack", category: "Add-on", basePrice: 12500, description: "Military-grade encryption at rest and in transit.", icon: <Shield className="h-6 w-6 text-amber-500" /> },
        { id: "COMP-MOD", name: "HIPAA/SOC2 Tracking Module", category: "Add-on", basePrice: 9500, description: "Automated compliance reporting and audit trails.", icon: <CheckCircle2 className="h-6 w-6 text-indigo-500" /> }
    ];

    const calculateRecommendations = () => {
        let scores: Record<string, number> = {};

        // Tally points based on answers
        Object.entries(answers).forEach(([qId, optionText]) => {
            const question = questions.find(q => q.id === qId);
            const selectedOption = question?.options.find(o => o.text === optionText);

            if (selectedOption) {
                Object.entries(selectedOption.points).forEach(([prodId, pts]) => {
                    scores[prodId] = (scores[prodId] || 0) + pts;
                });
            }
        });

        // Map scores back to products and sort
        const rankedProducts = products
            .map(p => ({ ...p, score: scores[p.id] || 0 }))
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score);

        // Separate core from add-ons
        const coreRecommendation = rankedProducts.find(p => p.category === "Core Platform");
        const recommendedAddOns = rankedProducts.filter(p => p.category === "Add-on" && p.score >= 3);

        return { core: coreRecommendation, addons: recommendedAddOns };
    };

    const handleSelectOption = (optionText: string) => {
        const currentQ = questions[currentStep];
        setAnswers({ ...answers, [currentQ.id]: optionText });
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsComplete(true);
        }
    };

    const progress = ((currentStep) / questions.length) * 100;

    return (
        <StandardPage
            title="Guided Selling Configurator"
            description="Answer a few questions to auto-generate the optimal product quote for your customer."
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "CPQ", href: "/crm/quotes" },
                { label: "Guided Selling" }
            ]}
        >
            <div className="max-w-4xl mx-auto mt-6">
                {!isComplete ? (
                    <Card className="border shadow-lg">
                        <CardHeader className="bg-slate-50/50 border-b pb-6">
                            <div className="flex justify-between items-center mb-4">
                                <Badge variant="outline" className="text-primary bg-primary/5">Step {currentStep + 1} of {questions.length}</Badge>
                                <span className="text-sm text-muted-foreground font-medium">{Math.round(progress)}% Complete</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <CardTitle className="text-2xl mt-6">{questions[currentStep].text}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 pb-6">
                            <div className="grid grid-cols-1 gap-4">
                                {questions[currentStep].options.map((opt, idx) => {
                                    const isSelected = answers[questions[currentStep].id] === opt.text;
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => handleSelectOption(opt.text)}
                                            className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-500'}`}>
                                                    {opt.icon || <span className="font-bold">{idx + 1}</span>}
                                                </div>
                                                <span className={`font-medium text-lg ${isSelected ? 'text-primary' : 'text-slate-700'}`}>{opt.text}</span>
                                            </div>
                                            {isSelected && <CheckCircle2 className="h-6 w-6 text-primary" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                        <CardFooter className="border-t bg-slate-50/50 p-6 flex justify-between">
                            <Button variant="ghost" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
                                Back
                            </Button>
                            <Button
                                onClick={handleNext}
                                disabled={!answers[questions[currentStep].id]}
                                className="px-8"
                            >
                                {currentStep === questions.length - 1 ? 'Generate Recommendations' : 'Next Step'} <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="h-8 w-8" />
                            </div>
                            <h2 className="text-3xl font-black">AI Recommendations Ready</h2>
                            <p className="text-muted-foreground mt-2">Based on your inputs, we suggest the following configuration.</p>
                        </div>

                        {calculateRecommendations().core && (
                            <Card className="border-2 border-primary/20 shadow-md relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">CORE PLATFORM</div>
                                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                                    <div className="h-24 w-24 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                                        {calculateRecommendations().core!.icon}
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-2xl font-bold text-slate-900">{calculateRecommendations().core!.name}</h3>
                                        <p className="text-slate-500 mt-2">{calculateRecommendations().core!.description}</p>
                                    </div>
                                    <div className="text-center md:text-right shrink-0">
                                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Base License</p>
                                        <p className="text-4xl font-black text-primary">{formatCurrency(calculateRecommendations().core!.basePrice)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">/ year</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {calculateRecommendations().addons.length > 0 && (
                            <div>
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Plus className="h-5 w-5 text-emerald-500" /> Recommended Add-ons
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {calculateRecommendations().addons.map(addon => (
                                        <Card key={addon.id} className="border hover:border-emerald-300 transition-colors cursor-pointer group">
                                            <CardContent className="p-5 flex items-start justify-between">
                                                <div className="flex gap-4">
                                                    <div className="mt-1">{addon.icon}</div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{addon.name}</p>
                                                        <p className="text-slate-500 text-sm mt-1">{addon.description}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right pl-4">
                                                    <p className="font-bold text-emerald-700">{formatCurrency(addon.basePrice)}</p>
                                                    <span className="text-[10px] text-muted-foreground uppercase opacity-0 group-hover:opacity-100 transition-opacity">Add to Quote</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <Button variant="outline" onClick={() => { setIsComplete(false); setAnswers({}); setCurrentStep(0); }}>Start Over</Button>
                            <Button className="pl-6 pr-4">
                                Convert to Formal Quote <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </StandardPage>
    );
}

function UserIcon({ count }: { count: number }) {
    return (
        <div className="flex -space-x-1">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="h-4 w-4 rounded-full bg-slate-300 border border-white"></div>
            ))}
        </div>
    );
}
