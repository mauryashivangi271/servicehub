import { supabase } from "../lib/supabase";

export async function getAnalytics(months = 6) {
  const { data, error } = await supabase.rpc(
    "get_servicehub_analytics",
    { p_months: Number(months) }
  );

  if (error) throw error;

  return data;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

export function downloadCSV(filename, rows) {
  if (!rows.length) return;

  const escape = (value) => {
    let text = String(value ?? "");

    if (/^[\s]*[=+\-@]/.test(text)) {
      text = "'" + text;
    }

    return `"${text.replaceAll('"', '""')}"`;
  };

  const csv = rows
    .map((row) => row.map(escape).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}