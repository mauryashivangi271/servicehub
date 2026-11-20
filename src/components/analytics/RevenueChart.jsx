import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import {
  formatCurrency,
} from "../../services/analyticsService";

export default function RevenueChart({
  data = [],
  admin = false,
}) {
  return (
    <section className="bg-white border rounded-2xl p-5">

      <h2 className="text-xl font-bold">
        {admin ? "Monthly Revenue" : "Monthly Earnings"}
      </h2>

      <p className="text-sm text-slate-500 mt-1 mb-6">
        Captured payment performance
      </p>

      <div className="h-[340px] w-full min-w-0">

        <ResponsiveContainer width="100%" height="100%">

          <AreaChart data={data}>

            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
            />

            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(value) =>
                `₹${Number(value).toLocaleString("en-IN")}`
              }
              width={85}
            />

            <Tooltip formatter={(value) =>
              formatCurrency(value)
            } />

            <Legend />

            <Area
              type="monotone"
              dataKey="revenue"
              name="Gross Revenue"
              stroke="#2563eb"
              fill="#dbeafe"
              strokeWidth={3}
            />

            <Area
              type="monotone"
              dataKey={admin ? "commission" : "earnings"}
              name={admin ? "Commission" : "Net Earnings"}
              stroke="#16a34a"
              fill="#dcfce7"
              strokeWidth={2}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </section>
  );
}