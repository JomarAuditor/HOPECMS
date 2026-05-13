import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const CALLBACK_TIMEOUT_MS = 15000;

function withTimeout(promise, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), CALLBACK_TIMEOUT_MS);
    }),
  ]);
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const hasHandledCallback = useRef(false);
  const [status, setStatus] = useState("Completing sign in...");

  useEffect(() => {
    async function handleCallback() {
      if (hasHandledCallback.current) return;
      hasHandledCallback.current = true;

      try {
        let session = null;
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const callbackError = params.get("error_description");

        if (callbackError) {
          navigate(`/login?error=${encodeURIComponent(callbackError)}`, { replace: true });
          return;
        }

        if (code) {
          setStatus("Verifying Google sign in...");
          const { data, error } = await withTimeout(
            supabase.auth.exchangeCodeForSession(code),
            "Google sign in timed out. Please try again."
          );

          if (error || !data.session) {
            navigate("/login?error=Authentication failed. Please try again.", { replace: true });
            return;
          }

          session = data.session;
        } else {
          const { data: { session: existing } } = await withTimeout(
            supabase.auth.getSession(),
            "Could not read your sign-in session. Please try again."
          );

          if (!existing) {
            navigate("/login", { replace: true });
            return;
          }

          session = existing;
        }

        setStatus("Checking account access...");
        const { data: userRow, error: dbError } = await withTimeout(
          supabase
            .from("user")
            .select("record_status")
            .eq("userid", session.user.id)
            .maybeSingle(),
          "Could not verify your account status. Please try again."
        );

        if (dbError || !userRow || userRow.record_status?.trim() !== "ACTIVE") {
          await supabase.auth.signOut();
          navigate("/login?error=Your account is pending activation. Contact your administrator.", { replace: true });
          return;
        }

        navigate("/customers", { replace: true });
      } catch (error) {
        const message = error?.message || "Authentication failed. Please try again.";
        navigate(`/login?error=${encodeURIComponent(message)}`, { replace: true });
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 text-sm">{status}</p>
      </div>
    </div>
  );
}
