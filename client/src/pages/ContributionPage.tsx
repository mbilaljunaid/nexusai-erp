import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  ArrowRight, 
  Users, 
  Code2, 
  Video, 
  CheckCircle2, 
  Gift, 
  Star, 
  Award, 
  TrendingUp,
  DollarSign,
  Shield,
  Heart,
  MessageSquare,
  Lightbulb,
  Target,
  Sparkles,
  BookOpen,
  Wrench,
  Globe,
  Zap
} from "lucide-react";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";

export default function ContributionPage() {
  useEffect(() => {
    document.title = "Contribute to NexusAI - Join Our Community | NexusAI";
  }, []);

  const contributionTypes = [
    {
      icon: Users,
      title: "Community Building",
      description: "Create and moderate industry communities, help newcomers, and foster collaboration",
      examples: ["Start an industry-specific forum", "Moderate discussions", "Organize virtual events", "Welcome new members"],
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Code2,
      title: "App Development",
      description: "Build and share apps, integrations, and extensions for the NexusAI ecosystem",
      examples: ["Create marketplace apps", "Build integrations", "Develop custom modules", "Share templates"],
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Video,
      title: "Training Content",
      description: "Create tutorials, guides, and training videos to help users master NexusAI",
      examples: ["Video tutorials", "Written guides", "Quick tips", "Use case demos"],
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      icon: CheckCircle2,
      title: "Quality Assurance",
      description: "Help improve platform quality through testing, bug reports, and feedback",
      examples: ["Report bugs", "Test new features", "Provide UX feedback", "Documentation reviews"],
      color: "text-orange-400",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: Lightbulb,
      title: "Ideas & Features",
      description: "Share your innovative ideas and help shape the future of NexusAI",
      examples: ["Feature requests", "Industry insights", "Process improvements", "Integration ideas"],
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: MessageSquare,
      title: "Support & Mentoring",
      description: "Help other users by answering questions and sharing your expertise",
      examples: ["Answer forum questions", "Mentor newcomers", "Share best practices", "Write FAQs"],
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10"
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Service Marketplace",
      description: "Sell your expertise through our service marketplace. Offer consulting, implementation, training, and custom development services to the NexusAI community.",
      highlights: ["Set your own rates", "Global client base", "Verified expert badge", "Secure payments"],
      color: "text-green-400"
    },
    {
      icon: Award,
      title: "Badges & Recognition",
      description: "Earn exclusive badges that showcase your expertise and contributions. Build your reputation as a trusted community member.",
      highlights: ["Contributor badges", "Expert certifications", "Top contributor status", "Skill endorsements"],
      color: "text-purple-400"
    },
    {
      icon: Star,
      title: "Community Recognition",
      description: "Get featured on our contributor leaderboard, highlighted in newsletters, and recognized at community events.",
      highlights: ["Featured contributor spots", "Newsletter highlights", "Event speaker invites", "Social media shoutouts"],
      color: "text-yellow-400"
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "Build your professional portfolio, connect with enterprises, and open doors to new opportunities.",
      highlights: ["Portfolio showcase", "Enterprise connections", "Job referrals", "LinkedIn recognition"],
      color: "text-blue-400"
    }
  ];

  const trustLevels = [
    { 
      level: "New User", 
      trustLevel: 0,
      requirements: "Account age < 7 days or Rep < 50", 
      limits: "2 posts/day, 3 answers/day, 5 comments/day",
      perks: "Community access, Learning mode", 
      color: "bg-slate-600" 
    },
    { 
      level: "Contributor", 
      trustLevel: 1,
      requirements: "Rep ≥ 50, Account ≥ 7 days", 
      limits: "5 posts/day, 10 answers/day, Voting enabled",
      perks: "Contributor badge, Can vote on content", 
      color: "bg-blue-600" 
    },
    { 
      level: "Trusted", 
      trustLevel: 2,
      requirements: "Rep ≥ 200, 10+ accepted answers", 
      limits: "10 posts/day, 20 answers/day, 1.5x voting weight",
      perks: "External links, Can flag content, Marketplace seller", 
      color: "bg-purple-600" 
    },
    { 
      level: "Leader", 
      trustLevel: 3,
      requirements: "Rep ≥ 1,000, 50+ accepted answers, 5+ artifacts", 
      limits: "Unlimited posting, 2x voting weight",
      perks: "Moderate spaces, Lock threads, Premium pricing", 
      color: "bg-yellow-600" 
    }
  ];

  const badgeThresholds = [
    { name: "Problem Solver", description: "Accepted answers", bronze: 5, silver: 15, gold: 40, platinum: 80, legendary: 150 },
    { name: "App Builder", description: "Apps published", bronze: 1, silver: 3, gold: 5, platinum: 10, legendary: 20 },
    { name: "Educator", description: "Training videos", bronze: 2, silver: 5, gold: 10, platinum: 20, legendary: 40 },
    { name: "Form Builder", description: "Forms created", bronze: 5, silver: 15, gold: 30, platinum: 60, legendary: 100 },
    { name: "Bug Resolver", description: "Bugs resolved", bronze: 3, silver: 10, gold: 25, platinum: 50, legendary: 100 },
  ];

  const reputationPoints = [
    { action: "Question posted", points: "+2" },
    { action: "Answer posted", points: "+5" },
    { action: "Answer upvoted", points: "+2" },
    { action: "Accepted answer", points: "+15" },
    { action: "Bug resolved", points: "+20" },
    { action: "Form created", points: "+10" },
    { action: "App published", points: "+50" },
    { action: "Training video", points: "+20" },
    { action: "Service completed", points: "+30" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="px-4 py-24 text-center bg-gradient-to-b from-slate-900 to-slate-800">
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-4">
            Join Our Community
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Contribute to <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">NexusAI</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Be part of building the world's most powerful open-source ERP platform. 
            Your contributions help thousands of businesses while growing your expertise and earning rewards.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/community">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" data-testid="button-join-community">
                <Users className="mr-2 w-5 h-5" /> Join Community
              </Button>
            </Link>
            <a href="https://github.com/mbilaljunaid/nexusai-erp" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-slate-500 text-white hover:bg-slate-700" data-testid="button-github-contribute">
                <Code2 className="mr-2 w-5 h-5" /> View on GitHub
              </Button>
            </a>
          </div>
        </section>

        <section className="px-4 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Ways to Contribute</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              There are many ways to contribute to NexusAI. Choose what matches your skills and interests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contributionTypes.map((type, index) => (
              <Card key={index} className="p-6 hover-elevate transition-all" data-testid={`card-contribution-${type.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`}>
                <div className={`w-12 h-12 rounded-lg ${type.bgColor} flex items-center justify-center mb-4`}>
                  <type.icon className={`w-6 h-6 ${type.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{type.title}</h3>
                <p className="text-muted-foreground mb-4">{type.description}</p>
                <ul className="space-y-2">
                  {type.examples.map((example, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`w-4 h-4 ${type.color}`} />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Gift className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4">Contributor Benefits</h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Your contributions are rewarded. Earn recognition, build your reputation, and unlock opportunities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="p-8 bg-white/10 backdrop-blur border-white/20" data-testid={`card-benefit-${benefit.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-white">{benefit.title}</h3>
                      <p className="text-white/80 mb-4">{benefit.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {benefit.highlights.map((highlight, i) => (
                          <Badge key={i} className="bg-white/20 text-white border-0">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trust Levels</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Progress through trust levels as you contribute. Each level unlocks new privileges and recognition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustLevels.map((levelInfo, index) => (
              <Card key={index} className="p-6 hover-elevate" data-testid={`card-level-${levelInfo.level.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className={`w-12 h-12 rounded-full ${levelInfo.color} mx-auto mb-4 flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{levelInfo.trustLevel}</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-center">{levelInfo.level}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground font-medium">Requirements:</p>
                    <p>{levelInfo.requirements}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Limits:</p>
                    <p>{levelInfo.limits}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Perks:</p>
                    <p>{levelInfo.perks}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="px-4 py-20" style={{ background: `hsl(var(--muted) / 0.3)` }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Award className="w-12 h-12 mx-auto mb-4 text-purple-500" />
              <h2 className="text-4xl font-bold mb-4">Badge Thresholds</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Earn badges as you contribute. Progress from Bronze to Legendary status.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 font-bold">Badge</th>
                    <th className="p-4 text-center text-orange-400">Bronze</th>
                    <th className="p-4 text-center text-slate-400">Silver</th>
                    <th className="p-4 text-center text-yellow-400">Gold</th>
                    <th className="p-4 text-center text-purple-400">Platinum</th>
                    <th className="p-4 text-center text-cyan-400">Legendary</th>
                  </tr>
                </thead>
                <tbody>
                  {badgeThresholds.map((badge, index) => (
                    <tr key={index} className="border-b" data-testid={`row-badge-${badge.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <td className="p-4">
                        <div className="font-bold">{badge.name}</div>
                        <div className="text-sm text-muted-foreground">{badge.description}</div>
                      </td>
                      <td className="p-4 text-center">{badge.bronze}</td>
                      <td className="p-4 text-center">{badge.silver}</td>
                      <td className="p-4 text-center">{badge.gold}</td>
                      <td className="p-4 text-center">{badge.platinum}</td>
                      <td className="p-4 text-center">{badge.legendary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-4xl font-bold mb-4">Reputation Points</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Earn points for your contributions. Points are capped at 5 per action type per day.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {reputationPoints.map((item, index) => (
              <Card key={index} className="p-4 text-center hover-elevate" data-testid={`card-rep-${item.action.toLowerCase().replace(/\s+/g, '-')}`}>
                <p className="text-2xl font-bold text-green-500 mb-2">{item.points}</p>
                <p className="text-sm">{item.action}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="px-4 py-20" style={{ background: `hsl(var(--muted) / 0.5)` }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Target className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h2 className="text-4xl font-bold mb-4">Contributor Ecosystem</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See how your contributions create value for you and the entire NexusAI community.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="p-8" data-testid="card-ecosystem-contribute">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 mx-auto mb-4 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold">You Contribute</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <span>Share your expertise</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-blue-500" />
                    <span>Build apps & integrations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <span>Create training content</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Wrench className="w-5 h-5 text-blue-500" />
                    <span>Help improve quality</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8" data-testid="card-ecosystem-community">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-purple-500/10 mx-auto mb-4 flex items-center justify-center">
                    <Globe className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold">Community Grows</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-500" />
                    <span>More users join</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-purple-500" />
                    <span>Platform improves</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <span>More features added</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    <span>Ecosystem expands</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8" data-testid="card-ecosystem-rewards">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 mx-auto mb-4 flex items-center justify-center">
                    <Gift className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold">You Benefit</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span>Earn from services</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-green-500" />
                    <span>Gain recognition</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-green-500" />
                    <span>Build reputation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span>Grow your career</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 bg-gradient-to-br from-slate-800 to-slate-900 text-white text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h2 className="text-3xl font-bold mb-4">Ready to Start Contributing?</h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of contributors who are shaping the future of enterprise software. 
                Every contribution, big or small, makes a difference.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link to="/community">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700" data-testid="button-get-started">
                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/marketplace/services">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" data-testid="button-browse-marketplace">
                    <DollarSign className="mr-2 w-5 h-5" /> Service Marketplace
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
