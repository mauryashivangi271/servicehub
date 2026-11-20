
import { lazy, Suspense } from "react";

import {
  BrowserRouter,
  Routes,
  Route,

} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./pages/auth/ProtectedRoute";

import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// ==========================================
// Lazy Loaded Pages
// ==========================================

const MarketplaceDetail = lazy(()=>import("./pages/public/MarketplaceDetail"));
const NotFound = lazy(()=>import("./pages/public/NotFound"));
const InfoPage = lazy(()=>import("./pages/public/InfoPage"));
const Home = lazy(() =>
  import("./pages/public/Home")
);

const Login = lazy(() =>
  import("./pages/auth/Login")
);

const Register = lazy(() =>
  import("./pages/auth/Register")
);

const CustomerDashboard = lazy(() =>
  import("./pages/customer/CustomerDashboard")
);

const WorkerDashboard = lazy(() =>
  import("./pages/worker/WorkerDashboard")
);

const AdminDashboard = lazy(() =>
  import("./pages/admin/AdminDashboard")
);

// ==========================================
// Premium Loading Screen
// ==========================================

function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative flex min-h-screen 
      items-center justify-center overflow-hidden
      bg-gradient-to-br from-slate-950
      via-blue-950 to-indigo-950 px-5"
    >

      {/* Background Effects */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute
        -left-24 -top-24 h-80 w-80 rounded-full
        bg-blue-500/20 blur-[100px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute
        -bottom-24 -right-24 h-96 w-96
        rounded-full bg-indigo-500/20 blur-[120px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute
        left-1/2 top-1/2 h-72 w-72
        -translate-x-1/2 -translate-y-1/2
        rounded-full bg-cyan-500/10 blur-[100px]"
      />

      {/* Loading Card */}

      <div
        className="relative z-10 w-full max-w-md
        rounded-3xl border border-white/10
        bg-white/5 px-8 py-12 text-center
        shadow-2xl backdrop-blur-xl sm:px-12"
      >

        {/* Brand Icon */}

        <div
          className="mx-auto mb-7 flex h-20 w-20
          items-center justify-center rounded-3xl
          bg-gradient-to-br from-blue-500
          to-indigo-600 shadow-xl
          shadow-blue-500/30
          motion-safe:animate-pulse"
        >
          <span className="text-3xl font-extrabold text-white">
            SH
          </span>
        </div>

        {/* Brand Name */}

        <h1
          className="text-4xl font-extrabold
          tracking-tight text-white sm:text-5xl"
        >
          Service
          <span className="text-blue-400">
            Hub
          </span>
        </h1>

        <p className="mt-3 text-sm text-slate-400">
          Trusted Professionals. Seamless Services.
        </p>

        {/* Divider */}

        <div
          className="mx-auto my-8 h-px w-3/4
          bg-gradient-to-r from-transparent
          via-white/20 to-transparent"
        />

        {/* Loading Spinner */}

        <div className="flex justify-center">

          <div className="relative h-14 w-14">

            <div
              className="absolute inset-0 rounded-full
              border-4 border-white/10"
            />

            <div
              className="absolute inset-0
              rounded-full border-4
              border-transparent border-t-blue-400
              border-r-indigo-400
              motion-safe:animate-spin"
            />

          </div>

        </div>

        {/* Loading Text */}

        <h2 className="mt-6 font-semibold text-white">
          Loading your experience
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Please wait a moment...
        </p>

        {/* Animated Loading Dots */}

        <div
          aria-hidden="true"
          className="mt-6 flex justify-center gap-2"
        >

          <span
            className="h-2 w-2 rounded-full
            bg-blue-400 motion-safe:animate-bounce
            [animation-delay:-0.3s]"
          />

          <span
            className="h-2 w-2 rounded-full
            bg-blue-400 motion-safe:animate-bounce
            [animation-delay:-0.15s]"
          />

          <span
            className="h-2 w-2 rounded-full
            bg-blue-400 motion-safe:animate-bounce"
          />

        </div>

        {/* Footer */}

        <p
          className="mt-9 text-xs tracking-widest
          text-slate-500 uppercase"
        >
          Discover • Connect • Book
        </p>

      </div>

      {/* Copyright */}

      <div
        className="absolute bottom-5 text-center
        text-xs text-slate-500"
      >
        © {new Date().getFullYear()} ServiceHub.
        All rights reserved.
      </div>

    </div>
  );
}

// ==========================================
// Main Application
// ==========================================

function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <Suspense fallback={<PageLoader />}>

          <Routes>
<Route path="/services/:id" element={<MarketplaceDetail key="service"/>}/>
<Route path="/providers/:id" element={<MarketplaceDetail key="provider" provider/>}/>

            {/* ==============================
                PUBLIC ROUTES
            ============================== */}

            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            {["about","faq","contact","privacy","terms"].map(path=><Route key={path} path={`/${path}`} element={<InfoPage page={path}/>} />)}
            {/* ==============================
                PASSWORD RECOVERY
            ============================== */}

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            <Route
              path="/reset-password"
              element={<ResetPassword />}
            />

            {/* ==============================
                CUSTOMER DASHBOARD
            ============================== */}

            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute allowedRole="customer">

                  <CustomerDashboard />

                </ProtectedRoute>
              }
            />

            {/* ==============================
                WORKER & BUSINESS DASHBOARD
            ============================== */}

            <Route
              path="/worker/dashboard"
              element={
                <ProtectedRoute allowedRole="worker">

                  <WorkerDashboard />

                </ProtectedRoute>
              }
            />

            {/* ==============================
                ADMIN DASHBOARD
            ============================== */}

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRole="admin">

                  <AdminDashboard />

                </ProtectedRoute>
              }
            />

            {/* ==============================
                INVALID ROUTES
            ============================== */}

            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>

        </Suspense>

      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;
