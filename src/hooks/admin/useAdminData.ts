import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { toast } from 'sonner';

// Demo Environments
export const useDemoEnvironments = () => {
    return useQuery({
        queryKey: ['admin', 'demo-environments'],
        queryFn: async () => {
            const { data } = await adminApi.demoEnvironments.getAll();
            return data;
        },
    });
};

export const useDemoEnvironment = (id: string) => {
    return useQuery({
        queryKey: ['admin', 'demo-environments', id],
        queryFn: async () => {
            const { data } = await adminApi.demoEnvironments.getById(id);
            return data;
        },
        enabled: !!id,
    });
};

export const useCreateDemoEnvironment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { companyName: string; industry: string; email: string; firstName: string; lastName: string; }) =>
            adminApi.demoEnvironments.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'demo-environments'] });
            toast.success('Demo environment created successfully');
        },
        onError: () => {
            toast.error('Failed to create demo environment');
        },
    });
};

export const useUpdateDemoEnvironment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...data }: { id: string; companyName?: string; industry?: string; email?: string; firstName?: string; lastName?: string; }) =>
            adminApi.demoEnvironments.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'demo-environments'] });
            toast.success('Demo environment updated successfully');
        },
        onError: () => {
            toast.error('Failed to update demo environment');
        },
    });
};

export const useUpdateDemoStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status, accessUrl }: { id: string; status: string; accessUrl?: string }) =>
            adminApi.demoEnvironments.updateStatus(id, status, accessUrl),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'demo-environments'] });
            toast.success('Demo environment updated');
        },
        onError: () => {
            toast.error('Failed to update demo environment');
        },
    });
};

export const useDeleteDemoEnvironment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => adminApi.demoEnvironments.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'demo-environments'] });
            toast.success('Demo environment deleted');
        },
        onError: () => {
            toast.error('Failed to delete demo environment');
        },
    });
};

// Support Requests
export const useSupportRequests = () => {
    return useQuery({
        queryKey: ['admin', 'support-requests'],
        queryFn: async () => {
            const { data } = await adminApi.supportRequests.getAll();
            return data;
        },
    });
};

export const useCreateSupportRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { subject: string; type: string; priority: string; description: string; email: string; }) =>
            adminApi.supportRequests.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'support-requests'] });
            toast.success('Support request created successfully');
        },
        onError: () => {
            toast.error('Failed to create support request');
        },
    });
};

export const useUpdateSupportRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...data }: { id: string; subject?: string; type?: string; priority?: string; description?: string; email?: string; }) =>
            adminApi.supportRequests.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'support-requests'] });
            toast.success('Support request updated successfully');
        },
        onError: () => {
            toast.error('Failed to update support request');
        },
    });
};

export const useAssignSupportRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, userId }: { id: string; userId: string }) =>
            adminApi.supportRequests.assign(id, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'support-requests'] });
            toast.success('Request assigned');
        },
        onError: () => {
            toast.error('Failed to assign request');
        },
    });
};

export const useCloseSupportRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => adminApi.supportRequests.close(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'support-requests'] });
            toast.success('Request closed');
        },
        onError: () => {
            toast.error('Failed to close request');
        },
    });
};

// Affiliates
export const useAffiliates = () => {
    return useQuery({
        queryKey: ['admin', 'affiliates'],
        queryFn: async () => {
            const { data } = await adminApi.affiliates.getAll();
            return data;
        },
    });
};

export const useAffiliate = (id: string) => {
    return useQuery({
        queryKey: ['admin', 'affiliates', id],
        queryFn: async () => {
            const { data } = await adminApi.affiliates.getById(id);
            return data;
        },
        enabled: !!id,
    });
};

export const useAffiliateReferrals = (id: string) => {
    return useQuery({
        queryKey: ['admin', 'affiliates', id, 'referrals'],
        queryFn: async () => {
            const { data } = await adminApi.affiliates.getReferrals(id);
            return data;
        },
        enabled: !!id,
    });
};

export const useCreateAffiliate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { name: string; email: string; companyName?: string; website?: string; notes?: string; }) =>
            adminApi.affiliates.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'affiliates'] });
            toast.success('Affiliate created successfully');
        },
        onError: () => {
            toast.error('Failed to create affiliate');
        },
    });
};

export const useUpdateAffiliate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...data }: { id: string; name?: string; email?: string; companyName?: string; website?: string; notes?: string; }) =>
            adminApi.affiliates.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'affiliates'] });
            toast.success('Affiliate updated successfully');
        },
        onError: () => {
            toast.error('Failed to update affiliate');
        },
    });
};

export const useUpdateAffiliateStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            adminApi.affiliates.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'affiliates'] });
            toast.success('Affiliate status updated');
        },
        onError: () => {
            toast.error('Failed to update affiliate status');
        },
    });
};

// Feature Flags
export const useFeatureFlags = () => {
    return useQuery({
        queryKey: ['admin', 'feature-flags'],
        queryFn: async () => {
            const { data } = await adminApi.system.getFlags();
            return data;
        },
    });
};

export const useToggleFeatureFlag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ name, enabled }: { name: string; enabled: boolean }) =>
            enabled ? adminApi.system.enableFlag(name) : adminApi.system.disableFlag(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'feature-flags'] });
            toast.success('Feature flag updated');
        },
        onError: () => {
            toast.error('Failed to update feature flag');
        },
    });
};

// System Config
export const useSystemConfig = (category?: string) => {
    return useQuery({
        queryKey: ['admin', 'system-config', category],
        queryFn: async () => {
            const { data } = await adminApi.system.getConfig(category);
            return data;
        },
    });
};

export const useUpdateSystemConfig = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ key, value, category, description }: any) =>
            adminApi.system.setConfig(key, value, category, description),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'system-config'] });
            toast.success('Configuration updated');
        },
        onError: () => {
            toast.error('Failed to update configuration');
        },
    });
};
