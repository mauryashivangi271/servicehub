import { useSearchParams } from "react-router-dom";
import { useState } from "react";

import MyComplaints from "../../components/complaints/MyComplaints";
import MyDisputes from "../../components/disputes/MyDisputes";

import DashboardLayout from "../../components/dashboard/DashboardLayout";

import {
  ProfileSection,
  EmptySection,
} from "../../components/dashboard/DashboardSection";

import CustomerOverview from "../../components/dashboard/CustomerOverview";

import FindServices from "../../components/customer/FindServices";
import MyBookings from "../../components/customer/MyBookings";

import PaymentHistory from "../../components/payment/PaymentHistory";
import CustomerInvoices from "../../components/invoice/CustomerInvoices";
import CustomerReviews from "../../components/reviews/CustomerReviews";
import ChatDashboard from "../../components/chat/ChatDashboard";

const items = [
  { id: "overview", label: "Overview" },
  { id: "services", label: "Find Services" },
  { id: "favorites", label: "Saved Services" },
  { id: "bookings", label: "My Bookings" },
  { id: "messages", label: "Messages" },
  { id: "payments", label: "Payments" },
  { id: "invoices", label: "My Invoices" },
  { id: "reviews", label: "My Reviews" },
  { id: "complaints", label: "My Complaints" },
  { id: "disputes", label: "My Disputes" },
  { id: "profile", label: "My Profile" },
];

export default function CustomerDashboard() {
  const [params] = useSearchParams();
  const [active, setActive] = useState(()=>items.some(item=>item.id===params.get("tab"))?params.get("tab"):"overview");

  function renderSection() {
    switch (active) {

      case "overview":
        return <CustomerOverview onSelect={setActive} />;

      case "services":
        return <FindServices key="all" />;

      case "favorites":
        return <FindServices key="favorites" savedOnly />;

      case "bookings":
        return <MyBookings />;

      case "messages":
        return <ChatDashboard />;

      case "payments":
        return <PaymentHistory />;

      case "invoices":
        return <CustomerInvoices />;

      case "reviews":
        return <CustomerReviews />;

      case "complaints":
        return <MyComplaints />;

      case "disputes":
        return <MyDisputes />;

      case "profile":
        return <ProfileSection />;

      default:
        return (
          <EmptySection
            title={
              items.find(
                (item) => item.id === active
              )?.label || "Section"
            }
          />
        );
    }
  }

  return (
    <DashboardLayout
      title="Customer Dashboard"
      subtitle="Find services and manage your account"
      items={items}
      active={active}
      onSelect={setActive}
    >
      {renderSection()}
    </DashboardLayout>
  );
}