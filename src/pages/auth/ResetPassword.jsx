
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {
        if (active && event === "PASSWORD_RECOVERY" && session) {
          setReady(true);
        }

        if (active && event === "SIGNED_OUT") {
          setReady(false);
        }
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!ready || loading) return;

    if (password.length < 12) {
      setError("Password must contain at least 12 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      const { error: logoutError } =
        await supabase.auth.signOut();

      if (logoutError) throw logoutError;

      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sh-auth min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">

        <h1 className="text-center text-3xl font-bold text-blue-600">
          ServiceHub
        </h1>

        <h2 className="mt-6 text-center text-2xl font-bold">
          Reset Password
        </h2>

        {!ready ? (
          <div className="mt-6 space-y-4 text-center">
            <p role="status" className="text-sm text-slate-500">
              Waiting for a valid password recovery session.
              If your link has expired, request a new one.
            </p>

            <Link
              to="/forgot-password"
              className="text-blue-600 font-medium"
            >
              Request New Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">

            <div>
              <label htmlFor="newPassword" className="mb-2 block text-sm font-medium">
                New Password
              </label>
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={12}
                required
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-slate-300 p-3"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={e => setShowPassword(e.target.checked)}
              />
              Show Password
            </label>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        <Link
          to="/login"
          className="mt-6 block text-center text-sm text-blue-600"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
