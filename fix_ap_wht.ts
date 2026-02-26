import * as fs from 'fs';

let apRoutes = fs.readFileSync('server/routes/ap.ts', 'utf8');

const whtEndpoints = `
apRouter.get("/wht-groups", async (req, res) => {
    try {
        const groups = await db.select().from(apWhtGroups).orderBy(apWhtGroups.groupName);
        res.json(groups);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apRouter.post("/wht-groups", async (req, res) => {
    try {
        const parse = insertApWhtGroupSchema.parse(req.body);
        const [group] = await db.insert(apWhtGroups).values(parse).returning();
        res.json(group);
    } catch (e: any) {
        res.status(400).json({ error: e.errors || e.message });
    }
});

apRouter.get("/wht-groups/:id/rates", async (req, res) => {
    try {
        const rates = await db.select().from(apWhtRates).where(eq(apWhtRates.groupId, req.params.id)).orderBy(apWhtRates.priority);
        res.json(rates);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

apRouter.post("/wht-groups/:id/rates", async (req, res) => {
    try {
        const parse = insertApWhtRateSchema.parse({ ...req.body, groupId: req.params.id });
        const [rate] = await db.insert(apWhtRates).values(parse).returning();
        res.json(rate);
    } catch (e: any) {
        res.status(400).json({ error: e.errors || e.message });
    }
});
`;

if (!apRoutes.includes('/wht-groups')) {
    // Insert before "export default apRouter;"
    apRoutes = apRoutes.replace("export default apRouter;", whtEndpoints + "\nexport default apRouter;");
    
    // Add imports if missing
    if (!apRoutes.includes('apWhtGroups')) {
        apRoutes = apRoutes.replace('insertApInvoicePaymentSchema', 'insertApInvoicePaymentSchema, apWhtGroups, apWhtRates, insertApWhtGroupSchema, insertApWhtRateSchema');
    }
    
    fs.writeFileSync('server/routes/ap.ts', apRoutes);
    console.log("WHT endpoints added.");
} else {
    console.log("WHT endpoints already exist.");
}
