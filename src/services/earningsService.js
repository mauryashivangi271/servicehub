import { supabase } from "../lib/supabase";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function getProviderEarnings(providerId) {
  return unwrap(
    await supabase
      .from("provider_earnings")
      .select("*")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false })
  );
}

export async function getProviderCommissions(providerId) {
  return unwrap(
    await supabase
      .from("platform_commissions")
      .select("*")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false })
  );
}

export function calculateEarnings(rows = []) {
  return rows.reduce(
    (result, item) => {
      const net = Number(item.net_amount_paise);

      result.gross += Number(item.gross_amount_paise);
      result.commission += Number(item.commission_amount_paise);
      result.net += net;

      if (item.payout_status === "pending") {
        result.pending += net;
      }

      if (item.payout_status === "paid") {
        result.paid += net;
      }

      if (item.payout_status === "processing") {
        result.processing += net;
      }

      if (item.payout_status === "on_hold") {
        result.onHold += net;
      }

      result.transactions += 1;

      return result;
    },
    {
      gross: 0,
      commission: 0,
      net: 0,
      pending: 0,
      paid: 0,
      processing: 0,
      onHold: 0,
      transactions: 0,
    }
  );
}

export function formatCurrency(paise) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(paise) / 100);
}