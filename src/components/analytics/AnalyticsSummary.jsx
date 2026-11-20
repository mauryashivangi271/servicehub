import {
  CalendarDays,
  CheckCircle,
  Clock,
  IndianRupee,
  Users,
  Briefcase,
  Package,
  TrendingUp,
} from "lucide-react";

import {
  formatCurrency,
  formatNumber,
} from "../../services/analyticsService";

export default function AnalyticsSummary({
  summary = {},
  admin = false,
  showInventory = admin,
}) {
  const data = summary || {};

  const cards = [
    {
      title: "Total Bookings",
      value: formatNumber(data.total_bookings || 0),
      icon: CalendarDays,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Completed Bookings",
      value: formatNumber(data.completed_bookings || 0),
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Pending Bookings",
      value: formatNumber(data.pending_bookings || 0),
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Completion Rate",
      value: `${Number(data.completion_rate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Gross Revenue",
      value: formatCurrency(data.gross_revenue || 0),
      icon: IndianRupee,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Platform Commission",
      value: formatCurrency(data.commission || 0),
      icon: IndianRupee,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: admin ? "Provider Earnings" : "Net Earnings",
      value: formatCurrency(data.net_earnings || 0),
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Transactions",
      value: formatNumber(data.transactions || 0),
      icon: IndianRupee,
      color: "bg-purple-50 text-purple-600",
    },

    ...(admin
      ? [
          {
            title: "Total Customers",
            value: formatNumber(data.total_customers || 0),
            icon: Users,
            color: "bg-blue-50 text-blue-600",
          },
          {
            title: "Total Providers",
            value: formatNumber(data.total_providers || 0),
            icon: Briefcase,
            color: "bg-indigo-50 text-indigo-600",
          },
          {
            title: "Approved Providers",
            value: formatNumber(data.approved_providers || 0),
            icon: CheckCircle,
            color: "bg-green-50 text-green-600",
          },
          {
            title: "Coupon Discounts",
            value: formatCurrency(data.coupon_discounts || 0),
            icon: IndianRupee,
            color: "bg-pink-50 text-pink-600",
          },
        ]
      : []),

    {
      title: "Inventory Items",
      value: formatNumber(data.inventory_items || 0),
      icon: Package,
      color: "bg-cyan-50 text-cyan-600",
    },
    {
      title: "Low Stock Items",
      value: formatNumber(data.low_stock_items || 0),
      icon: Package,
      color: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.filter(card => showInventory || !["Inventory Items", "Low Stock Items"].includes(card.title)).map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className={`rounded-xl p-3 ${card.color}`}>
                <Icon size={22} />
              </div>
            </div>

            <p className="text-sm text-slate-500 mt-4">
              {card.title}
            </p>

            <h3 className="text-2xl font-bold text-slate-900 mt-1 break-words">
              {card.value}
            </h3>
          </div>
        );
      })}
    </div>
  );
}