import { Hono } from 'hono';
import { SupportRequestService } from '@/services/admin/support-request.service';

const app = new Hono();

// Get all support requests
app.get('/', async (c) => {
    try {
        const status = c.req.query('status');
        const type = c.req.query('type');
        const priority = c.req.query('priority');
        const tenantId = c.req.query('tenantId');

        const requests = await SupportRequestService.getAll({
            status,
            type,
            priority,
            tenantId,
        });
        return c.json(requests);
    } catch (error) {
        return c.json({ error: 'Failed to fetch support requests' }, 500);
    }
});

// Get support request by ID
app.get('/:id', async (c) => {
    try {
        const request = await SupportRequestService.getById(c.req.param('id'));
        if (!request) {
            return c.json({ error: 'Support request not found' }, 404);
        }
        return c.json(request);
    } catch (error) {
        return c.json({ error: 'Failed to fetch support request' }, 500);
    }
});

// Create support request
app.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const request = await SupportRequestService.create(body);
        return c.json(request, 201);
    } catch (error) {
        return c.json({ error: 'Failed to create support request' }, 500);
    }
});

// Update support request
app.patch('/:id', async (c) => {
    try {
        const body = await c.req.json();
        const request = await SupportRequestService.update(c.req.param('id'), body);
        return c.json(request);
    } catch (error) {
        return c.json({ error: 'Failed to update support request' }, 500);
    }
});

// Assign support request
app.post('/:id/assign', async (c) => {
    try {
        const body = await c.req.json();
        const request = await SupportRequestService.assign(
            c.req.param('id'),
            body.userId
        );
        return c.json(request);
    } catch (error) {
        return c.json({ error: 'Failed to assign support request' }, 500);
    }
});

// Close support request
app.post('/:id/close', async (c) => {
    try {
        const request = await SupportRequestService.close(c.req.param('id'));
        return c.json(request);
    } catch (error) {
        return c.json({ error: 'Failed to close support request' }, 500);
    }
});

// Delete support request
app.delete('/:id', async (c) => {
    try {
        await SupportRequestService.delete(c.req.param('id'));
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: 'Failed to delete support request' }, 500);
    }
});

export default app;
