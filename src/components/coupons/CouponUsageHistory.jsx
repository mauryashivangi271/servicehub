import { useState } from "react";

import {
  History,
  Search,
} from "lucide-react";

import {
  formatPaise,
  formatDate,
} from "../../services/couponService";

export default function CouponUsageHistory({
  usages = [],
}) {
  const [search, setSearch] = useState("");

  const filtered = usages.filter((usage) =>
    `${usage.coupons?.code || ""} ${usage.booking_id}
      ${usage.customer_id}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="bg-white border rounded-2xl p-5 space-y-5">

      <h2 className="flex items-center gap-2 text-xl font-bold">
        <History className="text-indigo-600" />
        Coupon Usage History
      </h2>

      <div className="flex items-center gap-2 border rounded-xl p-3">

        <Search className="text-slate-400" size={20} />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search coupon, booking or customer..."
          className="w-full outline-none"
        />

      </div>

      <p className="text-xs text-slate-500">
        Latest 100 verified coupon redemptions.
      </p>

      <div className="overflow-x-auto">

        <table className="w-full text-sm text-left">

          <thead className="bg-slate-50 text-slate-600">

            <tr>

              {[
                "Coupon",
                "Booking ID",
                "Customer ID",
                "Discount",
                "Used At",
              ].map((heading) => (
                <th
                  key={heading}
                  className="p-3 whitespace-nowrap"
                >
                  {heading}
                </th>
              ))}

            </tr>

          </thead>

          <tbody>

            {filtered.map((usage) => (
              <tr
                key={usage.id}
                className="border-b hover:bg-slate-50"
              >

                <td className="p-3 font-semibold text-indigo-700">
                  {usage.coupons?.code || "-"}
                </td>

                <td
                  className="p-3 font-mono text-xs"
                  title={usage.booking_id}
                >
                  {usage.booking_id.slice(0, 8)}
                </td>

                <td
                  className="p-3 font-mono text-xs"
                  title={usage.customer_id}
                >
                  {usage.customer_id.slice(0, 8)}
                </td>

                <td className="p-3 text-green-700 font-semibold">
                  {formatPaise(usage.discount_amount_paise)}
                </td>

                <td className="p-3 whitespace-nowrap">
                  {formatDate(usage.used_at)}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {filtered.length === 0 && (

        <p className="text-center text-slate-500 py-10">
          No coupon usage records found.
        </p>

      )}

    </div>
  );
}