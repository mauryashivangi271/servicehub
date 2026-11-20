import {
  formatCurrency,
  formatDate,
} from "../../services/invoiceService";

import InvoiceDownload from "./InvoiceDownload";

export default function InvoiceDetails({ invoice }) {
  return (
    <div className="rounded-2xl border bg-white p-5 space-y-5">

      <div className="flex justify-between items-start gap-3">

        <div>

          <h2 className="text-2xl font-bold text-blue-600">
            ServiceHub
          </h2>

          <p className="text-sm text-gray-500">
            Service Payment Receipt
          </p>

        </div>

        <span className={`px-3 py-1 rounded-full text-sm
          font-semibold ${
            invoice.status === "paid"
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}>

          {invoice.status.replaceAll("_", " ").toUpperCase()}

        </span>

      </div>

      <div className="grid sm:grid-cols-2 gap-4
      rounded-xl bg-gray-50 p-4 text-sm">

        <div>
          <p className="text-gray-500">Invoice Number</p>
          <p className="font-semibold">
            {invoice.invoice_number}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Invoice Date</p>
          <p className="font-semibold">
            {formatDate(invoice.issued_at)}
          </p>
        </div>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full text-sm text-left">

          <thead className="bg-gray-50">

            <tr>
              <th className="p-3">Service</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Price</th>
              <th className="p-3">Total</th>
            </tr>

          </thead>

          <tbody>

            {(invoice.invoice_items || []).map((item) => (

              <tr key={item.id} className="border-b">

                <td className="p-3">
                  {item.description}
                </td>

                <td className="p-3">
                  {item.quantity}
                </td>

                <td className="p-3">
                  {formatCurrency(item.unit_price_paise)}
                </td>

                <td className="p-3 font-medium">
                  {formatCurrency(item.total_paise)}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="flex justify-between items-center
      rounded-xl bg-blue-50 p-4">

        <span className="font-semibold">
          Original Payment Amount
        </span>

        <span className="text-2xl font-bold text-blue-700">
          {formatCurrency(invoice.amount_paise)}
        </span>

      </div>

      <InvoiceDownload invoice={invoice} />

    </div>
  );
}