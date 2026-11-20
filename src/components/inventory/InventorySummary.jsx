import {
  Package,
  AlertTriangle,
  IndianRupee,
  Wrench,
} from "lucide-react";

import {
  formatCurrency,
} from "../../services/inventoryService";

export default function InventorySummary({
  items = [],
  assignments = [],
}) {
  const activeItems = items.filter(
    (item) => item.is_active
  );

  const lowStock = activeItems.filter(
    (item) => item.quantity <= item.minimum_stock
  ).length;

  const activeAssignments = assignments.filter(
    (item) => item.status === "assigned"
  );

  const assignedTools = activeAssignments.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  const assignedValue = activeAssignments.reduce(
    (total, assignment) => {
      const item = items.find(
        (row) => row.id === assignment.item_id
      );

      return total +
        Number(assignment.quantity) *
        Number(item?.unit_price || 0);
    },
    0
  );

  const inventoryValue = activeItems.reduce(
    (total, item) =>
      total + Number(item.quantity) * Number(item.unit_price),
    assignedValue
  );

  const stats = [
    {
      label: "Active Items",
      value: activeItems.length,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Low Stock Items",
      value: lowStock,
      icon: AlertTriangle,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Inventory Value",
      value: formatCurrency(inventoryValue),
      icon: IndianRupee,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Assigned Tools",
      value: assignedTools,
      icon: Wrench,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

      {stats.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="bg-white border rounded-2xl p-5 shadow-sm"
        >

          <div className={`${color} w-fit p-3 rounded-xl`}>
            <Icon size={24} />
          </div>

          <p className="text-sm text-slate-500 mt-4">
            {label}
          </p>

          <h2 className="text-2xl font-bold mt-2 break-words">
            {value}
          </h2>

        </div>
      ))}

    </div>
  );
}