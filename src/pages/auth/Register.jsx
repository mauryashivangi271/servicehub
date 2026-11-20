
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BriefcaseBusiness,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState(()=>new URLSearchParams(window.location.search).get("role")==="worker"?"worker":"customer");
  const [workerType, setWorkerType] = useState("individual");
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: fullName.trim(),
            requested_role: role,
            requested_worker_type:
              role === "worker" ? workerType : null,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session && data.user) {
        // Get the role assigned by the database.
        const { data: roleData, error: roleError } =
          await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.user.id)
            .single();

        if (roleError || !roleData) {
          setIsError(true);
          setMessage(
            "Account created, but your role could not be loaded. Please check your Supabase role configuration."
          );
          return;
        }

        const dashboardRoutes = {
          customer: "/customer/dashboard",
          worker: "/worker/dashboard",
          admin: "/admin/dashboard",
        };

        const destination = dashboardRoutes[roleData.role];

        if (!destination) {
          setIsError(true);
          setMessage(
            "Account created, but the assigned role is not supported."
          );
          return;
        }

        navigate(destination, { replace: true });
      } else {
        setMessage(
          "Registration successful! Please check your email for a verification link. After verification, sign in to continue."
        );
      }

      setPassword("");
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sh-auth min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-3xl font-bold text-blue-600"
          >
            ServiceHub
          </Link>

          <h1 className="text-2xl font-bold mt-6">
            Create Your Account
          </h1>

          <p className="text-slate-500 mt-2">
            Join ServiceHub and get started today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Account Role */}
          <div>
            <p className="text-sm font-medium mb-3">
              I want to join as
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("customer")}
                aria-pressed={role === "customer"}
                className={`p-4 border rounded-xl flex flex-col items-center gap-2 ${
                  role === "customer"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-slate-200"
                }`}
              >
                <User size={24} />
                <span className="font-medium">Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("worker")}
                aria-pressed={role === "worker"}
                className={`p-4 border rounded-xl flex flex-col items-center gap-2 ${
                  role === "worker"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-slate-200"
                }`}
              >
                <BriefcaseBusiness size={24} />
                <span className="font-medium">
                  Professional
                </span>
              </button>
            </div>
          </div>

          {/* Worker Type */}
          {role === "worker" && (
            <div>
              <label
                htmlFor="workerType"
                className="block text-sm font-medium mb-2"
              >
                Professional Type
              </label>

              <select
                id="workerType"
                value={workerType}
                onChange={(e) =>
                  setWorkerType(e.target.value)
                }
                className="w-full border border-slate-300 rounded-lg p-3 bg-white"
              >
                <option value="individual">
                  Individual Professional
                </option>
                <option value="business">
                  Business / Agency
                </option>
              </select>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2"
            >
              Full Name
            </label>

            <div className="flex items-center gap-3 border border-slate-300 rounded-lg px-4">
              <User size={19} className="text-slate-400" />

              <input
                id="name"
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                placeholder="Enter your full name"
                autoComplete="name"
                required
                className="w-full py-3 outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
            >
              Email Address
            </label>

            <div className="flex items-center gap-3 border border-slate-300 rounded-lg px-4">
              <Mail size={19} className="text-slate-400" />

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
                required
                className="w-full py-3 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
            >
              Password
            </label>

            <div className="flex items-center gap-3 border border-slate-300 rounded-lg px-4">
              <Lock size={19} className="text-slate-400" />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Create a strong password"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full py-3 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="text-slate-500"
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Password must contain at least 8 characters.
            </p>
          </div>

          {/* Registration Message */}
          {message && (
            <p
              role="status"
              className={`text-sm p-3 rounded-lg ${
                isError
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {message}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-60"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-7">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
