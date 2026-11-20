import { useState, useEffect, useCallback } from "react";

import {
  Receipt,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getCustomerInvoices,
  formatCurrency,
  formatDate,
} from "../../services/invoiceService";

import InvoiceDetails from "./InvoiceDetails";

export default function CustomerInvoices() {
  const { user } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInvoices = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError("");

    try {
      const data = await getCustomerInvoices(user.id);
      setInvoices(data || []);
    } catch (err) {
      setError(err.message || "Unable to load invoices.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const filtered = invoices.filter((invoice) => {
    const query = search.trim().toLowerCase();

    const description = (invoice.invoice_items || [])
      .map((item) => item.description)
      .join(" ")
      .toLowerCase();

    return (
      invoice.invoice_number.toLowerCase().includes(query) ||
      invoice.booking_id.toLowerCase().includes(query) ||
      description.includes(query)
    );
  });

  const totalPaid = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce(
      (total, invoice) => total + Number(invoice.amount_paise),
      0
    );

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap justify-between items-center gap-4">

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            My Invoices
          </h2>

          <p className="text-sm text-gray-500">
            View and download verified payment receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={loadInvoices}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>

      </div>

      {loading ? (

        <p className="text-gray-500">
          Loading invoices...
        </p>

      ) : error ? (

        <div
          role="alert"
          className="rounded-xl bg-red-50 text-red-700 p-4"
        >
          {error}
        </div>

      ) : (

        <>

          <div className="grid sm:grid-cols-2 gap-4">

            <div className="rounded-2xl border bg-white p-5 shadow-sm">

              <p className="text-sm text-gray-500">
                Total Invoices
              </p>

              <h3 className="text-3xl font-bold mt-2">
                {invoices.length}
              </h3>

            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">

              <p className="text-sm text-gray-500">
                Fully Paid Invoices
              </p>

              <h3 className="text-3xl font-bold text-green-600 mt-2">
                {formatCurrency(totalPaid)}
              </h3>

            </div>

          </div>

          <div className="flex items-center gap-3 bg-white border rounded-xl px-4 py-3">

            <Search size={20} className="text-gray-400" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search invoices or services..."
              aria-label="Search invoices"
              className="w-full outline-none bg-transparent"
            />

          </div>

          {filtered.length === 0 ? (

            <div className="rounded-2xl border bg-white p-12 text-center">

              <Receipt
                size={48}
                className="mx-auto text-gray-300 mb-4"
              />

              <h3 className="font-semibold text-lg">
                No invoices found
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                {invoices.length === 0
                  ? "Your receipts will appear after successful payment verification."
                  : "Try a different search."}
              </p>

            </div>

          ) : (

            filtered.map((invoice) => (

              <div
                key={invoice.id}
                className="rounded-2xl border bg-white p-5 shadow-sm space-y-4"
              >

                <div className="flex flex-wrap justify-between items-center gap-4">

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-blue-50 text-blue-600 p-3">
                      <Receipt size={24} />
                    </div>

                    <div>

                      <h3 className="font-bold">
                        {invoice.invoice_number}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {formatDate(invoice.issued_at)}
                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    <p className="text-lg font-bold">
                      {formatCurrency(invoice.amount_paise)}
                    </p>

                    <span
                      className={`text-xs rounded-full px-3 py-1 font-semibold ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {invoice.status.replaceAll("_", " ").toUpperCase()}
                    </span>

                  </div>

                </div>

                <button
                  type="button"
                  aria-expanded={selected === invoice.id}
                  onClick={() =>
                    setSelected((previous) =>
                      previous === invoice.id
                        ? null
                        : invoice.id
                    )
                  }
                  className="flex items-center justify-between w-full rounded-xl bg-blue-50 text-blue-700 font-medium px-4 py-3 hover:bg-blue-100"
                >

                  {selected === invoice.id
                    ? "Hide Invoice"
                    : "View Invoice & Download PDF"}

                  {selected === invoice.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}

                </button>

                {selected === invoice.id && (
                  <InvoiceDetails invoice={invoice} />
                )}

              </div>

            ))

          )}

        </>

      )}

    </div>
  );
}