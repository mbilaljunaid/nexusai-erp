const API_BASE_URL = '/api';

const fetchJSON = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
};

export const adminApi = {
    // Demo Environments
    demoEnvironments: {
        getAll: () => fetchJSON(`${API_BASE_URL}/admin/demo-environments`),
        getById: (id: string) => fetchJSON(`${API_BASE_URL}/admin/demo-environments/${id}`),
        create: (data: any) => fetchJSON(`${API_BASE_URL}/admin/demo-environments`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: any) => fetchJSON(`${API_BASE_URL}/admin/demo-environments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        updateStatus: (id: string, status: string, accessUrl?: string) =>
            fetchJSON(`${API_BASE_URL}/admin/demo-environments/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status, accessUrl }),
            }),
        delete: (id: string) => fetchJSON(`${API_BASE_URL}/admin/demo-environments/${id}`, {
            method: 'DELETE',
        }),
    },

    // Support Requests
    supportRequests: {
        getAll: (filters?: any) => {
            const params = new URLSearchParams(filters).toString();
            return fetchJSON(`${API_BASE_URL}/admin/support-requests${params ? `?${params}` : ''}`);
        },
        getById: (id: string) => fetchJSON(`${API_BASE_URL}/admin/support-requests/${id}`),
        create: (data: any) => fetchJSON(`${API_BASE_URL}/admin/support-requests`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: any) => fetchJSON(`${API_BASE_URL}/admin/support-requests/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        assign: (id: string, userId: string) =>
            fetchJSON(`${API_BASE_URL}/admin/support-requests/${id}/assign`, {
                method: 'POST',
                body: JSON.stringify({ userId }),
            }),
        close: (id: string) => fetchJSON(`${API_BASE_URL}/admin/support-requests/${id}/close`, {
            method: 'POST',
        }),
        delete: (id: string) => fetchJSON(`${API_BASE_URL}/admin/support-requests/${id}`, {
            method: 'DELETE',
        }),
    },

    // Affiliates
    affiliates: {
        getAll: () => fetchJSON(`${API_BASE_URL}/admin/affiliates`),
        getById: (id: string) => fetchJSON(`${API_BASE_URL}/admin/affiliates/${id}`),
        create: (data: any) => fetchJSON(`${API_BASE_URL}/admin/affiliates`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: string, data: any) => fetchJSON(`${API_BASE_URL}/admin/affiliates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        updateStatus: (id: string, status: string) =>
            fetchJSON(`${API_BASE_URL}/admin/affiliates/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            }),
        getReferrals: (id: string) => fetchJSON(`${API_BASE_URL}/admin/affiliates/${id}/referrals`),
        createReferral: (id: string, tenantId: string) =>
            fetchJSON(`${API_BASE_URL}/admin/affiliates/${id}/referrals`, {
                method: 'POST',
                body: JSON.stringify({ tenantId }),
            }),
        convertReferral: (id: string, commissionAmount: number) =>
            fetchJSON(`${API_BASE_URL}/admin/affiliates/referrals/${id}/convert`, {
                method: 'POST',
                body: JSON.stringify({ commissionAmount }),
            }),
    },

    // System Config
    system: {
        getConfig: (category?: string) => {
            const params = category ? `?category=${category}` : '';
            return fetchJSON(`${API_BASE_URL}/admin/system/config${params}`);
        },
        getConfigValue: (key: string) => fetchJSON(`${API_BASE_URL}/admin/system/config/${key}`),
        setConfig: (key: string, value: any, category?: string, description?: string) =>
            fetchJSON(`${API_BASE_URL}/admin/system/config/${key}`, {
                method: 'PUT',
                body: JSON.stringify({ value, category, description }),
            }),
        deleteConfig: (key: string) => fetchJSON(`${API_BASE_URL}/admin/system/config/${key}`, {
            method: 'DELETE',
        }),

        // Feature Flags
        getFlags: () => fetchJSON(`${API_BASE_URL}/admin/system/flags`),
        checkFlag: (name: string) => fetchJSON(`${API_BASE_URL}/admin/system/flags/${name}/enabled`),
        createFlag: (data: any) => fetchJSON(`${API_BASE_URL}/admin/system/flags`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        enableFlag: (name: string) => fetchJSON(`${API_BASE_URL}/admin/system/flags/${name}/enable`, {
            method: 'POST',
        }),
        disableFlag: (name: string) => fetchJSON(`${API_BASE_URL}/admin/system/flags/${name}/disable`, {
            method: 'POST',
        }),
    },
};
