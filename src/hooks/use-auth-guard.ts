import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {useAuthStore} from "@/lib/store/use-auth-store";
import { useHydration } from "./use-hydration";

export function useAuthGuard() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const isHydrated = useHydration();
  const [isChecking, setIsChecking] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (isHydrated) {
      console.log("useAuthGuard - Hidratado:", { isAuthenticated, user, hasRedirected });

      if (!isAuthenticated && !hasRedirected) {
        console.log("useAuthGuard - Redirecionando para login");
        setHasRedirected(true);
        navigate("/auth/signin");
      } else if (isAuthenticated) {
        console.log("useAuthGuard - Usuário autenticado");
        setHasRedirected(false);
      }

      setIsChecking(false);
    }
  }, [isAuthenticated, isHydrated, navigate, hasRedirected, user]);

  return { 
    isAuthenticated: isHydrated ? isAuthenticated : false, 
    user: isHydrated ? user : null,
    isChecking 
  };
}
