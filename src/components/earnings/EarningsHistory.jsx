import { formatCurrency } from "../../services/earningsService";

export default function EarningsHistory({ earnings = [] }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    on_hold: "bg-red-100 text-red-700",
  };

  return (
    <div className="rounded-2xl border bg-white shadow-sm">

      <div className="p-5 border-b">

        <h3 className="text-lg font-bold">
          Earnings History
        </h3>

      </div>

      {earnings.length === 0 ? (

        <div className="p-10 text-center text-gray-500">
          No earnings recorded yet.
        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-gray-50 text-gray-600">

              <tr>
                <th className="p-4">Booking</th>
                <th className="p-4">Gross</th>
                <th className="p-4">Commission</th>
                <th className="p-4">Net Earnings</th>
                <th className="p-4">Date</th>
                <th className="p-4">Payout Status</th>
              </tr>

            </thead>

            <tbody>

              {earnings.map((item) => (

                <tr key={item.id} className="border-t">

                  <td className="p-4 font-medium">
                    #{item.booking_id.slice(0, 8).toUpperCase()}
                  </td>

                  <td className="p-4">
                    {formatCurrency(item.gross_amount_paise)}
                  </td>

                  <td className="p-4 text-orange-600">
                    {formatCurrency(item.commission_amount_paise)}
                  </td>

                  <td className="p-4 font-bold text-green-600">
                    {formatCurrency(item.net_amount_paise)}
                  </td>

                  <td className="p-4">
                    {new Date(item.created_at).toLocaleDateString(
                      "en-IN",
                      { timeZone: "Asia/Kolkata" }
                    )}
                  </td>

                  <td className="p-4">

                    <span className={`rounded-full px-3 py-1
                      text-xs font-semibold capitalize ${
                        styles[item.payout_status] ||
                        "bg-gray-100 text-gray-600"
                      }`}>

                      {item.payout_status.replaceAll("_", " ")}

                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}