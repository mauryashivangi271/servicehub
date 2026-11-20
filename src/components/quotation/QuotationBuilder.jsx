import { useState, useRef } from "react";

import {
  FileText,
  Plus,
  Trash2,
  Send,
} from "lucide-react";

import {
  createQuotation,
  formatCurrency,
} from "../../services/quotationService";

function newItem() {
  return {
    key: crypto.randomUUID(),
    item_type: "labour",
    description: "",
    quantity: "1",
    unit_price: "",
  };
}

export default function QuotationBuilder({
  booking,
  onCreated,
  onClose,
}) {
  const [items, setItems] = useState([newItem()]);
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submitting = useRef(false);

  function addItem() {
    if (items.length >= 50) return;

    setItems(previous => [
      ...previous,
      newItem(),
    ]);
  }

  function removeItem(key) {
    if (items.length === 1) return;

    setItems(previous =>
      previous.filter(item => item.key !== key)
    );
  }

  function updateItem(key, field, value) {
    setItems(previous =>
      previous.map(item =>
        item.key === key
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  function getItemAmount(item) {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;

    return Math.round(quantity * price * 100) / 100;
  }

  const subtotal = items.reduce(
    (sum, item) => sum + getItemAmount(item),
    0
  );

  const discountAmount = Number(discount) || 0;

  const total = Math.max(
    0,
    subtotal - discountAmount
  );

  async function handleSubmit(e) {
    e.preventDefault();

    if (submitting.current) return;

    setError("");
    setSuccess("");

    const invalidItem = items.some(item =>
      !item.description.trim() ||
      item.description.trim().length > 500 ||
      !Number.isFinite(Number(item.quantity)) ||
      Number(item.quantity) <= 0 ||
      item.unit_price === "" ||
      !Number.isFinite(Number(item.unit_price)) ||
      Number(item.unit_price) < 0
    );

    if (invalidItem) {
      setError(
        "Please enter valid details for every item."
      );
      return;
    }

    if (
      discountAmount < 0 ||
      discountAmount > subtotal
    ) {
      setError("Please enter a valid discount.");
      return;
    }

    if (!window.confirm(
      `Send quotation of ${formatCurrency(total)}?`
    )) return;

    submitting.current = true;
    setLoading(true);

    try {
      const quotationId = await createQuotation({
        bookingId: booking.id,

        items: items.map(item => ({
          item_type: item.item_type,
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })),

        discount: discountAmount,
        notes: notes.trim(),
      });

      setSuccess("Quotation sent successfully!");

      if (onCreated) {
        await onCreated(quotationId);
      }

    } catch (err) {
      setError(
        err.message || "Unable to send quotation."
      );
    } finally {
      setLoading(false);
      submitting.current = false;
    }
  }

  return (
    <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">

      <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white">

        <div className="flex items-center gap-3">

          <FileText size={30} />

          <div>
            <h2 className="font-bold text-2xl">
              Create Quotation
            </h2>

            <p className="text-blue-100 text-sm mt-1">
              Prepare detailed service charges.
            </p>
          </div>

        </div>

        <p className="mt-4 text-sm">
          Booking #{booking.id.slice(0, 8).toUpperCase()}
        </p>

      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-6"
      >

        <fieldset disabled={loading || !!success}>

          <div className="space-y-4">

            {items.map((item, index) => (

              <div
                key={item.key}
                className="border bg-slate-50 rounded-xl p-4 space-y-4"
              >

                <div className="flex items-center justify-between">

                  <h3 className="font-semibold">
                    Item {index + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    disabled={items.length === 1}
                    className="text-red-600 disabled:opacity-30"
                    aria-label="Remove item"
                  >
                    <Trash2 size={20} />
                  </button>

                </div>

                <label className="block text-sm font-medium">

                  Item Type

                  <select
                    value={item.item_type}
                    onChange={e =>
                      updateItem(
                        item.key,
                        "item_type",
                        e.target.value
                      )
                    }
                    className="mt-2 w-full border rounded-lg bg-white p-3"
                  >
                    <option value="labour">
                      Labour Charges
                    </option>

                    <option value="material">
                      Material Charges
                    </option>

                    <option value="additional">
                      Additional Charges
                    </option>
                  </select>

                </label>

                <label className="block text-sm font-medium">

                  Description

                  <input
                    type="text"
                    value={item.description}
                    onChange={e =>
                      updateItem(
                        item.key,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Enter item description"
                    maxLength={500}
                    required
                    className="mt-2 w-full border rounded-lg p-3"
                  />

                </label>

                <div className="grid sm:grid-cols-3 gap-4">

                  <label className="text-sm font-medium">

                    Quantity

                    <input
                      type="number"
                      min="0.01"
                      max="99999999.99"
                      step="0.01"
                      required
                      value={item.quantity}
                      onChange={e =>
                        updateItem(
                          item.key,
                          "quantity",
                          e.target.value
                        )
                      }
                      className="mt-2 w-full border rounded-lg p-3"
                    />

                  </label>

                  <label className="text-sm font-medium">

                    Unit Price (₹)

                    <input
                      type="number"
                      min="0"
                      max="99999999.99"
                      step="0.01"
                      required
                      value={item.unit_price}
                      onChange={e =>
                        updateItem(
                          item.key,
                          "unit_price",
                          e.target.value
                        )
                      }
                      className="mt-2 w-full border rounded-lg p-3"
                    />

                  </label>

                  <div>

                    <p className="text-sm font-medium">
                      Amount
                    </p>

                    <p className="mt-2 p-3 bg-blue-50 rounded-lg font-bold text-blue-700">
                      {formatCurrency(getItemAmount(item))}
                    </p>

                  </div>

                </div>

              </div>
            ))}

          </div>

          <button
            type="button"
            onClick={addItem}
            disabled={items.length >= 50}
            className="mt-4 flex items-center justify-center gap-2 w-full border-2 border-dashed border-blue-200 rounded-xl p-3 text-blue-600 hover:bg-blue-50"
          >
            <Plus size={20} />
            Add Quotation Item
          </button>

          <div className="mt-6 space-y-4">

            <label className="block font-medium text-sm">

              Discount (₹)

              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                className="mt-2 w-full border rounded-lg p-3"
              />

            </label>

            <label className="block font-medium text-sm">

              Additional Notes

              <textarea
                rows={4}
                value={notes}
                maxLength={2000}
                onChange={e => setNotes(e.target.value)}
                placeholder="Warranty, materials, service conditions..."
                className="mt-2 w-full border rounded-lg p-3"
              />

            </label>

          </div>

        </fieldset>

        <div className="bg-slate-50 border rounded-xl p-5 space-y-3">

          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Discount</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>

          <div className="flex justify-between border-t pt-4 items-center">

            <span className="font-bold">
              Total Quotation
            </span>

            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(total)}
            </span>

          </div>

        </div>

        {error && (
          <div role="alert" className="bg-red-50 text-red-700 rounded-lg p-3">
            {error}
          </div>
        )}

        {success && (
          <div role="status" className="bg-green-50 text-green-700 rounded-lg p-3">
            {success}
          </div>
        )}

        <div className="flex flex-wrap gap-3">

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="border rounded-xl px-6 py-3"
            >
              Close
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !!success}
            className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-5 font-semibold disabled:opacity-50"
          >

            <Send size={18} />

            {loading
              ? "Sending Quotation..."
              : "Send Quotation to Customer"}

          </button>

        </div>

      </form>

    </section>
  );
}