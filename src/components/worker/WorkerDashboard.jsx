import { useEffect, useState } from "react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import {
  Overview,
  ProfileSection,
  EmptySection,
} from "../../components/dashboard/DashboardSection";

import ManageServices from "../../components/worker/ManageServices";
import ManageBookings from "../../components/worker/ManageBookings";
import Verification from "../../components/worker/Verification";

import BusinessManagement from "../../components/business/BusinessManagement";

import EarningsDashboard from "../../components/earnings/EarningsDashboard";
import PaymentHistory from "../../components/payment/PaymentHistory";
import WorkerReviews from "../../components/reviews/WorkerReviews";

import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function WorkerDashboard() {
  const { user } = useAuth();

  const [active, setActive] = useState("overview");
  const [providerType, setProviderType] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadType() {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("provider_profiles")
        .select("provider_type")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setError(error.message);
        setProviderType(null);
        return;
      }

      setError("");

      setProviderType(
        data?.provider_type ||
        user.user_metadata?.requested_worker_type ||
        "individual"
      );
    }

    loadType();

    return () => {
      mounted = false;
    };
  }, [user?.id, user?.user_metadata?.requested_worker_type, active]);

  const isBusiness = providerType === "business";

  // Sidebar Menu

  const items = [
    { id: "overview", label: "Overview" },
    { id: "verification", label: "Verification" },

    ...(isBusiness
      ? [{ id: "business", label: "Business Management" }]
      : []),

    { id: "services", label: "My Services" },
    { id: "requests", label: "Service Requests" },
    { id: "bookings", label: "Bookings" },
    { id: "earnings", label: "Earnings" },
    { id: "payments", label: "Payment History" },
    { id: "messages", label: "Messages" },
    { id: "reviews", label: "Reviews" },
    { id: "profile", label: "My Profile" },
  ];

  // Overview Cards

  const cards = [
    {
      title: "Professional Verification",
      description: "Verify your professional account.",
    },
    {
      title: "Service Management",
      description: "Add and manage your services.",
    },
    {
      title: "Booking Requests",
      description: "Manage incoming customer bookings.",
    },
    {
      title: "Earnings",
      description: "Track your income and platform commissions.",
    },
    {
      title: "Payment History",
      description: "View verified service payments.",
    },
    {
      title: "Reviews & Ratings",
      description: "View customer feedback and service ratings.",
    },

    ...(isBusiness
      ? [
          {
            title: "Business Management",
            description: "Manage your company and employees.",
          },
        ]
      : []),
  ];

  // Dashboard Sections

  function renderSection() {
    switch (active) {

      case "overview":
        return (
          <Overview
            heading={
              isBusiness
                ? "Grow your business with ServiceHub"
                : "Welcome to your professional dashboard"
            }
            description="Manage your services and professional account."
            cards={cards}
          />
        );

      case "verification":
        return <Verification />;

      case "business":
        return isBusiness ? (
          <BusinessManagement />
        ) : (
          <EmptySection title="Business Management" />
        );

      case "services":
        return <ManageServices />;

      case "requests":
        return (
          <ManageBookings
            key="requests"
            mode="requests"
          />
        );

      case "bookings":
        return (
          <ManageBookings
            key="bookings"
            mode="bookings"
          />
        );

      case "earnings":
        return <EarningsDashboard />;

      case "payments":
        return <PaymentHistory />;

      case "reviews":
        return <WorkerReviews />;

      case "profile":
        return <ProfileSection />;

      default:
        return (
          <EmptySection
            title={
              items.find((item) => item.id === active)?.label ||
              "Section"
            }
          />
        );
    }
  }

  return (
    <DashboardLayout
      title={
        isBusiness
          ? "Business Dashboard"
          : "Worker Dashboard"
      }
      subtitle="Manage your professional account"
      items={items}
      active={active}
      onSelect={setActive}
    >

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-red-50 p-3 text-red-700"
        >
          {error}
        </p>
      )}

      {renderSection()}

    </DashboardLayout>
  );
}