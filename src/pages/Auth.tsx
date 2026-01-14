import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Package, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { authSchema } from "@/lib/validations/product";

// Rate limiting: max 5 attempts per minute
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

export default function Auth() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [attempts, setAttempts] = useState<number[]>([]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // Clean up old attempts
  const cleanAttempts = useCallback(() => {
    const now = Date.now();
    return attempts.filter((t) => now - t < RATE_LIMIT_WINDOW);
  }, [attempts]);

  const isRateLimited = useCallback(() => {
    const recentAttempts = cleanAttempts();
    return recentAttempts.length >= RATE_LIMIT_MAX;
  }, [cleanAttempts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Check rate limit
    if (isRateLimited()) {
      toast.error("Too many attempts", {
        description: "Please wait a minute before trying again.",
      });
      return;
    }

    // Validate inputs
    const result = authSchema.safeParse({ email: email.trim(), password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "email") fieldErrors.email = issue.message;
        if (issue.path[0] === "password") fieldErrors.password = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    setAttempts((prev) => [...cleanAttempts(), Date.now()]);

    try {
      if (isLogin) {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Please verify your email before signing in");
          } else {
            toast.error("Sign in failed. Please try again.");
          }
        } else {
          toast.success("Welcome back!");
          navigate("/", { replace: true });
        }
      } else {
        const { error } = await signUp(email.trim(), password);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("An account with this email already exists");
          } else if (error.message.includes("weak_password") || error.message.includes("Password")) {
            toast.error("Please use a stronger password");
          } else {
            toast.error("Sign up failed. Please try again.");
          }
        } else {
          toast.success("Account created successfully!");
          navigate("/", { replace: true });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-3 bg-primary rounded-xl w-fit">
            <Package className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">
              {isLogin ? "Welcome back" : "Create account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Sign in to manage your inventory"
                : "Sign up to start tracking your stock"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-danger" : ""}
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-danger" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-danger pr-10" : "pr-10"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-xs text-danger" role="alert">
                  {errors.password}
                </p>
              )}
              {!isLogin && !errors.password && (
                <p className="text-xs text-muted-foreground">
                  Min 8 chars with uppercase, lowercase, and number
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || isRateLimited()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : isLogin ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setPassword("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
