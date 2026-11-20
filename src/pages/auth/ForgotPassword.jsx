
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo:
              `${window.location.origin}/reset-password`,
          }
        );

      if (error) throw error;

      setMessage(
        "If an account exists, a password reset link will be sent to your email."
      );
    } catch {
      setError(
        "Unable to send reset link. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sh-auth min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">

        <Link
          to="/"
          className="block text-center text-3xl font-bold text-blue-600"
        >
          ServiceHub
        </Link>

        <h1 className="mt-6 text-center text-2xl font-bold">
          Forgot Password?
        </h1>

        <p className="mt-3 text-center text-sm text-slate-500">
          Enter your registered email address to reset your password.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5"
        >
          <div>
            <label
              htmlFor="recoveryEmail"
              className="mb-2 block text-sm font-medium"
            >
              Email Address
            </label>

            <input
              id="recoveryEmail"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="Enter your email"
              className="w-full rounded-lg border border-slate-300 p-3 outline-blue-600"
            />
          </div>

          {message && (
            <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link
          to="/login"
          className="mt-6 block text-center text-sm font-medium text-blue-600"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
