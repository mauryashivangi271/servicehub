import { Download } from "lucide-react";

import {
  downloadCSV,
} from "../../services/analyticsService";

export default function ReportExport({ data }) {
  function handleExport() {
    if (!data) return;

    const rows = [
      ["ServiceHub Analytics Report"],
      ["Reporting Months", data.months],
      ["Generated At", new Date().toISOString()],
      [],
      ["Metric", "Value"],
      ...Object.entries(data.summary || {})
        .filter(([, value]) => value !== null)
        .map(([key, value]) => [
          key.replaceAll("_", " "),
          value,
        ]),

      [],
      ["Month", "Revenue INR", "Commission INR", "Net Earnings INR"],

      ...(data.monthly || []).map((row) => [
        row.month,
        row.revenue,
        row.commission,
        row.earnings,
      ]),

      [],
      ["Booking Status", "Count"],

      ...(data.booking_status || []).map((row) => [
        row.name,
        row.value,
      ]),

      [],
      ["Category", "Bookings", "Completed"],

      ...(data.categories || []).map((row) => [
        row.name,
        row.bookings,
        row.completed,
      ]),

      [],
      ["Employee", "Assigned", "Completed"],

      ...(data.employees || []).map((row) => [
        row.name,
        row.assigned,
        row.completed,
      ]),
    ];

    downloadCSV(
      `ServiceHub-${data.role}-report-${new Date()
        .toISOString().slice(0, 10)}.csv`,
      rows
    );
  }

  return (
    <button
      type="button"
      disabled={!data}
      onClick={handleExport}
      className="flex items-center gap-2 bg-green-600 text-white
        px-4 py-3 rounded-xl font-medium disabled:opacity-50"
    >
      <Download size={19} />
      Export CSV
    </button>
  );
}