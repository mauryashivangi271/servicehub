import { useState } from "react";

import {
  Search,
  Package,
  Pencil,
  Plus,
  Minus,
  Wrench,
  Power,
} from "lucide-react";

import {
  formatCurrency,
} from "../../services/inventoryService";

export default function InventoryList({
  items = [],
  onEdit,
  onStock,
  onAssign,
  onToggle,
  busy = false,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = items.filter((item) => {
    const matchesSearch =
      `${item.name} ${item.sku}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "low" && item.is_active &&
        item.quantity <= item.minimum_stock) ||
      (filter === "inactive" && !item.is_active) ||
      (filter === "active" && item.is_active);

    return matchesSearch && matchesFilter;
  });

  const buttonClass =
    "inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50";

  return (
    <div className="space-y-4">

      <div className="flex flex-wrap gap-3">

        <div className="flex items-center gap-2
          bg-white border rounded-xl p-3 flex-1">

          <Search size={19} className="text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items or SKU..."
            className="outline-none w-full"
          />

        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border bg-white rounded-xl p-3"
        >
          <option value="all">All Items</option>
          <option value="active">Active Items</option>
          <option value="low">Low Stock</option>
          <option value="inactive">Inactive Items</option>
        </select>

      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">

          <Package
            size={45}
            className="text-slate-300 mx-auto"
          />

          <h3 className="font-bold mt-4">
            No inventory items found
          </h3>

        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">

          {filtered.map((item) => {
            const status = !item.is_active
              ? "Inactive"
              : item.quantity === 0
              ? "Out of Stock"
              : item.quantity <= item.minimum_stock
              ? "Low Stock"
              : "In Stock";

            const statusColor =
              status === "In Stock"
                ? "bg-green-100 text-green-700"
                : status === "Inactive"
                ? "bg-slate-100 text-slate-600"
                : "bg-orange-100 text-orange-700";

            return (
              <article
                key={item.id}
                className="bg-white border rounded-2xl p-5 space-y-4"
              >

                <div className="flex justify-between gap-3">

                  <div className="flex gap-3 items-center">

                    <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                      <Package size={24} />
                    </div>

                    <div>
                      <h3 className="font-bold break-words">
                        {item.name}
                      </h3>

                      <p className="text-xs text-slate-500">
                        {item.sku}
                      </p>
                    </div>

                  </div>

                  <span className={`${statusColor} h-fit px-3 py-1
                    rounded-full text-xs font-semibold`}>
                    {status}
                  </span>

                </div>

                <div className="grid grid-cols-2 gap-3
                  bg-slate-50 rounded-xl p-4 text-sm">

                  <div>
                    <p className="text-slate-500">
                      Available Stock
                    </p>
                    <p className="text-lg font-bold">
                      {item.quantity} {item.unit}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Unit Price</p>
                    <p className="font-semibold">
                      {formatCurrency(item.unit_price)}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">
                      Minimum Stock
                    </p>
                    <p>{item.minimum_stock}</p>
                  </div>

                  <div>
                    <p className="text-slate-500">Category</p>
                    <p className="capitalize">
                      {item.category.replaceAll("_", " ")}
                    </p>
                  </div>

                </div>

                {item.description && (
                  <p className="text-sm text-slate-500 break-words">
                    {item.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">

                  {item.is_active && (
                    <>
                      <button
                        disabled={busy}
                        onClick={() => onEdit(item)}
                        className={`${buttonClass} bg-slate-100`}
                      >
                        <Pencil size={15} /> Edit
                      </button>

                      <button
                        disabled={busy}
                        onClick={() => onStock(item, "stock_in")}
                        className={`${buttonClass} bg-green-50 text-green-700`}
                      >
                        <Plus size={15} /> Stock In
                      </button>

                      <button
                        disabled={busy || item.quantity === 0}
                        onClick={() => onStock(item, "stock_out")}
                        className={`${buttonClass} bg-red-50 text-red-700`}
                      >
                        <Minus size={15} /> Stock Out
                      </button>

                      {["tool", "equipment"].includes(item.category) && (
                        <button
                          disabled={busy || item.quantity === 0}
                          onClick={() => onAssign(item)}
                          className={`${buttonClass} bg-purple-50 text-purple-700`}
                        >
                          <Wrench size={15} /> Assign Tool
                        </button>
                      )}
                    </>
                  )}

                  <button
                    disabled={busy}
                    onClick={() => onToggle(item)}
                    className={`${buttonClass} bg-slate-100`}
                  >
                    <Power size={15} />
                    {item.is_active ? "Deactivate" : "Activate"}
                  </button>

                </div>

              </article>
            );
          })}

        </div>
      )}

    </div>
  );
}