import {
  ShieldAlert,
  CalendarDays,
  MessageSquare,
} from "lucide-react";

import ComplaintStatusBadge from "./ComplaintStatusBadge";

import {
  formatDate,
  formatStatus,
} from "../../services/complaintService";

export default function ComplaintCard({
  complaint,
  children,
}) {
  return (
    <article className="bg-white border rounded-2xl
      shadow-sm p-5 space-y-4">

      <div className="flex flex-wrap
        justify-between items-start gap-3">

        <div className="flex items-center gap-3">

          <div className="bg-orange-50 text-orange-600
            rounded-xl p-3">
            <ShieldAlert size={24} />
          </div>

          <div>
            <h3 className="font-bold text-lg break-words">
              {complaint.subject}
            </h3>

            <p className="text-xs text-slate-500">
              Complaint #{complaint.id.slice(0, 8)}
            </p>
          </div>

        </div>

        <ComplaintStatusBadge status={complaint.status} />

      </div>

      <div className="grid sm:grid-cols-2
        gap-3 text-sm text-slate-600">

        <p>
          Booking: #{complaint.booking_id.slice(0, 8)}
        </p>

        <p className="capitalize">
          Category: {formatStatus(complaint.category)}
        </p>

        <div className="flex items-center gap-2">
          <CalendarDays size={16} />
          {formatDate(complaint.created_at)}
        </div>

      </div>

      <div className="bg-slate-50 rounded-xl p-4">

        <h4 className="font-medium text-sm mb-2">
          Complaint Details
        </h4>

        <p className="text-slate-600 text-sm
          whitespace-pre-wrap break-words">
          {complaint.description}
        </p>

      </div>

      {complaint.admin_response && (
        <div className="bg-blue-50 rounded-xl p-4">

          <h4 className="flex items-center gap-2
            font-semibold text-blue-700 mb-2">
            <MessageSquare size={18} />
            Admin Response
          </h4>

          <p className="text-sm text-slate-700
            whitespace-pre-wrap break-words">
            {complaint.admin_response}
          </p>

          <p className="text-xs text-slate-500 mt-2">
            Updated: {formatDate(complaint.updated_at)}
          </p>

        </div>
      )}

      {complaint.resolved_at && (
        <p className="text-sm text-slate-500">
          Closed: {formatDate(complaint.resolved_at)}
        </p>
      )}

      {children}

    </article>
  );
}