import { Percent } from "lucide-react";

import { formatCurrency } from "../../services/earningsService";

export default function CommissionDetails({
  commissions = [],
}) {
  return (
    <div className="rounded-2xl border bg-white
    p-5 shadow-sm space-y-4">

      <div className="flex items-center gap-3">

        <div className="rounded-xl bg-orange-50
        p-3 text-orange-600">

          <Percent size={24} />

        </div>

        <div>

          <h3 className="text-lg font-bold">
            Platform Commission
          </h3>

          <p className="text-sm text-gray-500">
            ServiceHub commission breakdown
          </p>

        </div>

      </div>

      {commissions.length === 0 ? (

        <p className="text-sm text-gray-500">
          No commission records available.
        </p>

      ) : (

        commissions.map((item) => (

          <div
            key={item.id}
            className="rounded-xl border p-4 space-y-3"
          >

            <div className="flex justify-between text-sm">

              <span>Service Payment</span>

              <span className="font-semibold">
                {formatCurrency(item.gross_amount_paise)}
              </span>

            </div>

            <div className="flex justify-between text-sm">

              <span>
                Commission ({item.commission_percentage}%)
              </span>

              <span className="font-medium text-orange-600">
                {formatCurrency(item.commission_amount_paise)}
              </span>

            </div>

            <div className="h-3 rounded-full
            bg-orange-100 overflow-hidden">

              <div
                className="h-full bg-green-500"
                style={{
                  width: `${100 - Number(item.commission_percentage)}%`,
                }}
              />

            </div>

            <div className="flex justify-between
            border-t pt-3 font-semibold">

              <span>Provider Net Earnings</span>

              <span className="text-green-600">

                {formatCurrency(
                  Number(item.gross_amount_paise) -
                  Number(item.commission_amount_paise)
                )}

              </span>

            </div>

          </div>

        ))

      )}

    </div>
  );
}