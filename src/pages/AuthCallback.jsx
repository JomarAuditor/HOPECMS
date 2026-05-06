import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      const code = new URLSearchParams(window.location.search).get("code");

      let session = null;

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error || !data.session) {
          navigate("/login?error=Authentication failed. Please try again.");
          return;
        }
        session = data.session;
      } else {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          navigate("/login?error=Authentication failed. Please try again.");
          return;
        }
        session = data.session;
      }

      // ── LOGIN GUARD: check record_status = 'ACTIVE' ──
      const { data: userRow, error: dbError } = await supabase
        .from("user")
        .select("record_status")
        .eq("auth_uid", session.user.id)
        .single();

      if (dbError || !userRow) {
        await supabase.auth.signOut();
        navigate("/login?error=Account not found. Contact your administrator.");
        return;
      }

      if (userRow.record_status.trim() !== "ACTIVE") {
        await supabase.auth.signOut();
        navigate("/login?error=Your account is pending activation. Contact your administrator.");
        return;
      }

      navigate("/customers");
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}
