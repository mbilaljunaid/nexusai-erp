import { useQuery } from "@tanstack/react-query";

interface AuthUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
}

export function useAuth() {
  const { data, isLoading, error } = useQuery<AuthState>({
    queryKey: ['/api/auth/user'],
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return {
    isAuthenticated: data?.isAuthenticated ?? false,
    user: data?.user ?? null,
    isLoading,
    error,
  };
}

export function useRequireAuth() {
  const auth = useAuth();
  
  const login = () => {
    window.location.href = '/api/login';
  };

  return {
    ...auth,
    login,
  };
}
