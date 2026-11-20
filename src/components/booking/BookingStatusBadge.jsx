const statuses = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700",
  },
  accepted: {
    label: "Accepted",
    color: "bg-blue-100 text-blue-700",
  },
  assigned: {
    label: "Employee Assigned",
    color: "bg-indigo-100 text-indigo-700",
  },
  on_the_way: {
    label: "On the Way",
    color: "bg-purple-100 text-purple-700",
  },
  arrived: {
    label: "Arrived",
    color: "bg-cyan-100 text-cyan-700",
  },
  inspection: {
    label: "Inspection",
    color: "bg-orange-100 text-orange-700",
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700",
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-700",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700",
  },
};

export default function BookingStatusBadge({ status }) {
  const item = statuses[status] || {
    label: status || "Unknown",
    color: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${item.color}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />

      {item.label}
    </span>
  );
}