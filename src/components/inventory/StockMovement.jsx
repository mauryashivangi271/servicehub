import { useState, useRef } from "react";
import { X, PackagePlus, PackageMinus } from "lucide-react";

import {
  updateStock,
} from "../../services/inventoryService";

export default function StockMovement({
  item,
  type,
  onClose,
  onSaved,
}) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const locked = useRef(false);

  const isStockIn = type === "stock_in";

  const newStock = isStockIn
    ? item.quantity + Number(quantity)
    : item.quantity - Number(quantity);

  async function handleSubmit(event) {
    event.preventDefault();

    if (locked.current) return;

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty <= 0) {
      setError("Enter a positive whole number.");
      return;
    }

    if (!isStockIn && qty > item.quantity) {
      setError("Insufficient available stock.");
      return;
    }

    locked.current = true;
    setBusy(true);
    setError("");

    try {
      await updateStock(item.id, type, qty, notes);
      await onSaved?.();
    } catch (err) {
      setError(err.message || "Unable to update stock.");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-2xl p-6 space-y-4"
    >

      <div className="flex items-center justify-between">

        <h2 className="flex gap-2 items-center font-bold text-xl">
          {isStockIn
            ? <PackagePlus className="text-green-600" />
            : <PackageMinus className="text-red-600" />}

          {isStockIn ? "Stock In" : "Stock Out"}
        </h2>

        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          aria-label="Close stock form"
        >
          <X />
        </button>

      </div>

      <div className="bg-slate-50 rounded-xl p-4">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-sm text-slate-500">
          Available: {item.quantity} {item.unit}
        </p>
      </div>

      {error && (
        <p role="alert" className="text-red-600 bg-red-50 p-3 rounded-xl">
          {error}
        </p>
      )}

      <label className="block space-y-2 text-sm font-medium">
        Quantity
        <input
          type="number"
          min="1"
          step="1"
          max={isStockIn
            ? 2147483647 - item.quantity
            : item.quantity}
          value={quantity}
          required
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full border rounded-xl p-3"
        />
      </label>

      <label className="block space-y-2 text-sm font-medium">
        Notes
        <textarea
          rows={3}
          maxLength={1000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Reason for stock movement..."
          className="w-full border rounded-xl p-3"
        />
      </label>

      <div className="bg-blue-50 text-blue-700 rounded-xl p-4">
        Expected Stock: <strong>{newStock}</strong> {item.unit}
      </div>

      <button
        type="submit"
        disabled={busy || newStock < 0}
        className="bg-blue-600 text-white rounded-xl
        px-5 py-3 font-semibold disabled:opacity-50"
      >
        {busy ? "Updating..." : "Confirm Stock Movement"}
      </button>

    </form>
  );
}