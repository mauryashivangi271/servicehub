const styles = {
  open: "bg-blue-100 text-blue-700",
  under_review: "bg-amber-100 text-amber-700",
  investigating: "bg-indigo-100 text-indigo-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  escalated: "bg-purple-100 text-purple-700",
};

export default function ComplaintStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full
      text-xs font-semibold capitalize ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {(status || "unknown").replaceAll("_", " ")}
    </span>
  );
}