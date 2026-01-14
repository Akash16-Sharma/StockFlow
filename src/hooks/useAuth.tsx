import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session storage key for faster initial load
const SESSION_CACHE_KEY = "stockflow-session-cache";

// Helper to safely parse cached session
function getCachedSession(): { user: User | null; session: Session | null } {
  try {
    const cached = localStorage.getItem(SESSION_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if session is still valid (not expired)
      if (parsed.session?.expires_at) {
        const expiresAt = new Date(parsed.session.expires_at * 1000);
        if (expiresAt > new Date()) {
          return { user: parsed.user, session: parsed.session };
        }
      }
    }
  } catch {
    // Silently fail on parse errors
  }
  return { user: null, session: null };
}

// Helper to cache session
function setCachedSession(user: User | null, session: Session | null) {
  try {
    if (user && session) {
      localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({ user, session }));
    } else {
      localStorage.removeItem(SESSION_CACHE_KEY);
    }
  } catch {
    // Silently fail on storage errors
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize with cached session for faster initial render
  const cached = getCachedSession();
  const [user, setUser] = useState<User | null>(cached.user);
  const [session, setSession] = useState<Session | null>(cached.session);
  const [isLoading, setIsLoading] = useState(!cached.session);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        // Update state synchronously
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
        
        // Cache session for faster next load (deferred)
        setTimeout(() => {
          setCachedSession(newSession?.user ?? null, newSession);
        }, 0);
      }
    );

    // THEN check for existing session (only if no cached session)
    if (!cached.session) {
      supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        setIsLoading(false);
        setCachedSession(existingSession?.user ?? null, existingSession);
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    return { error: error as Error | null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  }, []);

  const signOut = useCallback(async () => {
    setCachedSession(null, null);
    await supabase.auth.signOut();
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut
  }), [user, session, isLoading, signUp, signIn, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
