
import { Router } from "express";
import { partyService } from "../services/PartyService";
import { locationService } from "../services/LocationService";
import { referenceDataService } from "../services/ReferenceDataService";
import { matchingService } from "../services/MatchingService";
import { matchRuleService } from "../services/MatchRuleService";


const mdmRouter = Router();

// ==========================================
// Party Management
// ==========================================
mdmRouter.post("/parties/organization", async (req, res) => {
    try {
        const result = await partyService.createOrganization(req.body.party, req.body.profile);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

mdmRouter.post("/parties/person", async (req, res) => {
    try {
        const result = await partyService.createPerson(req.body.party, req.body.profile);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

mdmRouter.get("/parties/:id", async (req, res) => {
    try {
        const result = await partyService.getParty(req.params.id);
        if (!result) return res.status(404).json({ error: "Party not found" });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

mdmRouter.get("/parties", async (req, res) => {
    try {
        const result = await partyService.searchParties(req.query.q as string);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// Location Management
// ==========================================
mdmRouter.post("/locations", async (req, res) => {
    try {
        const result = await locationService.createLocation(req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

mdmRouter.get("/parties/:id/locations", async (req, res) => {
    try {
        const result = await locationService.getPartyLocations(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

mdmRouter.post("/parties/:id/locations", async (req, res) => {
    try {
        const result = await locationService.addAddressToParty(req.params.id, req.body.location, req.body.siteUseTypes);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// Reference Data (Lookups)
// ==========================================
mdmRouter.get("/lookups", async (req, res) => {
    try {
        const result = await referenceDataService.getAllLookupTypes();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

mdmRouter.get("/lookups/types/:id", async (req, res) => {
    try {
        const result = await referenceDataService.getLookupTypeById(req.params.id);
        if (!result) return res.status(404).json({ error: "Lookup Type not found" });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
mdmRouter.get("/lookups/:type", async (req, res) => {
    try {
        const result = await referenceDataService.getLookupValues(req.params.type.toUpperCase());
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

mdmRouter.post("/lookups/types", async (req, res) => {
    try {
        const result = await referenceDataService.createLookupType(req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

mdmRouter.post("/lookups/values", async (req, res) => {
    try {
        const result = await referenceDataService.createLookupValue(req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});



// ==========================================
// Dashboard Stats
// ==========================================
mdmRouter.get("/stats", async (req, res) => {
    try {
        const partiesCount = await partyService.countParties();
        const openDupSets = await matchingService.countOpenSets();

        res.json({
            recordsManaged: partiesCount,
            dataQualityScore: 94, // Placeholder for now until we have real scoring history
            policies: 18, // Check rule count
            openDuplicateSets: openDupSets
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// Data Quality (Duplicates)
// ==========================================
mdmRouter.post("/quality/match-batch", async (req, res) => {
    try {
        const result = await matchingService.runBatch(req.body.batchName);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

mdmRouter.get("/quality/duplicates", async (req, res) => {
    try {
        // @ts-ignore
        const result = await matchingService.getOpenSets();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

mdmRouter.post("/quality/duplicates/:setId/resolve", async (req, res) => {
    try {
        const result = await matchingService.resolveSet(req.params.setId, req.body.survivorPartyId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


mdmRouter.get("/parties/:id/relationships", async (req, res) => {
    try {
        const result = await partyService.getRelationships(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// Match Rules (Configuration)
// ==========================================
mdmRouter.get("/match-rules", async (req, res) => {
    try {
        const result = await matchRuleService.getAllRules();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

mdmRouter.post("/match-rules", async (req, res) => {
    try {
        const result = await matchRuleService.createRule(req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

mdmRouter.put("/match-rules/:id", async (req, res) => {
    try {
        const result = await matchRuleService.updateRule(req.params.id, req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export { mdmRouter };


