import {
  TicketPercent,
  Pencil,
  CalendarDays,
  Power,
} from "lucide-react";

import {
  formatCurrency,
  formatDate,
  getCouponStatus,
} from "../../services/couponService";

export default function CouponCard({
  coupon,
  onEdit,
  onToggle,
  busy,
}) {
  const status = getCouponStatus(coupon);

  const colors = {
    Active: "bg-green-100 text-green-700",
    Inactive: "bg-slate-100 text-slate-600",
    Expired: "bg-red-100 text-red-700",
    Scheduled: "bg-blue-100 text-blue-700",
  };

  return (
    <article className="bg-white border rounded-2xl overflow-hidden">

      <div className="bg-indigo-50 p-5 border-b border-dashed">

        <div className="flex justify-between gap-3">

          <TicketPercent
            size={32}
            className="text-indigo-600"
          />

          <span className={`${colors[status]}
            rounded-full px-3 py-1 text-xs font-semibold h-fit`}>
            {status}
          </span>

        </div>

        <h2 className="text-3xl font-bold text-indigo-700 mt-3">
          {coupon.discount_type === "percentage"
            ? `${coupon.discount_value}% OFF`
            : `${formatCurrency(coupon.discount_value)} OFF`}
        </h2>

        <p className="font-semibold mt-2">
          {coupon.title}
        </p>

        <div className="mt-3 border border-dashed border-indigo-300
          rounded-lg px-4 py-2 w-fit font-bold tracking-wider text-indigo-700">
          {coupon.code}
        </div>

      </div>

      <div className="p-5 space-y-4">

        {coupon.description && (
          <p className="text-sm text-slate-600 break-words">
            {coupon.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">

          <div>
            <p className="text-slate-500">Minimum Order</p>
            <p className="font-semibold">
              {formatCurrency(coupon.minimum_order_amount)}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Maximum Discount</p>
            <p className="font-semibold">
              {coupon.maximum_discount == null
                ? "No additional cap"
                : formatCurrency(coupon.maximum_discount)}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Usage Limit</p>
            <p className="font-semibold">
              {coupon.usage_limit}
            </p>
          </div>

          <div>
            <p className="text-slate-500">Per Customer</p>
            <p className="font-semibold">
              {coupon.per_customer_limit}
            </p>
          </div>

        </div>

        <div className="bg-slate-50 p-3 rounded-xl text-sm space-y-2">

          <CalendarDays size={18} className="text-slate-500" />

          <p>Starts: {formatDate(coupon.starts_at)}</p>

          <p>Expires: {formatDate(coupon.expires_at)}</p>

        </div>

        <div className="flex flex-wrap gap-2">

          <button
            disabled={busy}
            onClick={() => onEdit(coupon)}
            className="flex items-center gap-2 bg-slate-100
              px-4 py-2 rounded-xl disabled:opacity-50"
          >
            <Pencil size={16} />
            Edit
          </button>

          <button
            disabled={busy}
            onClick={() => onToggle(coupon)}
            className={`flex items-center gap-2 px-4 py-2
              rounded-xl disabled:opacity-50 ${
                coupon.is_active
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
          >
            <Power size={16} />

            {coupon.is_active ? "Deactivate" : "Activate"}

          </button>

        </div>

      </div>

    </article>
  );
}