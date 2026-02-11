import { Router } from "express";

export const crmMockRouter = Router();

// ============================================
// OPPORTUNITY PIPELINE ENDPOINTS
// ============================================

// Get opportunities with filtering
crmMockRouter.get("/opportunities", (req, res) => {
    const opportunities = [
        {
            id: "opp-1",
            name: "Enterprise Software Deal - Acme Corp",
            accountName: "Acme Corporation",
            amount: 250000,
            closeDate: "2026-03-15",
            stage: "PROPOSAL",
            probability: 75,
            owner: "John Doe",
            aiWinProbability: 82,
            productLine: "enterprise"
        },
        {
            id: "opp-2",
            name: "Professional Services - TechStart Inc",
            accountName: "TechStart Inc",
            amount: 125000,
            closeDate: "2026-02-28",
            stage: "NEGOTIATION",
            probability: 85,
            owner: "Jane Smith",
            aiWinProbability: 78,
            productLine: "professional"
        },
        {
            id: "opp-3",
            name: "Cloud Migration - GlobalCo",
            accountName: "GlobalCo",
            amount: 500000,
            closeDate: "2026-04-01",
            stage: "DISCOVERY",
            probability: 35,
            owner: "Bob Wilson",
            aiWinProbability: 42,
            productLine: "enterprise"
        },
        {
            id: "opp-4",
            name: "Starter Package - SmallBiz LLC",
            accountName: "SmallBiz LLC",
            amount: 35000,
            closeDate: "2026-02-20",
            stage: "QUALIFICATION",
            probability: 55,
            owner: "John Doe",
            productLine: "starter"
        },
        {
            id: "opp-5",
            name: "Strategic Partnership - MegaCorp",
            accountName: "MegaCorp International",
            amount: 1200000,
            closeDate: "2026-06-01",
            stage: "CLOSED_WON",
            probability: 100,
            owner: "Jane Smith",
            aiWinProbability: 100,
            productLine: "enterprise"
        }
    ];

    res.json(opportunities);
});

// Update opportunity (PATCH for stage changes)
crmMockRouter.patch("/opportunities/:id", (req, res) => {
    const { id } = req.params;
    const { stage } = req.body;

    res.json({
        id,
        stage,
        success: true,
        message: `Opportunity ${id} moved to ${stage}`
    });
});

// AI Opportunity Analysis
crmMockRouter.post("/opportunities/:id/analyze", (req, res) => {
    const { id } = req.params;

    res.json({
        opportunityId: id,
        winProbability: 78,
        nextAction: "Schedule technical deep-dive with decision maker",
        risks: ["Budget approval pending", "Competitor X also in evaluation"],
        recommendations: [
            "Position integration capabilities as differentiator",
            "Provide ROI calculator",
            "Schedule executive briefing"
        ],
        dealVelocity: "Slower than average (45 days in current stage)"
    });
});

// ============================================
// QUOTE BUILDER ENDPOINTS
// ============================================

// Get products with search
crmMockRouter.get("/products", (req, res) => {
    const products = [
        { id: "prod-1", name: "Enterprise License", sku: "ENT-001", listPrice: 50000, category: "Software" },
        { id: "prod-2", name: "Professional Services - Monthly", sku: "SVC-100", listPrice: 15000, category: "Services" },
        { id: "prod-3", name: "Cloud Storage - 1TB", sku: "STR-1TB", listPrice: 500, category: "Infrastructure" },
        { id: "prod-4", name: "API Integration Pack", sku: "API-200", listPrice: 25000, category: "Add-ons" },
        { id: "prod-5", name: "Training Package", sku: "TRN-500", listPrice: 5000, category: "Services" },
        { id: "prod-6", name: "Premium Support", sku: "SUP-PREM", listPrice: 12000, category: "Support" },
        { id: "prod-7", name: "Starter License", sku: "STR-001", listPrice: 10000, category: "Software" },
        { id: "prod-8", name: "Mobile App Extension", sku: "MOB-100", listPrice: 8000, category: "Add-ons" }
    ];

    res.json(products);
});

// Get price books
crmMockRouter.get("/price-books", (req, res) => {
    const priceBooks = [
        {
            id: "standard",
            name: "Standard Price Book",
            type: "STANDARD",
            discountRules: []
        },
        {
            id: "partner",
            name: "Partner Price Book",
            type: "PARTNER",
            discountRules: [
                { minQuantity: 1, discountPercent: 15 },
                { minQuantity: 5, discountPercent: 25 }
            ]
        },
        {
            id: "volume",
            name: "Volume Discount Price Book",
            type: "VOLUME",
            discountRules: [
                { minQuantity: 10, discountPercent: 20 },
                { minQuantity: 50, discountPercent: 35 }
            ]
        }
    ];

    res.json(priceBooks);
});

// Create quote
crmMockRouter.post("/quotes", (req, res) => {
    const quote = req.body;

    res.json({
        id: `quote-${Date.now()}`,
        ...quote,
        version: 1,
        status: "DRAFT",
        createdAt: new Date().toISOString(),
        createdBy: "Current User"
    });
});

// Get quote history
crmMockRouter.get("/quotes/history", (req, res) => {
    const history = [
        {
            id: "quote-1",
            version: 1,
            createdAt: "2026-02-10T10:00:00Z",
            createdBy: "John Doe",
            status: "SENT"
        },
        {
            id: "quote-2",
            version: 2,
            createdAt: "2026-02-09T14:30:00Z",
            createdBy: "Jane Smith",
            status: "ACCEPTED"
        },
        {
            id: "quote-3",
            version: 1,
            createdAt: "2026-02-08T09:15:00Z",
            createdBy: "Bob Wilson",
            status: "REJECTED"
        }
    ];

    res.json(history);
});

// ============================================
// LEAD SCORING ENDPOINTS
// ============================================

// Get leads with scoring
crmMockRouter.get("/leads", (req, res) => {
    const leads = [
        {
            id: "lead-1",
            firstName: "Sarah",
            lastName: "Johnson",
            email: "sarah.johnson@techcorp.com",
            company: "TechCorp Solutions",
            title: "VP of Engineering",
            score: 92,
            source: "website",
            status: "QUALIFIED",
            createdAt: "2026-02-01T10:00:00Z",
            scoringBreakdown: {
                demographic: 35,
                behavioral: 32,
                firmographic: 25
            },
            aiRecommendation: {
                nextAction: "Schedule product demo",
                contactTime: "Tue, 2-4 PM",
                priority: "HIGH"
            }
        },
        {
            id: "lead-2",
            firstName: "Michael",
            lastName: "Chen",
            email: "m.chen@globalinc.com",
            company: "Global Industries Inc",
            title: "CTO",
            score: 88,
            source: "referral",
            status: "QUALIFIED",
            createdAt: "2026-02-03T14:30:00Z",
            scoringBreakdown: {
                demographic: 30,
                behavioral: 35,
                firmographic: 23
            },
            aiRecommendation: {
                nextAction: "Send case study",
                contactTime: "Wed, 10 AM-12 PM",
                priority: "HIGH"
            }
        },
        {
            id: "lead-3",
            firstName: "Emily",
            lastName: "Rodriguez",
            email: "emily.r@startup.io",
            company: "Startup.io",
            title: "Founder & CEO",
            score: 82,
            source: "trade-show",
            status: "CONTACTED",
            createdAt: "2026-02-05T09:15:00Z",
            scoringBreakdown: {
                demographic: 28,
                behavioral: 30,
                firmographic: 24
            },
            aiRecommendation: {
                nextAction: "Share pricing info",
                contactTime: "Thu, 3-5 PM",
                priority: "MEDIUM"
            }
        },
        {
            id: "lead-4",
            firstName: "David",
            lastName: "Kim",
            email: "david.kim@enterprise.com",
            company: "Enterprise Corp",
            title: "Director of IT",
            score: 65,
            source: "website",
            status: "NEW",
            createdAt: "2026-02-07T11:00:00Z",
            scoringBreakdown: {
                demographic: 22,
                behavioral: 25,
                firmographic: 18
            }
        },
        {
            id: "lead-5",
            firstName: "Lisa",
            lastName: "Thompson",
            email: "lisa.t@smallbiz.com",
            company: "SmallBiz Co",
            title: "Operations Manager",
            score: 45,
            source: "website",
            status: "NEW",
            createdAt: "2026-02-09T16:20:00Z",
            scoringBreakdown: {
                demographic: 15,
                behavioral: 18,
                firmographic: 12
            }
        }
    ];

    res.json(leads);
});

// Bulk assign leads
crmMockRouter.post("/leads/bulk-assign", (req, res) => {
    const { leadIds, assignTo } = req.body;

    res.json({
        success: true,
        assigned: leadIds.length,
        assignedTo: assignTo,
        message: `${leadIds.length} leads assigned to ${assignTo}`
    });
});

// Calculate/refresh lead score (AI endpoint)
crmMockRouter.post("/leads/:id/score", (req, res) => {
    const { id } = req.params;

    res.json({
        leadId: id,
        score: 85,
        scoringBreakdown: {
            demographic: 30,
            behavioral: 32,
            firmographic: 23
        },
        confidence: 0.92,
        factors: [
            "Job title matches ideal customer profile",
            "Company size in target range",
            "High website engagement",
            "Downloaded 3 whitepapers"
        ]
    });
});

// ============================================
// COMPETITOR INTELLIGENCE ENDPOINTS
// ============================================

// Get competitors
crmMockRouter.get("/competitors", (req, res) => {
    const competitors = [
        {
            id: "comp-1",
            name: "Competitor Alpha",
            tier: "TIER1",
            strengths: [
                "Strong brand recognition",
                "Large customer base",
                "Extensive partner network"
            ],
            weaknesses: [
                "Legacy technology stack",
                "Slow innovation cycle",
                "Poor customer support ratings"
            ],
            positioning: "Market leader with enterprise focus",
            avgDealSize: 180000,
            marketShare: 28
        },
        {
            id: "comp-2",
            name: "Competitor Beta",
            tier: "TIER2",
            strengths: [
                "Competitive pricing",
                "Fast implementation",
                "User-friendly interface"
            ],
            weaknesses: [
                "Limited scalability",
                "Fewer integrations",
                "Small support team"
            ],
            positioning: "Mid-market focused with price advantage",
            avgDealSize: 75000,
            marketShare: 15
        },
        {
            id: "comp-3",
            name: "Competitor Gamma",
            tier: "TIER1",
            strengths: [
                "Advanced AI capabilities",
                "Modern architecture",
                "Strong mobile app"
            ],
            weaknesses: [
                "Higher price point",
                "Newer in market",
                "Smaller customer base"
            ],
            positioning: "Premium innovator targeting tech-savvy buyers",
            avgDealSize: 220000,
            marketShare: 12
        }
    ];

    res.json(competitors);
});

// Get battle card for specific competitor
crmMockRouter.get("/competitors/:id/battle-card", (req, res) => {
    const battleCards: Record<string, any> = {
        "comp-1": {
            competitorId: "comp-1",
            competitorName: "Competitor Alpha",
            keyDifferentiators: [
                "Our cloud-native architecture vs. their legacy on-premise solution",
                "Real-time analytics vs. batch processing",
                "Flexible pricing model vs. rigid enterprise contracts",
                "Modern API-first design vs. limited integration options"
            ],
            commonObjections: [
                {
                    objection: "Competitor Alpha is the market leader",
                    response: "While they have market share, our NPS is 78 vs. their 45. Our customers stay with us 3x longer and report 40% faster time-to-value."
                },
                {
                    objection: "Their brand is more established",
                    response: "True, but 65% of their Fortune 500 customers are actively evaluating alternatives due to modernization needs. We've won 12 of their accounts in the last quarter."
                }
            ],
            winningStrategies: [
                "Emphasize cloud-native architecture and lower TCO",
                "Demonstrate integration capabilities with live demo",
                "Provide migration support and risk mitigation plan",
                "Highlight customer success stories from competitors' switchers"
            ],
            pricingIntel: {
                avgDiscount: 18,
                priceRange: { min: 150000, max: 300000 }
            }
        },
        "comp-2": {
            competitorId: "comp-2",
            competitorName: "Competitor Beta",
            keyDifferentiators: [
                "Enterprise-grade scalability vs. mid-market limitations",
                "Advanced reporting and analytics",
                "24/7 dedicated support vs. email-only support",
                "Comprehensive API ecosystem"
            ],
            commonObjections: [
                {
                    objection: "Competitor Beta is cheaper",
                    response: "Initial price is lower, but factor in limited scalability, integration costs, and support fees. Our TCO calculator shows 30% savings over 3 years."
                }
            ],
            winningStrategies: [
                "Run ROI/TCO analysis showing long-term value",
                "Demonstrate scalability with performance benchmarks",
                "Position as enterprise-ready solution"
            ],
            pricingIntel: {
                avgDiscount: 12,
                priceRange: { min: 50000, max: 120000 }
            }
        }
    };

    const battleCard = battleCards[req.params.id] || {
        competitorId: req.params.id,
        competitorName: "Unknown Competitor",
        keyDifferentiators: [],
        commonObjections: [],
        winningStrategies: [],
        pricingIntel: { avgDiscount: 0, priceRange: { min: 0, max: 0 } }
    };

    res.json(battleCard);
});

// Get win/loss analytics
crmMockRouter.get("/analytics/win-loss", (req, res) => {
    const data = [
        {
            competitorId: "comp-1",
            competitorName: "Competitor Alpha",
            wins: 15,
            losses: 8,
            winRate: 65.2,
            totalValue: 3200000
        },
        {
            competitorId: "comp-2",
            competitorName: "Competitor Beta",
            wins: 22,
            losses: 5,
            winRate: 81.5,
            totalValue: 1850000
        },
        {
            competitorId: "comp-3",
            competitorName: "Competitor Gamma",
            wins: 8,
            losses: 12,
            winRate: 40.0,
            totalValue: 1600000
        }
    ];

    res.json(data);
});

// Get win/loss trends over time
crmMockRouter.get("/analytics/win-loss-trends", (req, res) => {
    const trends = [
        { month: "Oct", wins: 12, losses: 8 },
        { month: "Nov", wins: 15, losses: 6 },
        { month: "Dec", wins: 18, losses: 9 },
        { month: "Jan", wins: 20, losses: 7 },
        { month: "Feb", wins: 22, losses: 5 }
    ];

    res.json(trends);
});

// ============================================
// ANALYTICS DASHBOARD ENDPOINTS (PHASE 3)
// ============================================

// Get main analytics metrics
crmMockRouter.get("/analytics/metrics", (req, res) => {
    const data = {
        pipeline: [
            { stage: "Discovery", totalValue: 850000 },
            { stage: "Qualification", totalValue: 1200000 },
            { stage: "Proposal", totalValue: 1800000 },
            { stage: "Negotiation", totalValue: 950000 },
            { stage: "Closed Won", totalValue: 2400000 }
        ],
        winRate: {
            rate: 68,
            totalClosed: 145
        },
        service: {
            slaCompliance: 94,
            openCases: 42
        },
        leaderboard: [
            { id: "rep-1", name: "Jane Smith", totalSales: 1850000 },
            { id: "rep-2", name: "John Doe", totalSales: 1650000 },
            { id: "rep-3", name: "Bob Wilson", totalSales: 1420000 },
            { id: "rep-4", name: "Alice Johnson", totalSales: 1200000 }
        ]
    };

    res.json(data);
});

// Pipeline velocity
crmMockRouter.get("/analytics/pipeline-velocity", (req, res) => {
    const data = [
        { stage: "Discovery", avgDays: 12 },
        { stage: "Qualification", avgDays: 18 },
        { stage: "Proposal", avgDays: 25 },
        { stage: "Negotiation", avgDays: 15 },
        { stage: "Closed Won", avgDays: 5 }
    ];

    res.json(data);
});

// Revenue waterfall
crmMockRouter.get("/analytics/revenue-waterfall", (req, res) => {
    const data = [
        { category: "New", value: 1200, color: "#22c55e" },
        { category: "Expansion", value: 450, color: "#3b82f6" },
        { category: "Renewal", value: 800, color: "#a855f7" },
        { category: "Churn", value: -150, color: "#ef4444" },
        { category: "Total", value: 2300, color: "#0f172a" }
    ];

    res.json(data);
});

// Sales rep performance
crmMockRouter.get("/analytics/rep-performance", (req, res) => {
    const data = [
        { id: "rep-1", name: "Jane Smith", quotaAttainment: 125, revenue: 1850000, winRate: 72 },
        { id: "rep-2", name: "John Doe", quotaAttainment: 112, revenue: 1650000, winRate: 68 },
        { id: "rep-3", name: "Bob Wilson", quotaAttainment: 95, revenue: 1420000, winRate: 65 },
        { id: "rep-4", name: "Alice Johnson", quotaAttainment: 88, revenue: 1200000, winRate: 62 },
        { id: "rep-5", name: "Chris Lee", quotaAttainment: 78, revenue: 980000, winRate: 58 }
    ];

    res.json(data);
});

// Product performance
crmMockRouter.get("/analytics/product-performance", (req, res) => {
    const data = [
        { id: "prod-1", name: "Enterprise Suite", revenue: 3200000, dealCount: 28, avgDealSize: 114286, growth: 18 },
        { id: "prod-2", name: "Professional Services", revenue: 1850000, dealCount: 65, avgDealSize: 28462, growth: 22 },
        { id: "prod-3", name: "Cloud Infrastructure", revenue: 1400000, dealCount: 42, avgDealSize: 33333, growth: 35 },
        { id: "prod-4", name: "Support Packages", revenue: 850000, dealCount: 88, avgDealSize: 9659, growth: 12 },
        { id: "prod-5", name: "Training Programs", revenue: 420000, dealCount: 52, avgDealSize: 8077, growth: -5 }
    ];

    res.json(data);
});

// ============================================
// FORECAST ENDPOINTS
// ============================================

// Forecast accuracy
crmMockRouter.get("/forecast/accuracy", (req, res) => {
    const data = {
        accuracy: 87,
        variance: "$180K under",
        monthly: [
            { month: "Oct", forecast: 2200, actual: 2100 },
            { month: "Nov", forecast: 2400, actual: 2500 },
            { month: "Dec", forecast: 2800, actual: 2700 },
            { month: "Jan", forecast: 2600, actual: 2650 },
            { month: "Feb", forecast: 2900, actual: 2850 }
        ]
    };

    res.json(data);
});

// ============================================
// DEAL DESK ENDPOINTS (PHASE 3)
// ============================================

// Get approval queue
crmMockRouter.get("/deal-desk/queue", (req, res) => {
    const queue = [
        {
            id: "approval-1",
            quoteId: "quote-123",
            quoteName: "Q-2026-001 - Enterprise Package",
            customerName: "Acme Corporation",
            amount: 250000,
            requestedDiscount: 22,
            reason: "Strategic account - competitor threatening with 25% discount. Customer committed to 3-year contract if we match pricing.",
            status: "PENDING",
            requestedBy: "John Doe",
            requestedAt: "2026-02-11T14:30:00Z",
            approvalChain: [
                { role: "Sales Manager", approver: "Sarah Johnson", status: "APPROVED", timestamp: "2026-02-11T15:00:00Z" },
                { role: "VP Sales", approver: "Michael Chen", status: "PENDING" },
                { role: "CFO", approver: "Lisa Thompson", status: "PENDING" }
            ],
            slaRemaining: 8
        },
        {
            id: "approval-2",
            quoteId: "quote-124",
            quoteName: "Q-2026-002 - Professional Services",
            customerName: "TechStart Inc",
            amount: 125000,
            requestedDiscount: 18,
            reason: "Early adopter pricing - startup with high growth potential. Requesting waiver of setup fees.",
            status: "PENDING",
            requestedBy: "Jane Smith",
            requestedAt: "2026-02-11T16:00:00Z",
            approvalChain: [
                { role: "Sales Manager", approver: "Sarah Johnson", status: "PENDING" },
                { role: "VP Sales", approver: "Michael Chen", status: "PENDING" }
            ],
            slaRemaining: 6
        },
        {
            id: "approval-3",
            quoteId: "quote-110",
            quoteName: "Q-2026-003 - Cloud Migration",
            customerName: "GlobalCo",
            amount: 500000,
            requestedDiscount: 15,
            reason: "Volume discount - migrating 500+ users. Industry benchmark pricing.",
            status: "APPROVED",
            requestedBy: "Bob Wilson",
            requestedAt: "2026-02-10T10:00:00Z",
            approvalChain: [
                { role: "Sales Manager", approver: "Sarah Johnson", status: "APPROVED", timestamp: "2026-02-10T11:30:00Z" },
                { role: "VP Sales", approver: "Michael Chen", status: "APPROVED", timestamp: "2026-02-10T14:00:00Z" }
            ],
            slaRemaining: 0
        },
        {
            id: "approval-4",
            quoteId: "quote-111",
            quoteName: "Q-2026-004 - Starter Package",
            customerName: "SmallBiz LLC",
            amount: 35000,
            requestedDiscount: 30,
            reason: "Non-profit organization with limited budget.",
            status: "REJECTED",
            requestedBy: "Alice Johnson",
            requestedAt: "2026-02-09T09:00:00Z",
            approvalChain: [
                { role: "Sales Manager", approver: "Sarah Johnson", status: "REJECTED", timestamp: "2026-02-09T10:30:00Z" }
            ],
            slaRemaining: 0
        }
    ];

    res.json(queue);
});

// Approve quote
crmMockRouter.post("/quotes/:id/approve", (req, res) => {
    const { id } = req.params;

    res.json({
        id,
        status: "APPROVED",
        approvedBy: "Current User",
        approvedAt: new Date().toISOString(),
        message: "Quote discount approved successfully"
    });
});

// Reject quote
crmMockRouter.post("/quotes/:id/reject", (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    res.json({
        id,
        status: "REJECTED",
        rejectedBy: "Current User",
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
        message: "Quote discount request rejected"
    });
});

// ============================================
// PRODUCT CATALOG ENDPOINTS (PHASE 4)
// ============================================

// Get products with filters
crmMockRouter.get("/catalog/products", (req, res) => {
    const { status, category } = req.query;

    let products = [
        {
            id: "prod-1",
            name: "Enterprise License - Unlimited Users",
            sku: "ENT-UNL-001",
            category: "Software",
            listPrice: 95000,
            costPrice: 38000,
            status: "ACTIVE",
            productFamily: "Enterprise Suite",
            isBundle: false,
            pricingTiers: [
                { minQty: 1, price: 95000 },
                { minQty: 5, price: 85000 },
                { minQty: 10, price: 75000 }
            ]
        },
        {
            id: "prod-2",
            name: "Professional Services Package",
            sku: "SVC-PRO-100",
            category: "Services",
            listPrice: 25000,
            costPrice: 15000,
            status: "ACTIVE",
            productFamily: "Professional Services",
            isBundle: false
        },
        {
            id: "prod-3",
            name: "Cloud Infrastructure - Premium",
            sku: "CLOUD-PREM-500",
            category: "Infrastructure",
            listPrice: 12000,
            costPrice: 4800,
            status: "ACTIVE",
            productFamily: "Cloud Services",
            isBundle: false
        },
        {
            id: "prod-4",
            name: "Complete Enterprise Bundle",
            sku: "BUNDLE-ENT-001",
            category: "Bundles",
            listPrice: 120000,
            costPrice: 55000,
            status: "ACTIVE",
            productFamily: "Enterprise Suite",
            isBundle: true,
            bundleComponents: [
                { productId: "prod-1", quantity: 1 },
                { productId: "prod-2", quantity: 1 },
                { productId: "prod-3", quantity: 1 }
            ]
        },
        {
            id: "prod-5",
            name: "Legacy Support Package",
            sku: "SUP-LEG-200",
            category: "Support",
            listPrice: 8000,
            costPrice: 3200,
            status: "INACTIVE",
            productFamily: "Support Services",
            isBundle: false
        },
        {
            id: "prod-6",
            name: "Deprecated Training Module",
            sku: "TRN-OLD-100",
            category: "Training",
            listPrice: 5000,
            costPrice: 2000,
            status: "ARCHIVED",
            productFamily: "Training",
            isBundle: false
        }
    ];

    // Apply filters
    if (status && status !== "all") {
        products = products.filter(p => p.status === status);
    }
    if (category && category !== "all") {
        products = products.filter(p => p.category === category);
    }

    res.json(products);
});

// Create product
crmMockRouter.post("/catalog/products", (req, res) => {
    const product = req.body;

    res.json({
        id: `prod-${Date.now()}`,
        ...product,
        status: product.status || "ACTIVE",
        createdAt: new Date().toISOString()
    });
});

// Update product
crmMockRouter.put("/catalog/products/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    res.json({
        id,
        ...updates,
        updatedAt: new Date().toISOString()
    });
});

// Archive product
crmMockRouter.post("/catalog/products/:id/archive", (req, res) => {
    const { id } = req.params;

    res.json({
        id,
        status: "ARCHIVED",
        archivedAt: new Date().toISOString(),
        message: "Product archived successfully"
    });
});

// Get price books
crmMockRouter.get("/catalog/price-books", (req, res) => {
    const priceBooks = [
        {
            id: "pb-standard",
            name: "Standard Price Book",
            isStandard: true,
            effectiveDate: "2025-01-01",
            products: [
                { productId: "prod-1", price: 95000 },
                { productId: "prod-2", price: 25000 },
                { productId: "prod-3", price: 12000 }
            ]
        },
        {
            id: "pb-partner",
            name: "Partner Discount Price Book",
            isStandard: false,
            effectiveDate: "2025-01-01",
            expirationDate: "2025-12-31",
            products: [
                { productId: "prod-1", price: 80750 },
                { productId: "prod-2", price: 21250 },
                { productId: "prod-3", price: 10200 }
            ]
        },
        {
            id: "pb-volume",
            name: "Volume Discount Price Book",
            isStandard: false,
            effectiveDate: "2025-06-01",
            products: [
                { productId: "prod-1", price: 71250 },
                { productId: "prod-2", price: 20000 },
                { productId: "prod-3", price: 9600 }
            ]
        }
    ];

    res.json(priceBooks);
});

// ============================================
// CPQ CONFIGURATION ENDPOINTS (PHASE 4)
// ============================================

// Get configurable products
crmMockRouter.get("/cpq/products", (req, res) => {
    const products = [
        {
            id: "config-1",
            name: "Custom Enterprise Solution",
            basePrice: 100000,
            category: "Configurable"
        },
        {
            id: "config-2",
            name: "Tailored Cloud Package",
            basePrice: 50000,
            category: "Configurable"
        },
        {
            id: "config-3",
            name: "Modular Support Plan",
            basePrice: 15000,
            category: "Configurable"
        }
    ];

    res.json(products);
});

// Get product configuration
crmMockRouter.get("/cpq/products/:id/configuration", (req, res) => {
    const { id } = req.params;

    const configs: Record<string, any> = {
        "config-1": {
            baseProduct: {
                id: "config-1",
                name: "Custom Enterprise Solution",
                basePrice: 100000
            },
            options: [
                {
                    id: "user-tier",
                    name: "User Tier",
                    type: "SELECT",
                    required: true,
                    options: ["1-50 Users", "51-200 Users", "201-500 Users", "Unlimited"],
                    defaultValue: "1-50 Users"
                },
                {
                    id: "deployment",
                    name: "Deployment Type",
                    type: "SELECT",
                    required: true,
                    options: ["Cloud", "On-Premise", "Hybrid"],
                    defaultValue: "Cloud"
                },
                {
                    id: "premium-support",
                    name: "Premium Support (24/7)",
                    type: "CHECKBOX",
                    required: false
                },
                {
                    id: "integrations",
                    name: "Number of API Integrations",
                    type: "NUMBER",
                    required: false,
                    defaultValue: 5,
                    dependencies: [{ optionId: "deployment", value: "Cloud" }]
                },
                {
                    id: "sla",
                    name: "SLA Tier",
                    type: "SELECT",
                    required: false,
                    options: ["Standard (99.5%)", "Enhanced (99.9%)", "Mission Critical (99.99%)"],
                    defaultValue: "Standard (99.5%)",
                    dependencies: [{ optionId: "premium-support", value: true }]
                }
            ],
            rules: [
                {
                    id: "rule-1",
                    name: "On-Premise Deployment Fee",
                    type: "INCLUSION",
                    condition: "deployment = On-Premise",
                    action: "Add $25,000 setup fee"
                },
                {
                    id: "rule-2",
                    name: "Unlimited Users Discount",
                    type: "INCLUSION",
                    condition: "user-tier = Unlimited",
                    action: "Apply 10% discount on integrations"
                },
                {
                    id: "rule-3",
                    name: "Premium SLA Requires Support",
                    type: "DEPENDENCY",
                    condition: "sla != Standard",
                    action: "Requires Premium Support = true"
                }
            ]
        },
        "config-2": {
            baseProduct: {
                id: "config-2",
                name: "Tailored Cloud Package",
                basePrice: 50000
            },
            options: [
                {
                    id: "storage",
                    name: "Storage Capacity",
                    type: "SELECT",
                    required: true,
                    options: ["500GB", "1TB", "5TB", "10TB"],
                    defaultValue: "1TB"
                },
                {
                    id: "backup",
                    name: "Automated Backup",
                    type: "CHECKBOX",
                    required: false
                },
                {
                    id: "regions",
                    name: "Geographic Regions",
                    type: "NUMBER",
                    required: true,
                    defaultValue: 1
                }
            ],
            rules: [
                {
                    id: "rule-1",
                    name: "Multi-Region Premium",
                    type: "INCLUSION",
                    condition: "regions > 1",
                    action: "Add $5,000 per region"
                }
            ]
        }
    };

    res.json(configs[id] || configs["config-1"]);
});

// Validate configuration
crmMockRouter.post("/cpq/products/:id/validate", (req, res) => {
    const { id } = req.params;
    const { configuration } = req.body;

    const errors: string[] = [];

    // Mock validation logic
    if (!configuration["user-tier"]) {
        errors.push("User Tier is required");
    }
    if (!configuration["deployment"]) {
        errors.push("Deployment Type is required");
    }
    if (configuration["sla"] && configuration["sla"] !== "Standard (99.5%)" && !configuration["premium-support"]) {
        errors.push("Enhanced SLA requires Premium Support");
    }

    res.json({
        isValid: errors.length === 0,
        errors
    });
});

// Calculate pricing
crmMockRouter.post("/cpq/products/:id/price", (req, res) => {
    const { id } = req.params;
    const { configuration } = req.body;

    let total = 100000; // Base price
    const options: any[] = [];

    // Mock pricing logic
    if (configuration["user-tier"] === "51-200 Users") {
        options.push({ name: "User Tier: 51-200", price: 25000 });
        total += 25000;
    } else if (configuration["user-tier"] === "201-500 Users") {
        options.push({ name: "User Tier: 201-500", price: 50000 });
        total += 50000;
    } else if (configuration["user-tier"] === "Unlimited") {
        options.push({ name: "User Tier: Unlimited", price: 100000 });
        total += 100000;
    }

    if (configuration["deployment"] === "On-Premise") {
        options.push({ name: "On-Premise Setup", price: 25000 });
        total += 25000;
    } else if (configuration["deployment"] === "Hybrid") {
        options.push({ name: "Hybrid Deploy", price: 15000 });
        total += 15000;
    }

    if (configuration["premium-support"]) {
        options.push({ name: "Premium Support", price: 20000 });
        total += 20000;
    }

    const integrations = configuration["integrations"] || 0;
    if (integrations > 5) {
        const extraCost = (integrations - 5) * 2000;
        options.push({ name: `${integrations - 5} Extra Integrations`, price: extraCost });
        total += extraCost;
    }

    res.json({
        total,
        options,
        discount: 0
    });
});

// Save configuration
crmMockRouter.post("/cpq/configurations", (req, res) => {
    const { productId, configuration, pricing } = req.body;

    res.json({
        id: `config-saved-${Date.now()}`,
        productId,
        configuration,
        pricing,
        createdAt: new Date().toISOString(),
        message: "Configuration saved successfully"
    });
});

// ============================================
// MARKETING AUTOMATION ENDPOINTS (PHASE 5)
// ============================================

// Get email campaigns
crmMockRouter.get("/marketing/campaigns", (req, res) => {
    const campaigns = [
        {
            id: "camp-1",
            name: "Q1 Product Launch",
            subject: "Introducing Our Latest Innovation",
            fromName: "Marketing Team",
            fromEmail: "marketing@company.com",
            segment: "Enterprise Leads",
            status: "SENT",
            stats: {
                sent: 5000,
                delivered: 4950,
                opened: 2475,
                clicked: 742,
                bounced: 50
            }
        },
        {
            id: "camp-2",
            name: "Customer Success Stories",
            subject: "See How Our Customers Are Winning",
            fromName: "Customer Success",
            fromEmail: "success@company.com",
            segment: "Active Customers",
            status: "SENT",
            stats: {
                sent: 3200,
                delivered: 3180,
                opened: 1590,
                clicked: 477,
                bounced: 20
            }
        },
        {
            id: "camp-3",
            name: "Webinar Invitation",
            subject: "Join Our Exclusive Webinar",
            fromName: "Events Team",
            fromEmail: "events@company.com",
            segment: "Hot Leads",
            status: "SCHEDULED",
            scheduledDate: "2026-02-15 10:00 AM"
        },
        {
            id: "camp-4",
            name: "Feature Update Announcement",
            subject: "New Features You'll Love",
            fromName: "Product Team",
            fromEmail: "product@company.com",
            segment: "All Contacts",
            status: "DRAFT"
        }
    ];

    res.json(campaigns);
});

// Create/update campaign
crmMockRouter.post("/marketing/campaigns", (req, res) => {
    const campaign = req.body;
    res.json({
        id: `camp-${Date.now()}`,
        ...campaign,
        createdAt: new Date().toISOString()
    });
});

crmMockRouter.put("/marketing/campaigns/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    res.json({
        id,
        ...updates,
        updatedAt: new Date().toISOString()
    });
});

// Send campaign
crmMockRouter.post("/marketing/campaigns/:id/send", (req, res) => {
    const { id } = req.params;
    res.json({
        id,
        status: "SENT",
        sentAt: new Date().toISOString(),
        message: "Campaign sent successfully"
    });
});

// Get marketing segments
crmMockRouter.get("/marketing/segments", (req, res) => {
    const segments = [
        {
            id: "seg-1",
            name: "Enterprise Leads",
            count: 5000,
            criteria: "Company size > 500 employees"
        },
        {
            id: "seg-2",
            name: "Active Customers",
            count: 3200,
            criteria: "Last activity < 30 days"
        },
        {
            id: "seg-3",
            name: "Hot Leads",
            count: 1500,
            criteria: "Lead score > 80"
        },
        {
            id: "seg-4",
            name: "All Contacts",
            count: 12000,
            criteria: "All contacts in database"
        },
        {
            id: "seg-5",
            name: "Trial Users",
            count: 800,
            criteria: "Status = Trial"
        }
    ];

    res.json(segments);
});

// Get marketing journeys
crmMockRouter.get("/marketing/journeys", (req, res) => {
    const journeys = [
        {
            id: "journey-1",
            name: "Welcome Journey",
            trigger: "contact_created",
            status: "ACTIVE",
            steps: [
                { id: "step-1", type: "EMAIL", config: { template: "welcome" } },
                { id: "step-2", type: "WAIT", config: { duration: "3 days" } },
                { id: "step-3", type: "EMAIL", config: { template: "getting_started" } },
                { id: "step-4", type: "CONDITION", config: { check: "email_opened" } },
                { id: "step-5", type: "EMAIL", config: { template: "feature_highlight" } }
            ],
            stats: {
                enrolled: 1200,
                completed: 850,
                active: 350
            }
        },
        {
            id: "journey-2",
            name: "Nurture Campaign",
            trigger: "lead_converted",
            status: "ACTIVE",
            steps: [
                { id: "step-1", type: "EMAIL", config: { template: "intro" } },
                { id: "step-2", type: "WAIT", config: { duration: "7 days" } },
                { id: "step-3", type: "EMAIL", config: { template: "case_study" } },
                { id: "step-4", type: "WAIT", config: { duration: "7 days" } },
                { id: "step-5", type: "ACTION", config: { action: "assign_to_sales" } }
            ],
            stats: {
                enrolled: 800,
                completed: 420,
                active: 380
            }
        },
        {
            id: "journey-3",
            name: "Onboarding Sequence",
            trigger: "opportunity_won",
            status: "ACTIVE",
            steps: [
                { id: "step-1", type: "EMAIL", config: { template: "welcome_customer" } },
                { id: "step-2", type: "WAIT", config: { duration: "1 day" } },
                { id: "step-3", type: "EMAIL", config: { template: "setup_guide" } },
                { id: "step-4", type: "WAIT", config: { duration: "3 days" } },
                { id: "step-5", type: "EMAIL", config: { template: "training_invite" } }
            ],
            stats: {
                enrolled: 450,
                completed: 320,
                active: 130
            }
        },
        {
            id: "journey-4",
            name: "Re-engagement Campaign",
            trigger: "email_clicked",
            status: "PAUSED",
            steps: [
                { id: "step-1", type: "EMAIL", config: { template: "miss_you" } },
                { id: "step-2", type: "WAIT", config: { duration: "14 days" } },
                { id: "step-3", type: "EMAIL", config: { template: "special_offer" } }
            ],
            stats: {
                enrolled: 600,
                completed: 200,
                active: 0
            }
        },
        {
            id: "journey-5",
            name: "Product Launch Sequence",
            trigger: "form_submitted",
            status: "DRAFT",
            steps: [
                { id: "step-1", type: "EMAIL", config: { template: "teaser" } },
                { id: "step-2", type: "WAIT", config: { duration: "5 days" } },
                { id: "step-3", type: "EMAIL", config: { template: "launch_announcement" } }
            ],
            stats: {
                enrolled: 0,
                completed: 0,
                active: 0
            }
        }
    ];

    res.json(journeys);
});

// Create/update journey
crmMockRouter.post("/marketing/journeys", (req, res) => {
    const journey = req.body;
    res.json({
        id: `journey-${Date.now()}`,
        ...journey,
        createdAt: new Date().toISOString()
    });
});

crmMockRouter.put("/marketing/journeys/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    res.json({
        id,
        ...updates,
        updatedAt: new Date().toISOString()
    });
});

// Activate journey
crmMockRouter.post("/marketing/journeys/:id/activate", (req, res) => {
    const { id } = req.params;
    res.json({
        id,
        status: "ACTIVE",
        activatedAt: new Date().toISOString(),
        message: "Journey activated successfully"
    });
});

// Pause journey
crmMockRouter.post("/marketing/journeys/:id/pause", (req, res) => {
    const { id } = req.params;
    res.json({
        id,
        status: "PAUSED",
        pausedAt: new Date().toISOString(),
        message: "Journey paused successfully"
    });
});

// ============================================
// SERVICE CONSOLE ENDPOINTS (PHASE 6)
// ============================================

// Get service cases
crmMockRouter.get("/service/cases", (req, res) => {
    const cases = [
        {
            id: "case-1",
            caseNumber: "CS-00001",
            subject: "Cannot access dashboard",
            description: "User unable to login to dashboard after password reset",
            status: "NEW",
            priority: "HIGH",
            type: "TECHNICAL",
            customer: "Acme Corp",
            createdAt: "2026-02-10 14:30",
            slaDeadline: "2026-02-11 14:30",
            slaStatus: "AT_RISK"
        },
        {
            id: "case-2",
            caseNumber: "CS-00002",
            subject: "Billing discrepancy",
            description: "Invoice amount does not match contract terms",
            status: "IN_PROGRESS",
            priority: "MEDIUM",
            type: "BILLING",
            customer: "TechStart Inc",
            assignedTo: "Sarah Johnson",
            createdAt: "2026-02-09 10:15",
            slaDeadline: "2026-02-12 10:15",
            slaStatus: "ON_TIME"
        },
        {
            id: "case-3",
            caseNumber: "CS-00003",
            subject: "System performance issues",
            description: "Slow response times during peak hours",
            status: "NEW",
            priority: "CRITICAL",
            type: "TECHNICAL",
            customer: "Global Solutions",
            createdAt: "2026-02-11 09:00",
            slaDeadline: "2026-02-11 13:00",
            slaStatus: "BREACHED"
        },
        {
            id: "case-4",
            caseNumber: "CS-00004",
            subject: "Feature request - Export to Excel",
            description: "Request to add Excel export functionality to reports",
            status: "IN_PROGRESS",
            priority: "LOW",
            type: "FEATURE_REQUEST",
            customer: "DataCo",
            assignedTo: "Mike Chen",
            createdAt: "2026-02-08 16:20",
            slaDeadline: "2026-02-15 16:20",
            slaStatus: "ON_TIME"
        },
        {
            id: "case-5",
            caseNumber: "CS-00005",
            subject: "Integration setup help",
            description: "Need assistance setting up Salesforce integration",
            status: "WAITING",
            priority: "MEDIUM",
            type: "GENERAL",
            customer: "Enterprise Ltd",
            assignedTo: "John Davis",
            createdAt: "2026-02-07 11:45",
            slaDeadline: "2026-02-10 11:45",
            slaStatus: "AT_RISK"
        },
        {
            id: "case-6",
            caseNumber: "CS-00006",
            subject: "Account access issue resolved",
            description: "Password reset completed successfully",
            status: "RESOLVED",
            priority: "HIGH",
            type: "TECHNICAL",
            customer: "Quick Corp",
            assignedTo: "Sarah Johnson",
            createdAt: "2026-02-06 14:00"
        },
        {
            id: "case-7",
            caseNumber: "CS-00007",
            subject: "Training materials request",
            description: "Request for advanced user training documentation",
            status: "CLOSED",
            priority: "LOW",
            type: "GENERAL",
            customer: "Learning Inc",
            assignedTo: "Mike Chen",
            createdAt: "2026-02-05 09:30"
        }
    ];

    res.json(cases);
});

// Update case
crmMockRouter.put("/service/cases/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    res.json({
        id,
        ...updates,
        updatedAt: new Date().toISOString(),
        message: "Case updated successfully"
    });
});

// Get KB articles
crmMockRouter.get("/service/kb/articles", (req, res) => {
    const { search } = req.query;

    let articles = [
        {
            id: "kb-1",
            title: "How to Reset Your Password",
            summary: "Step-by-step guide to reset your account password",
            content: "Follow these steps to reset your password: 1. Click on 'Forgot Password' on the login page. 2. Enter your email address. 3. Check your email for the reset link. 4. Click the link and create a new password.",
            category: "Account Management",
            status: "PUBLISHED",
            author: "Support Team",
            views: 5420,
            likes: 128,
            helpfulVotes: 245,
            createdAt: "2026-01-15",
            updatedAt: "2026-02-01"
        },
        {
            id: "kb-2",
            title: "Getting Started with API Integration",
            summary: "Complete guide to integrating our API into your application",
            content: "This article covers API authentication, endpoints, rate limits, and best practices for integration. Learn how to generate API keys, make your first request, and handle common errors.",
            category: "Technical",
            status: "PUBLISHED",
            author: "Engineering Team",
            views: 3210,
            likes: 89,
            helpfulVotes: 167,
            createdAt: "2026-01-20",
            updatedAt: "2026-02-05"
        },
        {
            id: "kb-3",
            title: "Understanding Your Invoice",
            summary: "Breakdown of invoice components and billing cycles",
            content: "Learn about subscription charges, usage-based billing, credits, and payment terms. This guide explains each line item on your invoice and how charges are calculated.",
            category: "Billing",
            status: "PUBLISHED",
            author: "Finance Team",
            views: 2180,
            likes: 45,
            helpfulVotes: 98,
            createdAt: "2026-01-10",
            updatedAt: "2026-01-25"
        },
        {
            id: "kb-4",
            title: "Advanced Reporting Features",
            summary: "Create custom reports and dashboards",
            content: "This article is a work in progress covering advanced reporting capabilities including custom fields, filters, and scheduled exports.",
            category: "Features",
            status: "DRAFT",
            author: "Product Team",
            views: 0,
            likes: 0,
            helpfulVotes: 0,
            createdAt: "2026-02-08",
            updatedAt: "2026-02-08"
        },
        {
            id: "kb-5",
            title: "Security Best Practices",
            summary: "Recommendations for keeping your account secure",
            content: "Follow these security best practices: enable two-factor authentication, use strong passwords, review access logs regularly, and never share credentials. Learn about SSO integration and IP whitelisting.",
            category: "Security",
            status: "PUBLISHED",
            author: "Security Team",
            views: 1890,
            likes: 67,
            helpfulVotes: 134,
            createdAt: "2026-01-18",
            updatedAt: "2026-02-02"
        },
        {
            id: "kb-6",
            title: "Troubleshooting Connection Issues",
            summary: "Common connectivity problems and solutions",
            content: "If you're experiencing connection issues, check your network settings, firewall rules, and proxy configuration. This guide covers the most common connectivity problems and how to resolve them.",
            category: "Technical",
            status: "PUBLISHED",
            author: "Support Team",
            views: 2750,
            likes: 58,
            helpfulVotes: 142,
            createdAt: "2026-01-22",
            updatedAt: "2026-02-06"
        }
    ];

    // Simple search filter
    if (search && typeof search === 'string' && search.length > 0) {
        const query = search.toLowerCase();
        articles = articles.filter(a =>
            a.title.toLowerCase().includes(query) ||
            a.summary.toLowerCase().includes(query) ||
            a.content.toLowerCase().includes(query)
        );
    }

    res.json(articles);
});

// Get KB categories
crmMockRouter.get("/service/kb/categories", (req, res) => {
    const categories = [
        { id: "cat-1", name: "Account Management", articleCount: 12 },
        { id: "cat-2", name: "Technical", articleCount: 24 },
        { id: "cat-3", name: "Billing", articleCount: 8 },
        { id: "cat-4", name: "Features", articleCount: 18 },
        { id: "cat-5", name: "Security", articleCount: 6 }
    ];

    res.json(categories);
});

// Create/update KB article
crmMockRouter.post("/service/kb/articles", (req, res) => {
    const article = req.body;
    res.json({
        id: `kb-${Date.now()}`,
        ...article,
        views: 0,
        likes: 0,
        helpfulVotes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
});

crmMockRouter.put("/service/kb/articles/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    res.json({
        id,
        ...updates,
        updatedAt: new Date().toISOString()
    });
});

// Vote helpful on article
crmMockRouter.post("/service/kb/articles/:id/vote", (req, res) => {
    const { id } = req.params;
    res.json({
        id,
        helpfulVotes: Math.floor(Math.random() * 200) + 1,
        message: "Vote recorded"
    });
});

// ============================================
// PARTNER PORTAL ENDPOINTS (PHASE 7)
// ============================================

// Get partners
crmMockRouter.get("/partners", (req, res) => {
    const partners = [
        {
            id: "partner-1",
            name: "Global Tech Solutions",
            tier: "PLATINUM",
            type: "RESELLER",
            status: "ACTIVE",
            certificationLevel: "Advanced Certified",
            dealsRegistered: 45,
            revenue: 3500000,
            winRate: 68,
            contactName: "John Mitchell",
            contactEmail: "john.mitchell@globaltech.com"
        },
        {
            id: "partner-2",
            name: "Enterprise Consultants Inc",
            tier: "GOLD",
            type: "CONSULTANT",
            status: "ACTIVE",
            certificationLevel: "Certified",
            dealsRegistered: 32,
            revenue: 2100000,
            winRate: 62,
            contactName: "Sarah Chen",
            contactEmail: "sarah.chen@entcons.com"
        },
        {
            id: "partner-3",
            name: "CloudBridge Partners",
            tier: "PLATINUM",
            type: "TECHNOLOGY",
            status: "ACTIVE",
            certificationLevel: "Expert Certified",
            dealsRegistered: 58,
            revenue: 4200000,
            winRate: 74,
            contactName: "David Park",
            contactEmail: "david.park@cloudbridge.com"
        },
        {
            id: "partner-4",
            name: "Regional IT Services",
            tier: "SILVER",
            type: "RESELLER",
            status: "ACTIVE",
            certificationLevel: "Certified",
            dealsRegistered: 18,
            revenue: 980000,
            winRate: 55,
            contactName: "Maria Rodriguez",
            contactEmail: "maria.r@regionalit.com"
        },
        {
            id: "partner-5",
            name: "SmartBiz Referrals",
            tier: "BRONZE",
            type: "REFERRAL",
            status: "ACTIVE",
            certificationLevel: "Basic",
            dealsRegistered: 8,
            revenue: 420000,
            winRate: 45,
            contactName: "James Wilson",
            contactEmail: "jwilson@smartbiz.com"
        },
        {
            id: "partner-6",
            name: "Inactive Solutions Corp",
            tier: "SILVER",
            type: "RESELLER",
            status: "INACTIVE",
            certificationLevel: "Certified",
            dealsRegistered: 12,
            revenue: 650000,
            winRate: 48,
            contactName: "Tom Anderson",
            contactEmail: "tom@inactivesol.com"
        }
    ];

    res.json(partners);
});

// Update partner
crmMockRouter.put("/partners/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    res.json({
        id,
        ...updates,
        updatedAt: new Date().toISOString(),
        message: "Partner updated successfully"
    });
});

// Get deal registrations
crmMockRouter.get("/partners/deal-registrations", (req, res) => {
    const deals = [
        {
            id: "deal-1",
            dealName: "Acme Corp Enterprise Rollout",
            customerName: "Acme Corporation",
            partnerName: "Global Tech Solutions",
            estimatedValue: 450000,
            expectedCloseDate: "2026-03-15",
            status: "PENDING",
            productType: "Enterprise License",
            description: "Full enterprise deployment for 5000 users across 12 locations",
            submittedBy: "John Mitchell",
            submittedDate: "2026-02-10"
        },
        {
            id: "deal-2",
            dealName: "TechStart Digital Transformation",
            customerName: "TechStart Inc",
            partnerName: "Enterprise Consultants Inc",
            estimatedValue: 320000,
            expectedCloseDate: "2026-02-28",
            status: "APPROVED",
            productType: "Professional Services",
            description: "Consulting engagement for cloud migration and system integration",
            submittedBy: "Sarah Chen",
            submittedDate: "2026-01-25",
            reviewedBy: "Sales Manager",
            reviewedDate: "2026-01-26"
        },
        {
            id: "deal-3",
            dealName: "GlobalCo Platform Migration",
            customerName: "GlobalCo Industries",
            partnerName: "CloudBridge Partners",
            estimatedValue: 580000,
            expectedCloseDate: "2026-04-10",
            status: "PENDING",
            productType: "Cloud Platform",
            description: "Migration of legacy systems to cloud platform with integration services",
            submittedBy: "David Park",
            submittedDate: "2026-02-09"
        },
        {
            id: "deal-4",
            dealName: "DataCorp Analytics Suite",
            customerName: "DataCorp",
            partnerName: "Regional IT Services",
            estimatedValue: 180000,
            expectedCloseDate: "2026-03-05",
            status: "REJECTED",
            productType: "Analytics License",
            description: "Analytics platform for business intelligence team",
            submittedBy: "Maria Rodriguez",
            submittedDate: "2026-02-01",
            reviewedBy: "Channel Manager",
            reviewedDate: "2026-02-02",
            rejectionReason: "Duplicate registration - already being handled by direct sales team"
        },
        {
            id: "deal-5",
            dealName: "SmallBiz CRM Implementation",
            customerName: "SmallBiz LLC",
            partnerName: "SmartBiz Referrals",
            estimatedValue: 45000,
            expectedCloseDate: "2026-02-25",
            status: "APPROVED",
            productType: "CRM Starter",
            description: "Small business CRM implementation for 50 users",
            submittedBy: "James Wilson",
            submittedDate: "2026-02-05",
            reviewedBy: "Partner Manager",
            reviewedDate: "2026-02-06"
        },
        {
            id: "deal-6",
            dealName: "Enterprise Security Upgrade",
            customerName: "SecureCo Financial",
            partnerName: "Global Tech Solutions",
            estimatedValue: 625000,
            expectedCloseDate: "2026-05-01",
            status: "PENDING",
            productType: "Security Suite",
            description: "Comprehensive security platform upgrade with compliance features",
            submittedBy: "John Mitchell",
            submittedDate: "2026-02-11"
        }
    ];

    res.json(deals);
});

// Approve deal registration
crmMockRouter.post("/partners/deal-registrations/:id/approve", (req, res) => {
    const { id } = req.params;

    res.json({
        id,
        status: "APPROVED",
        reviewedBy: "Current User",
        reviewedDate: new Date().toISOString(),
        message: "Deal registration approved"
    });
});

// Reject deal registration
crmMockRouter.post("/partners/deal-registrations/:id/reject", (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    res.json({
        id,
        status: "REJECTED",
        reviewedBy: "Current User",
        reviewedDate: new Date().toISOString(),
        rejectionReason: reason || "Not specified",
        message: "Deal registration rejected"
    });
});
