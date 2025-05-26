import { useAuthContext } from "@/components/AuthProvider";

export function useAuth() {
  const { user, loading } = useAuthContext();
  
  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}
