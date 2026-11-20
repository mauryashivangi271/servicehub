
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      // Step 1: Authenticate user with Supabase
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) throw error;

      if (!data.session || !data.user) {
        throw new Error(
          "Login session could not be created."
        );
      }

      // Step 2: Fetch assigned role from database
      const { data: roleData, error: roleError } =
        await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .single();

      if (roleError || !roleData) {
        throw new Error(
          "Unable to load your account role. Please try again."
        );
      }

      // Step 3: Redirect to the correct dashboard
      const dashboardRoutes = {
        customer: "/customer/dashboard",
        worker: "/worker/dashboard",
        admin: "/admin/dashboard",
      };

      const dashboardPath = dashboardRoutes[roleData.role];

      if (!dashboardPath) {
        throw new Error("Invalid account role.");
      }

      navigate(dashboardPath, { replace: true });

    } catch (error) {
      setErrorMessage(
        error.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sh-auth min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">

        {/* Logo */}
        <Link
          to="/"
          className="block text-center text-3xl font-bold text-blue-600"
        >
          ServiceHub
        </Link>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-center mt-6 text-slate-900">
          Welcome Back
        </h1>

        <p className="text-slate-500 text-center mt-2 mb-8">
          Sign in to your ServiceHub account
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2 text-slate-700"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full border border-slate-300 rounded-lg p-3 outline-blue-600"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2 text-slate-700"
            >
              Password
            </label>

            <div className="flex border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
                className="w-full p-3 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-4 text-blue-600 text-sm font-medium"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="text-right"><Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:underline">Forgot Password?</Link></div>
          {/* Error Message */}
          {errorMessage && (
            <p
              role="alert"
              className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3"
            >
              {errorMessage}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Create Account
          </Link>
        </p>

        {/* Back to Home */}
        <div className="text-center mt-5">
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-blue-600"
          >
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;
