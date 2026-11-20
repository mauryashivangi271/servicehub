import { TicketPercent } from "lucide-react";

import {
  formatPaise,
} from "../../services/couponService";

export default function CouponSummary({ coupon }) {
  if (!coupon) return null;

  return (
    <div className="border border-green-200 bg-green-50
      rounded-xl p-4 space-y-3">

      <div className="flex items-center gap-2 text-green-700">

        <TicketPercent size={21} />

        <span className="font-bold">
          {coupon.coupon_code}
        </span>

      </div>

      <div className="flex justify-between text-sm">

        <span>Original Amount</span>

        <span>
          {formatPaise(coupon.original_amount_paise)}
        </span>

      </div>

      <div className="flex justify-between text-sm text-green-700">

        <span>Coupon Discount</span>

        <strong>
          - {formatPaise(coupon.discount_amount_paise)}
        </strong>

      </div>

      <div className="border-t border-green-200 pt-3
        flex justify-between items-center">

        <span className="font-bold">
          {coupon.status === "used"
            ? "Paid Amount"
            : "Final Payable"}
        </span>

        <strong className="text-xl text-green-700">
          {formatPaise(coupon.final_amount_paise)}
        </strong>

      </div>

      <p className="text-xs text-green-700">

        {coupon.status === "used"
          ? "Coupon successfully redeemed."
          : coupon.status === "reserved"
          ? "Discount locked for this payment order."
          : "Discount is subject to validation when payment starts."}

      </p>

    </div>
  );
}