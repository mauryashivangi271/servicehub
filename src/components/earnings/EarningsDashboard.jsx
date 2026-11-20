import { useEffect, useState, useCallback } from "react";

import { RefreshCw } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import EarningsSummary from "./EarningsSummary";
import EarningsHistory from "./EarningsHistory";
import CommissionDetails from "./CommissionDetails";

import {
  getProviderEarnings,
  getProviderCommissions,
  calculateEarnings,
} from "../../services/earningsService";

export default function EarningsDashboard() {
  const { user } = useAuth();

  const [earnings, setEarnings] = useState([]);
  const [commissions, setCommissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("earnings");

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError("");

      const [earningsData, commissionsData] =
        await Promise.all([
          getProviderEarnings(user.id),
          getProviderCommissions(user.id),
        ]);

      setEarnings(earningsData || []);
      setCommissions(commissionsData || []);

    } catch (err) {
      setError(err.message || "Unable to load earnings");
    } finally {
      setLoading(false);
    }

  }, [user?.id]);

  useEffect(() => {
    loadData();

    const timer = setInterval(loadData, 15000);

    return () => clearInterval(timer);
  }, [loadData]);

  const summary = calculateEarnings(earnings);

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap
      justify-between items-center gap-4">

        <div>

          <h2 className="text-2xl font-bold text-gray-900">
            Earnings Dashboard
          </h2>

          <p className="text-sm text-gray-500">
            Track service earnings and platform commission.
          </p>

        </div>

        <button
          type="button"
          onClick={loadData}
          className="flex items-center gap-2 rounded-xl
          border bg-white px-4 py-2 hover:bg-gray-50"
        >

          <RefreshCw size={17} />

          Refresh

        </button>

      </div>

      {loading ? (

        <p className="text-gray-500">
          Loading earnings...
        </p>

      ) : error ? (

        <div className="rounded-xl bg-red-50
        text-red-700 p-4">

          {error}

        </div>

      ) : (

        <>

          <EarningsSummary summary={summary} />

          <div className="rounded-xl bg-blue-50
          p-4 text-sm text-blue-800">

            Earnings represent recorded service payments.
            Pending payouts have not been transferred
            to your bank account.

          </div>

          <div className="flex flex-wrap gap-3">

            {[
              ["earnings", "Earnings History"],
              ["commission", "Commission Details"],
            ].map(([id, label]) => (

              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-xl px-5 py-2.5
                  font-medium ${
                    tab === id
                      ? "bg-blue-600 text-white"
                      : "bg-white border text-gray-600"
                  }`}
              >

                {label}

              </button>

            ))}

          </div>

          {tab === "earnings" ? (

            <EarningsHistory earnings={earnings} />

          ) : (

            <CommissionDetails commissions={commissions} />

          )}

        </>

      )}

    </div>
  );
}