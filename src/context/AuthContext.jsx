
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

// ==========================================
// Authentication Context
// ==========================================

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let requestId = 0;
    let timer;
    let currentUserId = null;

    // ======================================
    // Load User Account
    // ======================================

    async function loadAccount(currentUser) {
      if (!active) return;

      const id = ++requestId;

      if (!currentUser) {
        currentUserId = null;

        setUser(null);
        setRole(null);
        setProfile(null);
        setError("");
        setLoading(false);

        return;
      }

      if (currentUserId !== currentUser.id) {
        setRole(null);
        setProfile(null);
      }

      currentUserId = currentUser.id;

      setLoading(true);
      setError("");
      setUser(currentUser);

      try {
        const [roleResult, profileResult] =
          await Promise.all([

            // Fetch Account Role

            supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", currentUser.id)
              .single(),

            // Fetch Complete Profile

            supabase
              .from("profiles")
              .select(
                "full_name, avatar_url, phone, address"
              )
              .eq("id", currentUser.id)
              .maybeSingle(),
          ]);

        if (!active || id !== requestId) return;

        // Validate Account Role

        if (roleResult.error || !roleResult.data) {
          setRole(null);
          setError("Unable to load your account role.");
        } else {
          const allowedRoles = [
            "customer",
            "worker",
            "admin",
          ];

          if (
            allowedRoles.includes(roleResult.data.role)
          ) {
            setRole(roleResult.data.role);
          } else {
            setRole(null);
            setError("Invalid account role.");
          }
        }

        // Update Profile

        if (profileResult.error) {
          console.error(
            "Profile loading error:",
            profileResult.error
          );

          setProfile(null);
        } else {
          setProfile(profileResult.data ?? null);
        }

      } catch (err) {
        if (!active || id !== requestId) return;

        setRole(null);
        setProfile(null);

        setError(
          err.message || "Unable to load your account."
        );

      } finally {
        if (active && id === requestId) {
          setLoading(false);
        }
      }
    }

    // ======================================
    // Authentication State Listener
    // ======================================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {

        if (!active) return;

        if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "SIGNED_OUT" ||
          event === "USER_UPDATED" ||
          event === "PASSWORD_RECOVERY"
        ) {
          clearTimeout(timer);

          // Invalidate previous account requests

          requestId++;

          const nextUser = session?.user ?? null;

          if (!nextUser ||
              nextUser.id !== currentUserId) {
            setRole(null);
            setProfile(null);
            setUser(nextUser);
            setLoading(true);
          }

          // Run database queries outside auth callback

          timer = setTimeout(() => {
            if (active) {
              loadAccount(nextUser);
            }
          }, 0);
        }
      }
    );

    // ======================================
    // Cleanup
    // ======================================

    return () => {
      active = false;
      requestId++;

      clearTimeout(timer);

      subscription.unsubscribe();
    };

  }, []);

  // ==========================================
  // Logout
  // ==========================================

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  };

  // ==========================================
  // Context Provider
  // ==========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        profile,
        setProfile,
        loading,
        error,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// Custom Authentication Hook
// ==========================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
