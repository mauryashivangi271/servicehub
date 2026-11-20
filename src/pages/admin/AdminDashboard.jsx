import AdminOverview from "../../components/admin/AdminOverview";
import AdminUsers from "../../components/admin/AdminUsers";
import AdminServices from "../../components/admin/AdminServices";
import AdminBookings from "../../components/admin/AdminBookings";
import AdminPayments from "../../components/admin/AdminPayments";
import AdminSettings from "../../components/admin/AdminSettings";
import AdminAuditLogs from "../../components/admin/AdminAuditLogs";
import AdminEnquiries from "../../components/admin/AdminEnquiries";
import AdminComplaints from "../../components/complaints/AdminComplaints";
import AdminDisputes from "../../components/disputes/AdminDisputes";
import AdminCoupons from "../../components/coupons/AdminCoupons";
import AdminAnalytics from "../../components/analytics/AdminAnalytics";
import { useState } from "react";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import {
  ProfileSection,
} from "../../components/dashboard/DashboardSection";

import VerificationRequests from "../../components/admin/VerificationRequests";
import CategoryManagement from "../../components/admin/CategoryManagement";

const items = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "enquiries", label: "Support Enquiries" },
  { id: "workers", label: "Worker Verification" },
  { id: "categories", label: "Categories" },
  { id: "services", label: "Services" },
  { id: "bookings", label: "Bookings" },
  { id: "payments", label: "Payments" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
  { id: "complaints", label: "Complaints" },
  { id: "disputes", label: "Disputes" },
  { id: "coupons", label: "Coupons" },
  { id: "analytics", label: "Analytics" },
  { id: "audit", label: "Audit Logs" },
  { id: "profile", label: "My Profile" },
];

export default function AdminDashboard() {
  const [active, setActive] = useState("overview");

  function renderSection() {
    switch (active) {
      case "overview":
        return <AdminOverview onSelect={setActive} />;
      case "users": return <AdminUsers />;
      case "services": return <AdminServices />;
      case "bookings": return <AdminBookings />;
      case "payments": return <AdminPayments />;
      case "settings": return <AdminSettings />;
      case "audit": return <AdminAuditLogs />;

      case "enquiries":
        return <AdminEnquiries />;
      case "workers":
        return <VerificationRequests />;

      case "categories":
        return <CategoryManagement />;

      case "complaints":
        return <AdminComplaints />;

      case "disputes":
        return <AdminDisputes />;

      case "coupons":
        return <AdminCoupons />;

      case "reports":
      case "analytics":
        return <AdminAnalytics />;

      case "profile":
        return <ProfileSection />;

      default:
        return <AdminOverview onSelect={setActive} />;
    }
  }

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="ServiceHub administration"
      items={items}
      active={active}
      onSelect={setActive}
    >
      {renderSection()}
    </DashboardLayout>
  );
}