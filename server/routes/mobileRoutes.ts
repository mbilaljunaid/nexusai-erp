/**
 * Mobile Routes - Phase 7
 */

import { Router } from "express";
import { mobileAPI } from "../mobile/mobileAPI";
import { syncEngine } from "../sync/syncEngine";
import { cacheManager } from "../cache/cacheManager";
import { performanceOptimizer } from "../performance/performanceOptimizer";

const router = Router();

/**
 * GET /api/mobile/forms
 * Get forms for mobile
 */
router.get("/mobile/forms", (req, res) => {
  try {
    const { userId } = req.query;
    const result = mobileAPI.fetchFormsMobile(userId as string);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mobile/forms/:formId
 * Get single form for mobile
 */
router.get("/mobile/forms/:formId", (req, res) => {
  try {
    const { formId } = req.params;
    const { recordId } = req.query;
    const result = mobileAPI.fetchFormMobile(formId, recordId as string);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mobile/forms/:formId/submit
 * Submit form from mobile
 */
router.post("/mobile/forms/:formId/submit", (req, res) => {
  try {
    const { formId } = req.params;
    const { data, userId } = req.body;
    const result = mobileAPI.submitFormMobile(formId, data, userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mobile/sync
 * Delta sync data
 */
router.post("/mobile/sync", (req, res) => {
  try {
    const { userId, requests } = req.body;
    const result = mobileAPI.getSyncData(userId, requests);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mobile/offline/download
 * Download offline package
 */
router.post("/mobile/offline/download", (req, res) => {
  try {
    const { userId, formIds } = req.body;
    const result = mobileAPI.getOfflinePackage(userId, formIds);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mobile/batch-sync
 * Batch sync multiple submissions
 */
router.post("/mobile/batch-sync", async (req, res) => {
  try {
    const { userId, submissions } = req.body;
    const result = mobileAPI.batchSyncMobile(userId, submissions);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/sync/queue
 * Add to offline sync queue
 */
router.post("/sync/queue", (req, res) => {
  try {
    const { userId, formId, data } = req.body;
    const item = syncEngine.addToQueue(userId, formId, data);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/sync/pending
 * Sync pending items
 */
router.post("/sync/pending", async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await syncEngine.syncPending(userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sync/state/:userId
 * Get sync state
 */
router.get("/sync/state/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const state = syncEngine.getSyncState(userId);
    res.json(state);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/performance/metrics
 * Get performance metrics
 */
router.get("/performance/metrics", (req, res) => {
  try {
    const { endpoint, minutes } = req.query;
    const report = performanceOptimizer.getPerformanceReport(
      endpoint as string,
      parseInt(minutes as string) || 60
    );
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/performance/bottlenecks
 * Identify bottlenecks
 */
router.get("/performance/bottlenecks", (req, res) => {
  try {
    const { minutes } = req.query;
    const bottlenecks = performanceOptimizer.identifyBottlenecks(parseInt(minutes as string) || 60);
    res.json(bottlenecks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/cache/stats
 * Get cache statistics
 */
router.get("/cache/stats", (req, res) => {
  try {
    const stats = cacheManager.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
