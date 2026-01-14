import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";

type ConfirmationState = "loading" | "success" | "error" | "pending";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<ConfirmationState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // Handle error from Supabase redirect
      if (error) {
        setState("error");
        setErrorMessage(errorDescription || "Email confirmation failed");
        return;
      }

      // If no token, show pending state (user just signed up)
      if (!token_hash) {
        setState("pending");
        return;
      }

      // Verify the email with the token
      if (type === "email" || type === "signup") {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash,
          type: "email",
        });

        if (verifyError) {
          setState("error");
          setErrorMessage(verifyError.message);
        } else {
          setState("success");
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 3000);
        }
      } else {
        setState("pending");
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md animate-fade-in">
        <CardContent className="pt-8 text-center space-y-6">
          {/* Logo */}
          <div className="mx-auto p-3 bg-primary rounded-xl w-fit">
            <Package className="h-8 w-8 text-primary-foreground" />
          </div>

          {state === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <div>
                <h2 className="text-2xl font-semibold">Verifying Email...</h2>
                <p className="text-muted-foreground mt-2">
                  Please wait while we confirm your email address
                </p>
              </div>
            </>
          )}

          {state === "success" && (
            <>
              <div className="mx-auto p-4 bg-success/10 rounded-full w-fit">
                <CheckCircle2 className="h-12 w-12 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Email Confirmed!</h2>
                <p className="text-muted-foreground mt-2">
                  Your email has been verified. Redirecting you to the dashboard...
                </p>
              </div>
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
            </>
          )}

          {state === "error" && (
            <>
              <div className="mx-auto p-4 bg-danger/10 rounded-full w-fit">
                <XCircle className="h-12 w-12 text-danger" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Verification Failed</h2>
                <p className="text-muted-foreground mt-2">
                  {errorMessage || "The confirmation link is invalid or has expired"}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link to="/auth">Back to Sign In</Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Need help? Contact support
                </p>
              </div>
            </>
          )}

          {state === "pending" && (
            <>
              <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
                <Mail className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Check Your Email</h2>
                <p className="text-muted-foreground mt-2">
                  We've sent a confirmation link to your email address. 
                  Click the link to verify your account.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Didn't receive the email?</p>
                <ul className="text-left space-y-1">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure you entered the correct email</li>
                  <li>• Wait a few minutes and check again</li>
                </ul>
              </div>
              <Button asChild variant="outline">
                <Link to="/auth">Back to Sign In</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
