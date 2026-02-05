
import { Router } from "express";
import { partyService } from "../services/PartyService";
import { locationService } from "../services/LocationService";
import { referenceDataService } from "../services/ReferenceDataService";

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

export { mdmRouter };
