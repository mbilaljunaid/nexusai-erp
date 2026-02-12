import React from 'react';
import { Package, DollarSign, Users, BarChart3, Shield, Briefcase, FileText, HeartPulse } from 'lucide-react';
import { IndustryPageTemplate } from '@/components/IndustryPageTemplate';

export default function HealthcarePage() {
    return (
        <IndustryPageTemplate
            name="Healthcare"
            slug="healthcare"
            tagline="Comprehensive ERP solutions for hospitals, clinics, and healthcare providers"
            description="Transform your healthcare operations with NexusAI's specialized ERP platform. From patient management to billing, compliance to analytics - streamline every aspect of your healthcare organization. Built-in support for HIPAA, HL7, and other healthcare standards ensures your data is secure and compliant."

            stats={[
                { value: "99.9%", label: "Uptime SLA" },
                { value: "HIPAA", label: "Compliant" },
                { value: "24/7", label: "Support" },
                { value: "500+", label: "Hospitals" }
            ]}

            modules={[
                {
                    name: "Patient Management",
                    slug: "patient-management",
                    description: "Electronic health records, appointment scheduling, and patient portal",
                    icon: <HeartPulse className="w-8 h-8 text-primary" />
                },
                {
                    name: "Billing & Revenue Cycle",
                    slug: "healthcare-billing",
                    description: "Claims management, coding, and revenue cycle optimization",
                    icon: <DollarSign className="w-8 h-8 text-primary" />
                },
                {
                    name: "Clinical Management",
                    slug: "clinical-management",
                    description: "Lab results, radiology, pharmacy, and clinical workflows",
                    icon: <FileText className="w-8 h-8 text-primary" />
                },
                {
                    name: "HR & Credentialing",
                    slug: "healthcare-hr",
                    description: "Staff scheduling, credentialing, and compliance tracking",
                    icon: <Briefcase className="w-8 h-8 text-primary" />
                },
                {
                    name: "Inventory & Supply Chain",
                    slug: "healthcare-inventory",
                    description: "Medical supplies, equipment tracking, and vendor management",
                    icon: <Package className="w-8 h-8 text-primary" />
                },
                {
                    name: "Analytics & Reporting",
                    slug: "healthcare-analytics",
                    description: "Clinical analytics, quality metrics, and population health insights",
                    icon: <BarChart3 className="w-8 h-8 text-primary" />
                }
            ]}

            features={[
                {
                    title: "HIPAA Compliance",
                    description: "Built-in security controls, audit trails, and encryption to meet HIPAA requirements",
                    icon: <Shield className="w-6 h-6 text-primary" />
                },
                {
                    title: "HL7 Integration",
                    description: "Seamless integration with existing EMR/EHR systems via HL7 FHIR standards",
                    icon: <Package className="w-6 h-6 text-primary" />
                },
                {
                    title: "Patient Portal",
                    description: "Self-service portal for appointments, records, and billing",
                    icon: <Users className="w-6 h-6 text-primary" />
                },
                {
                    title: "Revenue Cycle Management",
                    description: "Automated claims processing, denial management, and payment posting",
                    icon: <DollarSign className="w-6 h-6 text-primary" />
                },
                {
                    title: "Clinical Decision Support",
                    description: "AI-powered alerts, drug interactions, and evidence-based guidelines",
                    icon: <HeartPulse className="w-6 h-6 text-primary" />
                },
                {
                    title: "Quality Reporting",
                    description: "HEDIS, MIPS, and other quality measure reporting",
                    icon: <BarChart3 className="w-6 h-6 text-primary" />
                }
            ]}

            compliance={[
                "HIPAA Security Rule",
                "HIPAA Privacy Rule",
                "HITECH Act",
                "HL7 FHIR",
                "ICD-10 Coding",
                "CPT Coding",
                "HEDIS Measures",
                "MIPS/MACRA",
                "Joint Commission Standards"
            ]}

            useCases={[
                {
                    title: "Hospital System Integration",
                    description: "Connect all departments - from admissions to billing, labs to pharmacy - in one unified platform. Real-time data sharing improves patient care and operational efficiency."
                },
                {
                    title: "Outpatient Clinic Management",
                    description: "Streamline appointment scheduling, EHR documentation, and billing workflows for multi-specialty clinics. Reduce no-shows with automated reminders."
                },
                {
                    title: "Telehealth Operations",
                    description: "Enable virtual visits with integrated video conferencing, e-prescribing, and remote patient monitoring capabilities."
                },
                {
                    title: "Medical Billing Services",
                    description: "Automate claims submission, track denials, and optimize revenue cycle for faster reimbursements and reduced AR days."
                }
            ]}

            successStories={[
                {
                    company: "Metropolitan Hospital Network",
                    quote: "NexusAI reduced our billing cycle time by 40% and improved claims acceptance rate to 98%. The HIPAA-compliant platform gave us peace of mind.",
                    result: "40% faster billing, 98% claims acceptance"
                },
                {
                    company: "Regional Clinic Group",
                    quote: "The patient portal has been a game-changer. Our patients love the convenience, and we've seen a 30% reduction in phone calls for appointment scheduling.",
                    result: "30% reduction in admin calls"
                }
            ]}
        />
    );
}
