import { useState, useEffect } from "react";

import MyComplaints from "../../components/complaints/MyComplaints";
import MyDisputes from "../../components/disputes/MyDisputes";
import WorkerAnalytics from "../../components/analytics/WorkerAnalytics";
import InventoryDashboard from "../../components/inventory/InventoryDashboard";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import WorkerOverview from "../../components/dashboard/WorkerOverview";

import {
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
import ChatDashboard from "../../components/chat/ChatDashboard";

import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function WorkerDashboard() {
  const { user } = useAuth();

  const [active, setActive] = useState("overview");
  const [providerType, setProviderType] = useState(null);
  const [providerError, setProviderError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProviderType() {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("provider_profiles")
          .select("provider_type")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (!cancelled) {
          setProviderType(
            data?.provider_type ||
            user.user_metadata?.requested_worker_type ||
            "individual"
          );

          setProviderError("");
        }

      } catch (err) {
        if (!cancelled) {
          setProviderError(
            err.message || "Unable to load provider details."
          );
        }
      }
    }

    loadProviderType();

    return () => {
      cancelled = true;
    };

  }, [user, active]);

  const isBusiness = providerType === "business";

  const items = [
    { id: "overview", label: "Overview" },
    { id: "verification", label: "Verification" },

    ...(isBusiness
      ? [
          {
            id: "business",
            label: "Business Management",
          },
        ]
      : []),

    { id: "services", label: "My Services" },
    { id: "requests", label: "Service Requests" },
    { id: "bookings", label: "Bookings" },
    { id: "earnings", label: "Earnings" },
    { id: "payments", label: "Payment History" },
    { id: "messages", label: "Messages" },
    { id: "reviews", label: "Reviews" },
    { id: "complaints", label: "My Complaints" },
    { id: "disputes", label: "My Disputes" },
    { id: "analytics", label: "Analytics" },

    ...(isBusiness
      ? [{ id: "inventory", label: "Inventory" }]
      : []),

    { id: "profile", label: "My Profile" },
  ];

  function renderSection() {
    switch (active) {

      case "overview":
        return (
          <WorkerOverview
            onSelect={setActive}
            isBusiness={isBusiness}
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

      case "messages":
        return <ChatDashboard />;

      case "reviews":
        return <WorkerReviews />;

      case "complaints":
        return <MyComplaints />;

      case "disputes":
        return <MyDisputes />;

      case "analytics":
        return <WorkerAnalytics showInventory={isBusiness} />;

      case "inventory":
        return isBusiness ? (
          <InventoryDashboard />
        ) : (
          <EmptySection title="Inventory Management" />
        );

      case "profile":
        return <ProfileSection />;

      default:
        return (
          <EmptySection
            title={
              items.find(item => item.id === active)?.label ||
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
      subtitle={
        isBusiness
          ? "Manage your business, employees and services"
          : "Manage your professional account"
      }
      items={items}
      active={active}
      onSelect={setActive}
    >

      {providerError && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {providerError}
        </div>
      )}

      {renderSection()}

    </DashboardLayout>
  );
}