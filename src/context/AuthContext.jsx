/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

async function isUserActive(userId) {
  const { data, error } = await supabase
    .from("user")
    .select("record_status")
    .eq("userid", userId)
    .maybeSingle();
  if (error || !data) return false;
  return data.record_status.trim() === "ACTIVE";
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount: check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }
      const active = await isUserActive(session.user.id);
      if (!active) {
        await supabase.auth.signOut();
        setCurrentUser(null);
      } else {
        setCurrentUser(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        if (event === "SIGNED_IN") {
          setLoading(true);

          // Supabase auth callbacks must stay synchronous. Defer database work
          // so OAuth code exchange can finish instead of hanging on callback.
          setTimeout(async () => {
            if (!session?.user) {
              setCurrentUser(null);
              setLoading(false);
              return;
            }

            const active = await isUserActive(session.user.id);
            if (!active) {
              await supabase.auth.signOut();
              setCurrentUser(null);
            } else {
              setCurrentUser(session.user);
            }
            setLoading(false);
          }, 0);
          return;
        }

        // For TOKEN_REFRESHED and other events, just sync the user
        if (session?.user) {
          setCurrentUser(session.user);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
