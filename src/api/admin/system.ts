import { Hono } from 'hono';
import { SystemConfigService, FeatureFlagService } from '@/services/admin/system-config.service';

const app = new Hono();

// ===== System Configuration =====

// Get all configurations
app.get('/config', async (c) => {
    try {
        const category = c.req.query('category');
        const configs = await SystemConfigService.getAll(category);
        return c.json(configs);
    } catch (error) {
        return c.json({ error: 'Failed to fetch configurations' }, 500);
    }
});

// Get configuration by key
app.get('/config/:key', async (c) => {
    try {
        const value = await SystemConfigService.get(c.req.param('key'));
        if (!value) {
            return c.json({ error: 'Configuration not found' }, 404);
        }
        return c.json({ key: c.req.param('key'), value });
    } catch (error) {
        return c.json({ error: 'Failed to fetch configuration' }, 500);
    }
});

// Set configuration
app.put('/config/:key', async (c) => {
    try {
        const body = await c.req.json();
        const config = await SystemConfigService.set(
            c.req.param('key'),
            body.value,
            body.category,
            body.description,
            body.updatedBy
        );
        return c.json(config);
    } catch (error) {
        return c.json({ error: 'Failed to set configuration' }, 500);
    }
});

// Delete configuration
app.delete('/config/:key', async (c) => {
    try {
        await SystemConfigService.delete(c.req.param('key'));
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: 'Failed to delete configuration' }, 500);
    }
});

// ===== Feature Flags =====

// Get all feature flags
app.get('/flags', async (c) => {
    try {
        const flags = await FeatureFlagService.getAll();
        return c.json(flags);
    } catch (error) {
        return c.json({ error: 'Failed to fetch feature flags' }, 500);
    }
});

// Check if feature is enabled
app.get('/flags/:name/enabled', async (c) => {
    try {
        const enabled = await FeatureFlagService.isEnabled(c.req.param('name'));
        return c.json({ name: c.req.param('name'), enabled });
    } catch (error) {
        return c.json({ error: 'Failed to check feature flag' }, 500);
    }
});

// Create feature flag
app.post('/flags', async (c) => {
    try {
        const body = await c.req.json();
        const flag = await FeatureFlagService.create(
            body.name,
            body.enabled,
            body.description
        );
        return c.json(flag, 201);
    } catch (error) {
        return c.json({ error: 'Failed to create feature flag' }, 500);
    }
});

// Enable feature flag
app.post('/flags/:name/enable', async (c) => {
    try {
        const flag = await FeatureFlagService.enable(c.req.param('name'));
        return c.json(flag);
    } catch (error) {
        return c.json({ error: 'Failed to enable feature flag' }, 500);
    }
});

// Disable feature flag
app.post('/flags/:name/disable', async (c) => {
    try {
        const flag = await FeatureFlagService.disable(c.req.param('name'));
        return c.json(flag);
    } catch (error) {
        return c.json({ error: 'Failed to disable feature flag' }, 500);
    }
});

export default app;
