import React from 'react';
import { Film, Radio, Users, DollarSign, Calendar, BarChart3, Package, TrendingUp } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function MediaPage() {
    return (
        <IndustryPageTemplate
            name="Media & Entertainment"
            slug="media"
            tagline="Rights management and content operations for media companies"
            description="Power media operations with NexusAI's specialized entertainment ERP. From content rights to royalty tracking, ad sales to subscriber management - manage film, TV, music, publishing, and digital media. Support studios, broadcasters, publishers, and streaming platforms with industry-specific workflows."

            stats={[
                { value: "99%", label: "Royalty Accuracy" },
                { value: "50%", label: "Faster Billing" },
                { value: "35%", label: "Revenue Increase" },
                { value: "300+", label: "Media Companies" }
            ]}

            modules={[
                {
                    name: "Rights Management",
                    slug: "rights-mgmt",
                    description: "Content rights, territories, windows, and avails tracking",
                    icon: <Film className="w-8 h-8 text-primary" />
                },
                {
                    name: "Royalty Accounting",
                    slug: "royalties",
                    description: "Participant tracking, royalty calculations, and statements",
                    icon: <DollarSign className="w-8 h-8 text-primary" />
                },
                {
                    name: "Ad Sales & Traffic",
                    slug: "ad-sales",
                    description: "Campaign management, inventory, trafficking, and billing",
                    icon: <Radio className="w-8 h-8 text-primary" />
                },
                {
                    name: "Subscriber Management",
                    slug: "subscriber-mgmt",
                    description: "Subscriptions, entitlements, and viewing analytics",
                    icon: <Users className="w-8 h-8 text-primary" />
                },
                {
                    name: "Content Operations",
                    slug: "content-ops",
                    description: "Asset management, metadata, and distribution workflows",
                    icon: <Package className="w-8 h-8 text-primary" />
                },
                {
                    name: "Analytics & Insights",
                    slug: "media-analytics",
                    description: "Viewership data, content performance, and audience insights",
                    icon: <BarChart3 className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "Rights & Avails",
                    description: "Track content rights by territory, language, and distribution window",
                    icon: <Film className="w-6 h-6 text-primary" />
                },
                {
                    title: "Royalty Processing",
                    description: "Automated royalty calculations with multi-tier participant structures",
                    icon: <DollarSign className="w-6 h-6 text-primary" />
                },
                {
                    title: "Ad Campaign Management",
                    description: "Linear and digital ad campaigns with programmatic integration",
                    icon: <Radio className="w-6 h-6 text-primary" />
                },
                {
                    title: "Subscription Billing",
                    description: "SVOD, TVOD, AVOD models with dunning and churn management",
                    icon: <Users className="w-6 h-6 text-primary" />
                },
                {
                    title: "Content Metadata",
                    description: "EIDR, ISAN, and industry standard metadata management",
                    icon: <Package className="w-6 h-6 text-primary" />
                },
                {
                    title: "Audience Analytics",
                    description: "Viewing patterns, engagement metrics, and content recommendations",
                    icon: <TrendingUp className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "Copyright Law",
                "Music Licensing (ASCAP, BMI, SESAC)",
                "MPAA Content Ratings",
                "FCC Regulations (Broadcasting)",
                "GDPR/CCPA Privacy"
            ]}

            useCases={[
                {
                    title: "Film & TV Studios",
                    description: "Production accounting, rights licensing, and participant royalty tracking for theatrical and streaming content."
                },
                {
                    title: "Broadcasters & Networks",
                    description: "Linear ad sales, programming schedules, rights acquisition, and affiliate fee management."
                },
                {
                    title: "Streaming Platforms",
                    description: "Subscription management, content licensing, viewing analytics, and recommendation engines."
                },
                {
                    title: "Music Labels & Publishers",
                    description: "Artist contracts, mechanical/performance royalties, and streaming revenue distribution."
                }
            ]}

            successStories={[
                {
                    company: "Indie Film Distributor",
                    quote: "NexusAI's rights management prevented $2M in conflicts and automated royalty statements for 500+ participants. Licensing deals close 60% faster.",
                    result: "$2M conflict prevention, 60% faster deals"
                }
            ]}
        />
    );
}
