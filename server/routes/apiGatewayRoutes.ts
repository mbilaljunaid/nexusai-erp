/**
 * API Gateway Routes - Phase 6
 */

import { Router } from "express";
import { apiGateway } from "../api/apiGateway";
import { integrationManager } from "../integrations/integrationManager";
import { webhookManager } from "../webhooks/webhookManager";
import { apiAuthManager } from "../auth/apiAuth";
import pdfReportRouter from "../routes/pdf-report";




const router = Router();

/**
 * GET /api/docs
 * API documentation
 */
router.get("/docs", (req, res) => {
  try {
    const docs = apiGateway.getDocumentation();
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/docs/:version
 * Get routes for version
 */
router.get("/docs/:version", (req, res) => {
  try {
    const { version } = req.params;
    const routes = apiGateway.getRoutesByVersion(version);
    res.json({ version, routes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/keys
 * Generate API key
 */
router.post("/keys", (req, res) => {
  try {
    const { userId, name, permissions, expiresAt } = req.body;
    const key = apiAuthManager.generateAPIKey(userId, name, permissions, expiresAt);
    res.json(key);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/keys
 * List user's API keys
 */
router.get("/keys", (req, res) => {
  try {
    const { userId } = req.query;
    const keys = apiAuthManager.getUserAPIKeys(userId as string);
    res.json(keys);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/keys/:keyId/revoke
 * Revoke API key
 */
router.post("/keys/:keyId/revoke", (req, res) => {
  try {
    const { keyId } = req.params;
    const success = apiAuthManager.revokeAPIKey(keyId);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/integrations
 * Register integration
 */
router.post("/integrations", (req, res) => {
  try {
    const integration = req.body;
    integrationManager.registerIntegration(integration);
    res.json(integration);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/integrations
 * List integrations
 */
router.get("/integrations", (req, res) => {
  try {
    const integrations = integrationManager.getAllIntegrations();
    res.json(integrations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/integrations/:integrationId/sync
 * Sync integration
 */
router.post("/integrations/:integrationId/sync", async (req, res) => {
  try {
    const { integrationId } = req.params;
    const result = await integrationManager.syncIntegration(integrationId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/webhooks
 * Register webhook
 */
router.post("/webhooks", (req, res) => {
  try {
    const webhook = req.body;
    webhookManager.registerWebhook(webhook);
    res.json(webhook);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/webhooks
 * List webhooks
 */
router.get("/webhooks", (req, res) => {
  try {
    const webhooks = webhookManager.getAllWebhooks();
    res.json(webhooks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/webhooks/:webhookId/events
 * Get webhook events
 */
router.get("/webhooks/:webhookId/events", (req, res) => {
  try {
    const { webhookId } = req.params;
    const events = webhookManager.getWebhookEvents(webhookId);
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PDF report route
router.use('/pdf-report', pdfReportRouter);

export default router;
