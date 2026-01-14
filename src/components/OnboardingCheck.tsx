import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { isOnboardingComplete } from "@/pages/Onboarding";

interface OnboardingCheckProps {
  children: React.ReactNode;
}

const EXCLUDED_PATHS = ['/onboarding', '/auth', '/forgot-password', '/reset-password', '/confirm-email', '/landing'];

export function OnboardingCheck({ children }: OnboardingCheckProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    
    // Skip check for excluded paths
    if (EXCLUDED_PATHS.includes(location.pathname)) {
      setChecked(true);
      return;
    }

    // If user is logged in and hasn't completed onboarding, redirect
    if (user && !isOnboardingComplete()) {
      navigate('/onboarding', { replace: true });
      return;
    }

    setChecked(true);
  }, [user, isLoading, navigate, location.pathname]);

  if (!checked && !EXCLUDED_PATHS.includes(location.pathname)) {
    return null;
  }

  return <>{children}</>;
}
