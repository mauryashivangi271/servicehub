
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const roleRoutes = {
  customer: "/customer/dashboard",
  worker: "/worker/dashboard",
  admin: "/admin/dashboard",
};

function ProtectedRoute({ allowedRole, children }) {
  const { user, role, loading, error } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading your account...</p>
      </div>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <h1 className="text-xl font-bold">Account unavailable</h1>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (role !== allowedRole) {
    const destination = roleRoutes[role];

    return (
      <Navigate
        to={destination || "/"}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
