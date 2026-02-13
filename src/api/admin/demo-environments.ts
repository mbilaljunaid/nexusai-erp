import { Hono } from 'hono';
import { DemoEnvironmentService } from '@/services/admin/demo-environment.service';

const app = new Hono();

// Get all demo environments
app.get('/', async (c) => {
    try {
        const demos = await DemoEnvironmentService.getAll();
        return c.json(demos);
    } catch (error) {
        return c.json({ error: 'Failed to fetch demo environments' }, 500);
    }
});

// Get demo environment by ID
app.get('/:id', async (c) => {
    try {
        const demo = await DemoEnvironmentService.getById(c.req.param('id'));
        if (!demo) {
            return c.json({ error: 'Demo environment not found' }, 404);
        }
        return c.json(demo);
    } catch (error) {
        return c.json({ error: 'Failed to fetch demo environment' }, 500);
    }
});

// Create demo environment
app.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const demo = await DemoEnvironmentService.create({
            name: body.name,
            slug: body.slug,
            industry: body.industry,
            modules: body.modules,
            expiresAt: new Date(body.expiresAt),
        });
        return c.json(demo, 201);
    } catch (error) {
        return c.json({ error: 'Failed to create demo environment' }, 500);
    }
});

// Update demo environment status
app.patch('/:id/status', async (c) => {
    try {
        const body = await c.req.json();
        const demo = await DemoEnvironmentService.updateStatus(
            c.req.param('id'),
            body.status,
            body.accessUrl
        );
        return c.json(demo);
    } catch (error) {
        return c.json({ error: 'Failed to update demo environment' }, 500);
    }
});

// Delete demo environment
app.delete('/:id', async (c) => {
    try {
        await DemoEnvironmentService.delete(c.req.param('id'));
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: 'Failed to delete demo environment' }, 500);
    }
});

export default app;
