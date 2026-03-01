import { QueryClient, QueryFunction, QueryCache } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEnterpriseStore } from "./enterpriseStore";

const DEFAULT_TENANT_ID = "tenant1";
const DEFAULT_USER_ID = "user1";
const DEFAULT_USER_ROLE = "admin";

function getRBACHeaders() {
  const headers: Record<string, string> = {
    "x-tenant-id": DEFAULT_TENANT_ID,
    "x-user-id": DEFAULT_USER_ID,
    "x-user-role": DEFAULT_USER_ROLE,
  };

  // Inject Enterprise Scoping Contexts
  const { legalEntityId, businessUnitId } = useEnterpriseStore.getState();

  // Legacy localStorage variables from prior V1 configs
  const activeBu = localStorage.getItem('nexus_active_bu');
  const activeLe = localStorage.getItem('nexus_active_le');
  const activeInvOrg = localStorage.getItem('nexus_active_inv_org');
  const activeLedger = localStorage.getItem('nexus_active_ledger');

  if (businessUnitId || activeBu) headers["x-business-unit-id"] = businessUnitId || activeBu || "";
  if (legalEntityId || activeLe) headers["x-legal-entity-id"] = legalEntityId || activeLe || "";
  if (activeInvOrg) headers["x-inventory-org-id"] = activeInvOrg;
  if (activeLedger) headers["x-ledger-id"] = activeLedger;

  return headers;
}

// ── Global Fetch Interceptor ──
// Catches API errors at the network level BEFORE .catch(() => []) can swallow them.
// This ensures error toasts appear even for the 350+ files that still use the
// error-swallowing pattern in their queryFn.
let lastApiErrorToast = 0;
const API_ERROR_THROTTLE_MS = 3000;

const originalFetch = window.fetch;
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url;

  // Create a copy of init to safely modify it
  let fetchInit = init ? { ...init } : {};

  if (url.startsWith("/api/")) {
    const rbacHeaders = getRBACHeaders();
    const headers = new Headers(fetchInit.headers);

    for (const [key, value] of Object.entries(rbacHeaders)) {
      if (!headers.has(key)) {
        headers.set(key, value);
      }
    }
    fetchInit.headers = headers;
  }

  const response = await originalFetch.call(this, input, fetchInit);

  if (url.startsWith("/api/")) {
    const now = Date.now();
    const contentType = response.headers.get("content-type");

    if (!response.ok && now - lastApiErrorToast > API_ERROR_THROTTLE_MS) {
      lastApiErrorToast = now;
      toast.error(`API Error ${response.status}`, {
        description: url.substring(0, 80),
      });
    } else if (contentType && !contentType.includes("application/json") && now - lastApiErrorToast > API_ERROR_THROTTLE_MS) {
      lastApiErrorToast = now;
      toast.error("Backend returned non-JSON response", {
        description: `${url.substring(0, 60)} → ${contentType}`,
      });
    }
  }

  return response;
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export function buildQueryUrl(basePath: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return basePath;
  }
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: {
      ...getRBACHeaders(),
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      let url: string;

      if (queryKey.length === 1) {
        url = queryKey[0] as string;
      } else if (queryKey.length === 2 && typeof queryKey[1] === "object" && queryKey[1] !== null) {
        url = buildQueryUrl(queryKey[0] as string, queryKey[1] as Record<string, any>);
      } else {
        const pathParts = queryKey.filter(part => typeof part === "string");
        url = pathParts.join("/");
      }

      const res = await fetch(url, {
        headers: getRBACHeaders(),
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);

      const contentType = res.headers.get("content-type");
      if (contentType && !contentType.includes("application/json")) {
        throw new Error(`Expected JSON response but received ${contentType}`);
      }

      return await res.json();
    };

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error("Failed to load data", {
        description: error.message?.substring(0, 100),
      });
    },
  }),
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
