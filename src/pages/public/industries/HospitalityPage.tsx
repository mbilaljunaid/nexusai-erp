import React from 'react';
import { Home, Users, Utensils, Bed, BarChart3, DollarSign, Calendar, Package } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function HospitalityPage() {
    return (
        <IndustryPageTemplate
            name="Hospitality & Hotels"
            slug="hospitality"
            tagline="Integrated property management and guest experience platform"
            description="Elevate guest experiences and streamline operations with NexusAI's hospitality ERP. From property management to revenue optimization, housekeeping to guest services - manage hotels, resorts, and hospitality chains with one unified platform. Support OTAs, direct bookings, and channel management seamlessly."

            stats={[
                { value: "95%", label: "Guest Satisfaction" },
                { value: "30%", label: "More Revenue" },
                { value: "40%", label: "Staff Efficiency" },
                { value: "500+", label: "Properties" }
            ]}

            modules={[
                {
                    name: "Property Management (PMS)",
                    slug: "pms",
                    description: "Reservations, check-in/out, room assignments, and guest folio",
                    icon: <Home className="w-8 h-8 text-primary" />
                },
                {
                    name: "Channel Management",
                    slug: "channel-mgmt",
                    description: "OTA integration, rate parity, and inventory distribution",
                    icon: <Package className="w-8 h-8 text-primary" />
                },
                {
                    name: "Revenue Management",
                    slug: "revenue-mgmt",
                    description: "Dynamic pricing, yield management, and demand forecasting",
                    icon: <DollarSign className="w-8 h-8 text-primary" />
                },
                {
                    name: "Housekeeping Management",
                    slug: "housekeeping",
                    description: "Room status tracking, task assignment, and cleaning schedules",
                    icon: <Bed className="w-8 h-8 text-primary" />
                },
                {
                    name: "F&B Management",
                    slug: "fnb-mgmt",
                    description: "Restaurant POS, catering orders, and banquet management",
                    icon: <Utensils className="w-8 h-8 text-primary" />
                },
                {
                    name: "Guest Services",
                    slug: "guest-services",
                    description: "Concierge, spa bookings, and guest request management",
                    icon: <Users className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "Online Booking Engine",
                    description: "Direct bookings with real-time availability and instant confirmation",
                    icon: <Calendar className="w-6 h-6 text-primary" />
                },
                {
                    title: "Mobile Check-In/Out",
                    description: "Contactless check-in, digital room keys, and express checkout",
                    icon: <Home className="w-6 h-6 text-primary" />
                },
                {
                    title: "Guest  Profile",
                    description: "360-degree guest view with preferences, history, and loyalty status",
                    icon: <Users className="w-6 h-6 text-primary" />
                },
                {
                    title: "Multi-Property Management",
                    description: "Centralized control for hotel chains with property-level autonomy",
                    icon: <Package className="w-6 h-6 text-primary" />
                },
                {
                    title: "Dynamic Pricing",
                    description: "AI-powered rate recommendations based on demand and competition",
                    icon: <DollarSign className="w-6 h-6 text-primary" />
                },
                {
                    title: "Loyalty Programs",
                    description: "Points accumulation, tier management, and redemption tracking",
                    icon: <BarChart3 className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "PCI-DSS Payment Security",
                "GDPR Data Privacy",
                "ADA Accessibility",
                "Fire Safety Codes"
            ]}

            useCases={[
                {
                    title: "Hotel Chains & Resorts",
                    description: "Manage multiple properties with centralized reporting, shared inventory, and brand consistency while maintaining local flexibility."
                },
                {
                    title: "Boutique Hotels",
                    description: "Personalized guest experiences with detailed preference tracking, concierge services, and tailored packages."
                },
                {
                    title: "Extended Stay Properties",
                    description: "Long-term guest management with recurring billing, apartment-style amenities, and lease-like agreements."
                },
                {
                    title: "Event & Conference Centers",
                    description: "Banquet management, meeting room scheduling, catering coordination, and event billing."
                }
            ]}

            successStories={[
                {
                    company: "Luxury Resort Collection",
                    quote: "NexusAI's revenue management increased our RevPAR by 28% and booking.com integration boosted OTA revenue by 40%. Guests love the mobile check-in.",
                    result: "28% RevPAR increase, 40% more OTA revenue"
                }
            ]}
        />
    );
}
