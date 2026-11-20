import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = {
  Completed: "#16a34a",
  Pending: "#f59e0b",
  Accepted: "#2563eb",
  Cancelled: "#ef4444",
};

export default function BookingChart({ data = [] }) {
  const total = data.reduce(
    (sum, row) => sum + Number(row.value),
    0
  );

  return (
    <section className="bg-white border rounded-2xl p-5">

      <h2 className="text-xl font-bold">
        Booking Distribution
      </h2>

      <p className="text-sm text-slate-500 mt-1 mb-5">
        Current status of bookings in the selected period
      </p>

      {total === 0 ? (
        <div className="h-[300px] flex items-center
          justify-center text-slate-400">

          No bookings available.

        </div>
      ) : (
        <div className="h-[300px] min-w-0">

          <ResponsiveContainer width="100%" height="100%">

            <PieChart>

              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
              >

                {data.map((row) => (
                  <Cell
                    key={row.name}
                    fill={COLORS[row.name] || "#94a3b8"}
                  />
                ))}

              </Pie>

              <Tooltip />
              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mt-4">

        {data.map((row) => (
          <div
            key={row.name}
            className="bg-slate-50 rounded-xl p-3"
          >

            <p className="text-sm text-slate-500">
              {row.name}
            </p>

            <p className="text-xl font-bold">
              {row.value}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}