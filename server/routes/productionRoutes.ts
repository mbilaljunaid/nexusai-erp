/**
 * Production Routes - Phase 8
 */

import { Router } from "express";
import { securityHardener } from "../security/securityHardener";
import { logger } from "../logging/logger";
import { healthChecker } from "../monitoring/healthCheck";
import { backupManager } from "../backup/backupManager";

const router = Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  try {
    const status = healthChecker.getHealthStatus();
    const code = status.status === "healthy" ? 200 : status.status === "degraded" ? 206 : 503;
    res.status(code).json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /logs
 * Get recent logs
 */
router.get("/logs", (req, res) => {
  try {
    const { level, user, endpoint, count } = req.query;
    let logs;

    if (level) logs = logger.getLogsByLevel(level as string);
    else if (user) logs = logger.getLogsByUser(user as string);
    else if (endpoint) logs = logger.getLogsByEndpoint(endpoint as string);
    else logs = logger.getRecentLogs(parseInt(count as string) || 100);

    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /security/whitelist-ip
 * Whitelist IP
 */
router.post("/security/whitelist-ip", (req, res) => {
  try {
    const { ip } = req.body;
    securityHardener.whitelistIP(ip);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /security/blacklist-ip
 * Blacklist IP
 */
router.post("/security/blacklist-ip", (req, res) => {
  try {
    const { ip } = req.body;
    securityHardener.blacklistIP(ip);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /alerts
 * Get active alerts
 */
router.get("/alerts", (req, res) => {
  try {
    const alerts = healthChecker.getActiveAlerts();
    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /backup
 * Create backup
 */
router.post("/backup", async (req, res) => {
  try {
    const { type, dataSize, itemCount } = req.body;
    const backup = backupManager.createBackup(type, dataSize, itemCount);
    res.json(backup);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /restore-points
 * Get restore points
 */
router.get("/restore-points", (req, res) => {
  try {
    const points = backupManager.getAllRestorePoints();
    res.json(points);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /restore-points/:pointId/verify
 * Verify restore point
 */
router.post("/restore-points/:pointId/verify", (req, res) => {
  try {
    const { pointId } = req.params;
    const result = backupManager.verifyBackup(pointId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
