import { useState } from "react";
import { History } from "lucide-react";

import {
  formatDate,
} from "../../services/inventoryService";

const colors = {
  stock_in: "bg-green-100 text-green-700",
  stock_out: "bg-red-100 text-red-700",
  assignment: "bg-purple-100 text-purple-700",
  return: "bg-blue-100 text-blue-700",
};

export default function StockHistory({ movements = [] }) {
  const [filter, setFilter] = useState("all");

  const filtered = movements.filter(
    (item) => filter === "all" || item.movement_type === filter
  );

  return (
    <div className="bg-white border rounded-2xl p-5 space-y-5">

      <div className="flex flex-wrap items-center justify-between gap-3">

        <h2 className="flex items-center gap-2 font-bold text-xl">
          <History size={23} />
          Stock History
        </h2>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-xl p-3"
        >
          <option value="all">All Movements</option>
          <option value="stock_in">Stock In</option>
          <option value="stock_out">Stock Out</option>
          <option value="assignment">Assignment</option>
          <option value="return">Return</option>
        </select>

      </div>

      <p className="text-xs text-slate-500">
        Showing transactions from the latest 100 movements.
      </p>

      <div className="overflow-x-auto">

        <table className="w-full text-sm text-left">

          <thead className="bg-slate-50 text-slate-600">

            <tr>
              {[
                "Item",
                "Type",
                "Quantity",
                "Previous Stock",
                "New Stock",
                "Date",
                "Notes",
              ].map((heading) => (
                <th key={heading} className="p-3 whitespace-nowrap">
                  {heading}
                </th>
              ))}
            </tr>

          </thead>

          <tbody>

            {filtered.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">

                <td className="p-3 font-medium">
                  {item.inventory_items?.name || "Inventory Item"}
                </td>

                <td className="p-3">
                  <span className={`${colors[item.movement_type]}
                    rounded-full px-3 py-1 text-xs capitalize whitespace-nowrap`}>
                    {item.movement_type.replaceAll("_", " ")}
                  </span>
                </td>

                <td className="p-3">{item.quantity}</td>
                <td className="p-3">{item.previous_stock}</td>
                <td className="p-3 font-semibold">{item.new_stock}</td>

                <td className="p-3 whitespace-nowrap">
                  {formatDate(item.created_at)}
                </td>

                <td className="p-3 break-words min-w-[150px]">
                  {item.notes || "-"}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {filtered.length === 0 && (
        <div className="text-center text-slate-500 py-10">
          No stock movements found.
        </div>
      )}

    </div>
  );
}