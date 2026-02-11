import { Router } from "express";

const router = Router();

// ===== EPM ROUTES =====

// Budget Control Rules
router.get("/config/budget-rules", async (req, res) => {
    // Mock data - replace with real DB queries
    const rules = [
        {
            id: "RULE-001",
            name: "Marketing Budget Cap",
            ledgerId: "PRIMARY",
            accountRange: "7000-7999",
            threshold: 500000,
            enforcementLevel: "SOFT_BLOCK",
            isActive: true,
            notifyOnBreach: true,
            createdAt: new Date().toISOString()
        },
        {
            id: "RULE-002",
            name: "Department Salary Limit",
            ledgerId: "PRIMARY",
            accountRange: "6000-6999",
            threshold: 2000000,
            enforcementLevel: "HARD_BLOCK",
            isActive: true,
            notifyOnBreach: true,
            createdAt: new Date().toISOString()
        }
    ];
    res.json(rules);
});

router.post("/config/budget-rules", async (req, res) => {
    const { name, ledgerId, accountRange, threshold, enforcementLevel, notifyOnBreach } = req.body;

    const newRule = {
        id: `RULE-${Date.now()}`,
        name,
        ledgerId,
        accountRange,
        threshold: parseFloat(threshold),
        enforcementLevel,
        isActive: true,
        notifyOnBreach,
        createdAt: new Date().toISOString()
    };

    res.status(201).json(newRule);
});

router.patch("/config/budget-rules/:id", async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    res.json({ id, isActive, updatedAt: new Date().toISOString() });
});

// Budget Balances
router.get("/budget-balances", async (req, res) => {
    const { periodName } = req.query;

    // Mock hierarchical budget data
    const balances = [
        {
            ccid: "ACC-6000",
            accountName: "6000 - Salaries & Wages",
            budgeted: 2000000,
            actual: 1850000,
            consumed: 92.5,
            remaining: 150000,
            variance: 150000,
            variancePct: 7.5,
            hasChildren: true,
            children: [
                {
                    ccid: "ACC-6100",
                    accountName: "6100 - Base Salaries",
                    budgeted: 1500000,
                    actual: 1450000,
                    consumed: 96.7,
                    remaining: 50000,
                    variance: 50000,
                    variancePct: 3.3
                }
            ]
        },
        {
            ccid: "ACC-7000",
            accountName: "7000 - Marketing",
            budgeted: 500000,
            actual: 520000,
            consumed: 104,
            remaining: -20000,
            variance: -20000,
            variancePct: -4
        }
    ];

    res.json(balances);
});

router.get("/budget-balances/:ccid/transactions", async (req, res) => {
    const { ccid } = req.params;
    const { periodName } = req.query;

    const transactions = [
        {
            id: "TXN-001",
            date: new Date().toISOString(),
            journalNumber: "JE-2026-001",
            description: "Payroll - January 2026",
            amount: 150000
        },
        {
            id: "TXN-002",
            date: new Date(Date.now() - 86400000).toISOString(),
            journalNumber: "JE-2026-002",
            description: "Contractor Payments",
            amount: 25000
        }
    ];

    res.json(transactions);
});

// Budget Reconciliation
router.get("/reconciliation", async (req, res) => {
    const { periodName } = req.query;

    const items = [
        {
            id: "RECON-001",
            account: "6000-Salaries",
            budgetLineId: "BL-001",
            actualLineId: "AL-001",
            budgetAmount: 2000000,
            actualAmount: 1950000,
            variance: 50000,
            status: "MATCHED",
            matchedBy: "John Doe",
            matchedAt: new Date().toISOString()
        },
        {
            id: "RECON-002",
            account: "7000-Marketing",
            budgetLineId: "BL-002",
            budgetAmount: 500000,
            status: "UNMATCHED"
        }
    ];

    res.json(items);
});

router.post("/reconciliation/:itemId/match", async (req, res) => {
    const { itemId } = req.params;
    const { actualLineId } = req.body;

    res.json({
        id: itemId,
        status: "MATCHED",
        actualLineId,
        matchedBy: "Current User",
        matchedAt: new Date().toISOString()
    });
});

router.post("/reconciliation/sign-off", async (req, res) => {
    const { period, comments } = req.body;

    res.json({
        period,
        signedOffBy: "Current User",
        signedOffAt: new Date().toISOString(),
        comments
    });
});

// Scenario Management
router.get("/scenarios", async (req, res) => {
    const scenarios = [
        {
            id: "SCN-001",
            name: "Baseline Budget 2026",
            version: "1.0",
            createdBy: "Admin",
            createdAt: new Date().toISOString(),
            status: "PUBLISHED",
            isBaseline: true
        },
        {
            id: "SCN-002",
            name: "Best Case Scenario",
            version: "1.0",
            baseScenario: "SCN-001",
            createdBy: "CFO",
            createdAt: new Date().toISOString(),
            status: "DRAFT",
            isBaseline: false
        },
        {
            id: "SCN-003",
            name: "Worst Case Scenario",
            version: "1.0",
            baseScenario: "SCN-001",
            createdBy: "CFO",
            createdAt: new Date().toISOString(),
            status: "ACTIVE",
            isBaseline: false
        }
    ];

    res.json(scenarios);
});

router.post("/scenarios", async (req, res) => {
    const { name, baseScenario } = req.body;

    const newScenario = {
        id: `SCN-${Date.now()}`,
        name,
        version: "1.0",
        baseScenario,
        createdBy: "Current User",
        createdAt: new Date().toISOString(),
        status: "DRAFT",
        isBaseline: false
    };

    res.status(201).json(newScenario);
});

router.get("/scenarios/compare", async (req, res) => {
    const scenarioIds = Array.isArray(req.query.scenarioId)
        ? req.query.scenarioId
        : [req.query.scenarioId];

    // Mock comparison data
    const data = [
        { scenarioId: scenarioIds[0], account: "6000-Salaries", amount: 2000000 },
        { scenarioId: scenarioIds[0], account: "7000-Marketing", amount: 500000 },
        { scenarioId: scenarioIds[1], account: "6000-Salaries", amount: 2200000 },
        { scenarioId: scenarioIds[1], account: "7000-Marketing", amount: 600000 }
    ];

    res.json(data);
});

router.post("/scenarios/:id/publish", async (req, res) => {
    const { id } = req.params;

    res.json({
        id,
        status: "PUBLISHED",
        publishedBy: "Current User",
        publishedAt: new Date().toISOString()
    });
});

// Budget Workflow
router.get("/workflow/submissions", async (req, res) => {
    const submissions = [
        {
            id: "SUB-001",
            budgetName: "Marketing Budget 2026",
            version: "1.0",
            submittedBy: "Jane Smith",
            submittedAt: new Date().toISOString(),
            currentApprover: "John Doe",
            status: "PENDING",
            amount: 500000,
            department: "Marketing"
        },
        {
            id: "SUB-002",
            budgetName: "IT Budget 2026",
            version: "1.0",
            submittedBy: "Bob Johnson",
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            status: "APPROVED",
            amount: 1200000,
            department: "IT"
        }
    ];

    res.json(submissions);
});

router.get("/workflow/submissions/:id/history", async (req, res) => {
    const { id } = req.params;

    const history = [
        {
            id: "HIST-001",
            userId: "user-1",
            userName: "Jane Smith",
            comment: "Submitted for approval",
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            action: "SUBMIT"
        },
        {
            id: "HIST-002",
            userId: "user-2",
            userName: "John Doe",
            comment: "Reviewed - looks good",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            action: "COMMENT"
        }
    ];

    res.json(history);
});

router.post("/workflow/submit", async (req, res) => {
    const { budgetId } = req.body;

    res.status(201).json({
        id: `SUB-${Date.now()}`,
        budgetId,
        status: "PENDING",
        submittedBy: "Current User",
        submittedAt: new Date().toISOString()
    });
});

router.post("/workflow/submissions/:id/approve", async (req, res) => {
    const { id } = req.params;
    const { comments } = req.body;

    res.json({
        id,
        status: "APPROVED",
        approvedBy: "Current User",
        approvedAt: new Date().toISOString(),
        comments
    });
});

router.post("/workflow/submissions/:id/reject", async (req, res) => {
    const { id } = req.params;
    const { comments } = req.body;

    res.json({
        id,
        status: "REJECTED",
        rejectedBy: "Current User",
        rejectedAt: new Date().toISOString(),
        comments
    });
});

// Budget Allocations
router.get("/allocations", async (req, res) => {
    const rules = [
        {
            id: "ALLOC-001",
            name: "Overhead Allocation",
            sourceAccount: "8000-Overhead",
            totalAmount: 1000000,
            basis: "HEADCOUNT",
            isActive: true
        },
        {
            id: "ALLOC-002",
            name: "IT Cost Allocation",
            sourceAccount: "7500-IT Services",
            totalAmount: 500000,
            basis: "REVENUE",
            isActive: true
        }
    ];

    res.json(rules);
});

router.post("/allocations", async (req, res) => {
    const { name, sourceAccount, totalAmount, basis } = req.body;

    const newRule = {
        id: `ALLOC-${Date.now()}`,
        name,
        sourceAccount,
        totalAmount: parseFloat(totalAmount),
        basis,
        isActive: true
    };

    res.status(201).json(newRule);
});

router.get("/allocations/:id/targets", async (req, res) => {
    const { id } = req.params;

    const targets = [
        {
            id: "TGT-001",
            ruleId: id,
            targetAccount: "DEPT-001-Sales",
            weight: 40,
            percentage: 40,
            allocatedAmount: 400000
        },
        {
            id: "TGT-002",
            ruleId: id,
            targetAccount: "DEPT-002-Marketing",
            weight: 30,
            percentage: 30,
            allocatedAmount: 300000
        },
        {
            id: "TGT-003",
            ruleId: id,
            targetAccount: "DEPT-003-Operations",
            weight: 30,
            percentage: 30,
            allocatedAmount: 300000
        }
    ];

    res.json(targets);
});

router.post("/allocations/:id/preview", async (req, res) => {
    const { id } = req.params;

    const preview = {
        ruleId: id,
        totalAllocated: 1000000,
        targets: [
            { account: "DEPT-001-Sales", amount: 400000, percentage: 40 },
            { account: "DEPT-002-Marketing", amount: 300000, percentage: 30 },
            { account: "DEPT-003-Operations", amount: 300000, percentage: 30 }
        ]
    };

    res.json(preview);
});

router.post("/allocations/:id/execute", async (req, res) => {
    const { id } = req.params;

    res.json({
        ruleId: id,
        executedBy: "Current User",
        executedAt: new Date().toISOString(),
        status: "COMPLETED"
    });
});

export default router;
