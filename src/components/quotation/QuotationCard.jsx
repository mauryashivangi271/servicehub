import { FileText } from "lucide-react";
import { formatCurrency } from "../../services/quotationService";

const statuses = {
  draft: ["Draft", "bg-slate-100 text-slate-700"],
  sent: ["Awaiting Approval", "bg-amber-100 text-amber-700"],
  approved: ["Approved", "bg-green-100 text-green-700"],
  rejected: ["Rejected", "bg-red-100 text-red-700"],
  revision_requested: [
    "Revision Requested",
    "bg-orange-100 text-orange-700",
  ],
  superseded: ["Previous Revision", "bg-slate-100 text-slate-600"],
};

export default function QuotationCard({ quotation, children }) {
  const [label, color] =
    statuses[quotation.status] || [
      quotation.status,
      "bg-slate-100 text-slate-700",
    ];

  return (
    <article className="bg-white border rounded-2xl overflow-hidden shadow-sm">

      <div className="p-5 border-b flex flex-wrap items-center justify-between gap-3">

        <div className="flex items-center gap-3">

          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            <FileText size={24} />
          </div>

          <div>
            <h3 className="font-bold text-lg">
              Service Quotation
            </h3>

            <p className="text-sm text-slate-500">
              Revision {quotation.revision_number}
            </p>
          </div>

        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
          {label}
        </span>

      </div>

      <div className="p-5 space-y-5">

        <div className="overflow-x-auto">

          <table className="w-full text-sm text-left">

            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">Description</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Rate</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>

              {(quotation.quotation_items || []).map(item => (
                <tr key={item.id} className="border-b">

                  <td className="p-3">
                    <p className="font-medium">
                      {item.description}
                    </p>

                    <p className="text-xs text-slate-500 capitalize">
                      {item.item_type}
                    </p>
                  </td>

                  <td className="p-3">{item.quantity}</td>

                  <td className="p-3">
                    {formatCurrency(item.unit_price)}
                  </td>

                  <td className="p-3 text-right font-medium">
                    {formatCurrency(item.amount)}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

        <div className="bg-slate-50 rounded-xl p-5 space-y-3">

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(quotation.subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span>Discount</span>
            <span>-{formatCurrency(quotation.discount)}</span>
          </div>

          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatCurrency(quotation.tax_amount)}</span>
          </div>

          <div className="flex justify-between items-center border-t pt-4">

            <span className="font-bold">
              Total Amount
            </span>

            <span className="text-2xl font-bold text-green-700">
              {formatCurrency(quotation.total_amount)}
            </span>

          </div>

        </div>

        {quotation.notes && (
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-sm">Provider Notes</p>
            <p className="text-sm mt-2 whitespace-pre-wrap">
              {quotation.notes}
            </p>
          </div>
        )}

        {quotation.approved_at && (
          <div className="bg-green-50 text-green-700 rounded-xl p-4 text-sm">
            Approved on{" "}
            {new Date(quotation.approved_at).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })}
          </div>
        )}

        {children}

      </div>

    </article>
  );
}