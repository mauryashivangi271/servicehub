
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import NotificationBell from "../notifications/NotificationBell";
import ProfileAvatar from "../profile/ProfileAvatar";

import {
  LayoutDashboard,
  UserRound,
  Menu,
  X,
  LogOut,
  House,
  ShieldCheck,
  Briefcase,
  ClipboardList,
  CalendarDays,
  Wallet,
  CreditCard,
  MessageSquare,
  Star,
  Building2,
  Search,
  Receipt,
  Users,
  Layers,
  Package,
  Ticket,
  BarChart3,
  Settings,
  AlertCircle,
  Bell,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

// ==========================================
// Dashboard Navigation Icons
// ==========================================

const icons = {
  overview: LayoutDashboard,
  profile: UserRound,
  verification: ShieldCheck,
  business: Building2,
  services: Briefcase,
  requests: ClipboardList,
  bookings: CalendarDays,
  earnings: Wallet,
  payments: CreditCard,
  invoices: Receipt,
  messages: MessageSquare,
  reviews: Star,
  users: Users,
  providers: Users,
  workers: ShieldCheck,
  reports: BarChart3,
  categories: Layers,
  inventory: Package,
  coupons: Ticket,
  analytics: BarChart3,
  settings: Settings,
  complaints: AlertCircle,
  disputes: ShieldCheck,
  notifications: Bell,
  search: Search,
};

// ==========================================
// Main Dashboard Layout
// ==========================================

export default function DashboardLayout({
  title,
  subtitle,
  items = [],
  active,
  onSelect,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { user, profile, role, logout } = useAuth();

  const navigate = useNavigate();

  const name =
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const activeLabel =
    items.find((item) => item.id === active)?.label ||
    "Overview";

  // ========================================
  // Logout
  // ========================================

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();

      navigate("/login", {
        replace: true,
      });

    } catch (error) {
      alert(error.message || "Logout failed");
    } finally {
      setLoggingOut(false);
    }
  }

  // ========================================
  // Navigation
  // ========================================

  function selectSection(id) {
    onSelect(id);
    setMenuOpen(false);
  }

  function goHome() {
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Mobile Overlay */}

      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/60
          backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ===================================
          PREMIUM SIDEBAR
      =================================== */}

      <aside
        id="dashboard-sidebar"
        className={`fixed inset-y-0 left-0 z-40
        flex w-64 flex-col overflow-hidden
        bg-gradient-to-b from-slate-950
        via-slate-950 to-slate-900 text-white
        shadow-xl transition-transform duration-300
        lg:translate-x-0 ${
          menuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* Logo */}

        <div className="flex shrink-0 items-center
        justify-between border-b border-white/10
        px-5 py-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10
            shrink-0 items-center justify-center
            rounded-xl bg-gradient-to-br
            from-blue-500 to-indigo-600
            font-extrabold text-white shadow-lg
            shadow-blue-600/20">

              SH

            </div>

            <div>

              <h1 className="text-xl font-extrabold
              tracking-tight">

                Service
                <span className="text-blue-400">
                  Hub
                </span>

              </h1>

              <p className="mt-0.5 text-[10px]
              font-medium uppercase tracking-widest
              text-slate-500">

                Manage your services

              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-1
            hover:bg-white/10 lg:hidden"
          >
            <X size={22} />
          </button>

        </div>

        {/* Sidebar Section Label */}

        <div className="shrink-0 px-6 pb-2 pt-5">

          <p className="text-[10px] font-semibold
          uppercase tracking-[0.2em] text-slate-500">

            Workspace

          </p>

        </div>

        {/* Scrollable Navigation */}

        <nav
          aria-label="Dashboard navigation"
          className="min-h-0 flex-1 space-y-1.5
          overflow-y-auto overscroll-contain
          px-3 pb-4
          [scrollbar-width:thin]
          [scrollbar-color:#475569_transparent]"
        >

          {items.map((item) => {
            const Icon =
              icons[item.id] || LayoutDashboard;

            const isActive = active === item.id;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => selectSection(item.id)}
                aria-current={
                  isActive ? "page" : undefined
                }
                className={`group relative flex w-full
                items-center gap-3 rounded-xl
                px-4 py-3 text-left text-sm
                font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >

                <Icon
                  size={19}
                  className="shrink-0"
                />

                <span className="flex-1">
                  {item.label}
                </span>

                {isActive && (
                  <ChevronRight size={15} />
                )}

              </button>
            );
          })}

        </nav>

        {/* ===================================
            FIXED BOTTOM ACTIONS
        =================================== */}

        <div className="shrink-0 space-y-3
        border-t border-white/10
        bg-slate-950/70 p-3">

          {/* Current Account */}

          <button
            type="button"
            onClick={() => selectSection("profile")}
            className="flex w-full items-center
            gap-3 rounded-xl border border-white/5
            bg-white/5 p-3 text-left
            transition-colors hover:bg-white/10"
          >

            <ProfileAvatar
              path={profile?.avatar_url}
              name={name}
              className="h-10 w-10 text-sm"
            />

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm
              font-semibold text-white">

                {name}

              </p>

              <p className="text-xs capitalize
              text-slate-400">

                {role || "Account"}

              </p>

            </div>

            <ChevronRight
              size={16}
              className="shrink-0 text-slate-500"
            />

          </button>

          {/* Homepage Button */}

          <button
            type="button"
            onClick={goHome}
            className="flex w-full items-center
            gap-3 rounded-xl px-4 py-3
            text-sm font-medium text-slate-300
            transition-colors hover:bg-white/10
            hover:text-white"
          >

            <House size={19} />

            Homepage

          </button>

          {/* Logout Button */}

          <button
            type="button"
            disabled={loggingOut}
            onClick={handleLogout}
            className="flex w-full items-center
            justify-center gap-3 rounded-xl
            border border-red-500/10
            bg-red-500/10 px-4 py-3
            text-sm font-semibold text-red-300
            transition-colors hover:bg-red-500/20
            disabled:opacity-50"
          >

            {loggingOut ? (
              <LoaderCircle
                size={19}
                className="animate-spin"
              />
            ) : (
              <LogOut size={19} />
            )}

            {loggingOut
              ? "Logging out..."
              : "Logout"}

          </button>

        </div>

      </aside>

      {/* ===================================
          MAIN DASHBOARD
      =================================== */}

      <div className="min-h-screen lg:pl-64">

        {/* Premium Header */}

        <header className="sticky top-0 z-20
        border-b border-slate-200/80
        bg-white/95 shadow-sm backdrop-blur-xl">

          <div className="flex items-center
          justify-between gap-3 px-4 py-4
          sm:px-6 md:px-8">

            {/* Left Header */}

            <div className="flex min-w-0
            items-center gap-3">

              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="dashboard-sidebar"
                className="shrink-0 rounded-xl
                border border-slate-200 p-2
                hover:bg-slate-100 lg:hidden"
              >

                <Menu size={23} />

              </button>

              <div className="min-w-0">

                <h2 className="truncate text-lg
                font-extrabold tracking-tight
                text-slate-900 sm:text-xl
                md:text-2xl">

                  {title}

                </h2>

                <p className="mt-0.5 hidden
                text-sm text-slate-500 sm:block">

                  {subtitle}

                </p>

              </div>

            </div>

            {/* Right Header */}

            <div className="flex shrink-0
            items-center gap-3 sm:gap-4">

              {/* Notifications */}

              <NotificationBell />

              <div className="hidden h-9 w-px
              bg-slate-200 sm:block" />

              {/* Profile Button */}

              <button
                type="button"
                onClick={() => selectSection("profile")}
                aria-label="Open my profile"
                className="flex items-center gap-3
                rounded-xl p-1 transition-colors
                hover:bg-slate-100"
              >

                <div className="hidden min-w-0
                text-right sm:block">

                  <p className="max-w-[180px]
                  truncate text-sm font-semibold
                  text-slate-900">

                    {name}

                  </p>

                  <p className="max-w-[200px]
                  truncate text-xs text-slate-500">

                    {user?.email}

                  </p>

                </div>

                {/* Real Profile Photo */}

                <ProfileAvatar
                  path={profile?.avatar_url}
                  name={name}
                  className="h-11 w-11
                  border-2 border-white text-lg
                  shadow-sm ring-2 ring-blue-100"
                />

              </button>

            </div>

          </div>

        </header>

        {/* ===================================
            MAIN PAGE CONTENT
        =================================== */}

        <main className="mx-auto min-w-0
        max-w-7xl p-4 sm:p-6 md:p-8">

          {/* Breadcrumb */}

          <div className="mb-5 flex items-center
          gap-2 text-xs font-medium text-slate-500
          sm:text-sm">

            <button
              type="button"
              onClick={() => selectSection("overview")}
              className="flex items-center gap-1.5
              hover:text-blue-600"
            >

              <LayoutDashboard size={15} />

              Dashboard

            </button>

            <ChevronRight
              size={14}
              className="text-slate-400"
            />

            <span className="font-semibold
            text-blue-600">

              {activeLabel}

            </span>

          </div>

          {/* Current Section */}

          {children}

        </main>

      </div>

    </div>
  );
}
