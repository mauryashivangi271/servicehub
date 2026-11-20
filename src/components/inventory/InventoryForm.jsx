import { useState, useRef } from "react";
import { PackagePlus, X, Save } from "lucide-react";

import {
  saveInventoryItem,
} from "../../services/inventoryService";

const initialForm = {
  name: "",
  sku: "",
  category: "tool",
  unit: "pcs",
  minimum_stock: 5,
  unit_price: 0,
  description: "",
};

export default function InventoryForm({
  businessId,
  item,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(
    item ? { ...initialForm, ...item } : initialForm
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const locked = useRef(false);

  function update(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (locked.current) return;

    setError("");

    if (form.name.trim().length < 2 || !form.sku.trim()) {
      setError("Enter a valid item name and SKU.");
      return;
    }

    if (
      !Number.isInteger(Number(form.minimum_stock)) ||
      Number(form.minimum_stock) < 0 ||
      !Number.isFinite(Number(form.unit_price)) ||
      Number(form.unit_price) < 0
    ) {
      setError("Enter valid stock and price values.");
      return;
    }

    locked.current = true;
    setBusy(true);

    try {
      await saveInventoryItem(businessId, form);
      await onSaved?.();

    } catch (err) {
      setError(
        err.code === "23505"
          ? "This SKU already exists."
          : err.message || "Unable to save item."
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  const inputClass =
    "w-full border rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-blue-200";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-2xl p-6 space-y-5"
    >

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <PackagePlus className="text-blue-600" />

          <h2 className="text-xl font-bold">
            {item ? "Edit Inventory Item" : "Add Inventory Item"}
          </h2>

        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label="Close form"
        >
          <X size={23} />
        </button>

      </div>

      {error && (
        <p role="alert"
          className="bg-red-50 text-red-700 p-3 rounded-xl">
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-4">

        <label className="space-y-2 text-sm font-medium">
          Item Name
          <input
            name="name"
            value={form.name}
            onChange={update}
            required
            maxLength={150}
            className={inputClass}
          />
        </label>

        <label className="space-y-2 text-sm font-medium">
          SKU / Item Code
          <input
            name="sku"
            value={form.sku}
            onChange={update}
            maxLength={50}
            required
            className={inputClass}
          />
        </label>

        <label className="space-y-2 text-sm font-medium">
          Category
          <select
            name="category"
            value={form.category}
            onChange={update}
            className={inputClass}
          >
            <option value="tool">Tool</option>
            <option value="material">Material</option>
            <option value="spare_part">Spare Part</option>
            <option value="equipment">Equipment</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          Unit
          <input
            name="unit"
            value={form.unit}
            onChange={update}
            maxLength={30}
            required
            className={inputClass}
          />
        </label>

        <label className="space-y-2 text-sm font-medium">
          Minimum Stock
          <input
            type="number"
            name="minimum_stock"
            value={form.minimum_stock}
            onChange={update}
            min="0"
            max="2147483647"
            step="1"
            required
            className={inputClass}
          />
        </label>

        <label className="space-y-2 text-sm font-medium">
          Unit Price (₹)
          <input
            type="number"
            name="unit_price"
            value={form.unit_price}
            onChange={update}
            min="0"
            max="9999999999.99"
            step="0.01"
            required
            className={inputClass}
          />
        </label>

      </div>

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

      {!item && (
        <p className="bg-blue-50 text-blue-700 p-3 rounded-xl text-sm">
          New items start with zero available stock.
          Use Stock In after saving to add quantity.
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="flex items-center gap-2 bg-blue-600
        text-white rounded-xl px-5 py-3 disabled:opacity-50"
      >
        <Save size={18} />
        {busy ? "Saving..." : "Save Item"}
      </button>

    </form>
  );
}