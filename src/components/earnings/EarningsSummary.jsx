import {
  Wallet,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle,
  Receipt,
} from "lucide-react";

import { formatCurrency } from "../../services/earningsService";

export default function EarningsSummary({ summary }) {
  const cards = [
    {
      title: "Gross Earnings",
      value: formatCurrency(summary.gross),
      icon: Wallet,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Platform Commission",
      value: formatCurrency(summary.commission),
      icon: Receipt,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Net Earnings",
      value: formatCurrency(summary.net),
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Pending Payout",
      value: formatCurrency(summary.pending),
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Paid Out",
      value: formatCurrency(summary.paid),
      icon: CheckCircle,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Total Transactions",
      value: summary.transactions,
      icon: IndianRupee,
      color: "bg-indigo-50 text-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2
    xl:grid-cols-3 gap-5">

      {cards.map((card) => {

        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border bg-white
            p-5 shadow-sm"
          >

            <div className={`inline-flex rounded-xl
              p-3 mb-4 ${card.color}`}>

              <Icon size={24} />

            </div>

            <p className="text-sm text-gray-500">
              {card.title}
            </p>

            <h3 className="text-2xl font-bold
            text-gray-900 mt-1">

              {card.value}

            </h3>

          </div>
        );

      })}

    </div>
  );
}