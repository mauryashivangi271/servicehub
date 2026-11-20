import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function CategoryPerformance({
  data = [],
}) {
  return (
    <section className="bg-white border rounded-2xl p-5">

      <h2 className="text-xl font-bold">
        Category Performance
      </h2>

      <p className="text-sm text-slate-500 mt-1 mb-5">
        Top 10 categories by booking volume
      </p>

      {data.length === 0 ? (
        <p className="py-16 text-center text-slate-500">
          No category data available.
        </p>
      ) : (
        <div className="h-[350px] min-w-0">

          <ResponsiveContainer width="100%" height="100%">

            <BarChart
              data={data.slice(0, 10)}
              layout="vertical"
            >

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis type="number" allowDecimals={false} />

              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 11 }}
              />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="bookings"
                name="Total Bookings"
                fill="#2563eb"
                radius={[0, 5, 5, 0]}
              />

              <Bar
                dataKey="completed"
                name="Completed"
                fill="#16a34a"
                radius={[0, 5, 5, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>
      )}

    </section>
  );
}