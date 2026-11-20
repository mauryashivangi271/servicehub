import { useState, useRef } from "react";
import { TicketPercent, X, Save } from "lucide-react";
import { saveCoupon } from "../../services/couponService";

function localDate(value) {
  const date = new Date(value);

  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  ).toISOString().slice(0, 16);
}

export default function CouponForm({
  coupon,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(() => ({
    code: "",
    title: "",
    description: "",
    discount_type: "percentage",
    discount_value: 10,
    minimum_order_amount: 0,
    usage_limit: 100,
    per_customer_limit: 1,
    ...coupon,
    maximum_discount: coupon?.maximum_discount ?? "",
    starts_at: localDate(
      coupon?.starts_at || Date.now()
    ),
    expires_at: localDate(
      coupon?.expires_at ||
        Date.now() + 30 * 24 * 60 * 60 * 1000
    ),
  }));

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const locked = useRef(false);

  function update(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "code"
        ? value.toUpperCase()
        : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (locked.current) return;

    setError("");

    const discount = Number(form.discount_value);

    if (!/^[A-Z0-9_-]{3,30}$/.test(form.code.trim())) {
      setError("Enter a valid coupon code.");
      return;
    }

    if (form.title.trim().length < 3) {
      setError("Title must contain at least 3 characters.");
      return;
    }

    if (
      !Number.isFinite(discount) ||
      discount <= 0 ||
      (form.discount_type === "percentage" && discount > 100)
    ) {
      setError("Enter a valid discount value.");
      return;
    }

    if (
      Number(form.per_customer_limit) >
      Number(form.usage_limit)
    ) {
      setError("Customer limit cannot exceed total usage limit.");
      return;
    }

    if (
      new Date(form.expires_at) <=
      new Date(form.starts_at)
    ) {
      setError("Expiry date must be after start date.");
      return;
    }

    locked.current = true;
    setBusy(true);

    try {
      await saveCoupon(form);
      await onSaved?.();
    } catch (err) {
      setError(
        err.code === "23505"
          ? "This coupon code already exists."
          : err.message || "Unable to save coupon."
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  const inputClass =
    "w-full border rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-indigo-200";

  const fields = [
    {
      label: "Coupon Code",
      name: "code",
      maxLength: 30,
    },
    {
      label: "Coupon Title",
      name: "title",
      maxLength: 150,
    },
    {
      label: "Discount Value",
      name: "discount_value",
      type: "number",
      min: 0.01,
      max: form.discount_type === "percentage"
        ? 100
        : 9999999999.99,
      step: 0.01,
    },
    {
      label: "Minimum Order Amount (₹)",
      name: "minimum_order_amount",
      type: "number",
      min: 0,
      step: 0.01,
    },
    {
      label: "Maximum Discount (₹)",
      name: "maximum_discount",
      type: "number",
      min: 0.01,
      step: 0.01,
      optional: true,
    },
    {
      label: "Total Usage Limit",
      name: "usage_limit",
      type: "number",
      min: 1,
      max: 2147483647,
      step: 1,
    },
    {
      label: "Per Customer Limit",
      name: "per_customer_limit",
      type: "number",
      min: 1,
      max: 2147483647,
      step: 1,
    },
    {
      label: "Start Date",
      name: "starts_at",
      type: "datetime-local",
    },
    {
      label: "Expiry Date",
      name: "expires_at",
      type: "datetime-local",
    },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-2xl p-6 space-y-5"
    >
      <div className="flex justify-between items-center">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <TicketPercent className="text-indigo-600" />
          {coupon ? "Edit Coupon" : "Create Coupon"}
        </h2>

        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          aria-label="Close coupon form"
        >
          <X />
        </button>
      </div>

      {error && (
        <p role="alert" className="bg-red-50 text-red-700 p-3 rounded-xl">
          {error}
        </p>
      )}

      <label className="block space-y-2 text-sm font-medium">
        Discount Type

        <select
          name="discount_type"
          value={form.discount_type}
          onChange={update}
          className={inputClass}
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>
      </label>

      <div className="grid md:grid-cols-2 gap-4">
        {fields.map(({ label, name, optional, ...props }) => (
          <label
            key={name}
            className="space-y-2 text-sm font-medium"
          >
            {label}

            <input
              {...props}
              name={name}
              required={!optional}
              value={form[name]}
              onChange={update}
              className={inputClass}
            />
          </label>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Dates use your device's local timezone.
        Leave maximum discount empty for no additional cap.
      </p>

      <label className="block space-y-2 text-sm font-medium">
        Description

        <textarea
          name="description"
          value={form.description || ""}
          onChange={update}
          maxLength={2000}
          rows={4}
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        className="flex items-center gap-2 bg-indigo-600
          text-white px-5 py-3 rounded-xl disabled:opacity-50"
      >
        <Save size={18} />
        {busy ? "Saving..." : "Save Coupon"}
      </button>
    </form>
  );
}