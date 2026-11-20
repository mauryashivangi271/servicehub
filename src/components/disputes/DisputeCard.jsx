import {
  Scale,
  CalendarDays,
  CheckCircle,
} from "lucide-react";

import ComplaintStatusBadge from
  "../complaints/ComplaintStatusBadge";

import {
  formatDate,
} from "../../services/complaintService";

export default function DisputeCard({
  dispute,
  children,
}) {
  return (
    <article className="bg-white border rounded-2xl
      p-5 shadow-sm space-y-4">

      <div className="flex flex-wrap
        items-start justify-between gap-3">

        <div className="flex items-center gap-3">

          <div className="bg-purple-100 text-purple-700
            rounded-xl p-3">

            <Scale size={25} />

          </div>

          <div>
            <h3 className="font-bold text-lg">
              Service Dispute
            </h3>

            <p className="text-xs text-slate-500">
              #{dispute.id.slice(0, 8)}
            </p>
          </div>

        </div>

        <ComplaintStatusBadge status={dispute.status} />

      </div>

      <div className="grid sm:grid-cols-2
        text-sm text-slate-600 gap-3">

        <p>
          Booking: #{dispute.booking_id.slice(0, 8)}
        </p>

        <p>
          Complaint: #{dispute.complaint_id.slice(0, 8)}
        </p>

        <p className="flex items-center gap-2">
          <CalendarDays size={16} />
          {formatDate(dispute.created_at)}
        </p>

      </div>

      <div className="bg-slate-50 rounded-xl p-4">

        <h4 className="font-semibold mb-2">
          Dispute Reason
        </h4>

        <p className="text-sm text-slate-600
          whitespace-pre-wrap break-words">
          {dispute.reason}
        </p>

      </div>

      {dispute.resolution && (
        <div className="bg-blue-50 rounded-xl p-4">

          <h4 className="flex items-center gap-2
            font-semibold text-blue-700 mb-2">

            <CheckCircle size={18} />

            Investigation / Resolution

          </h4>

          <p className="text-sm text-slate-700
            whitespace-pre-wrap break-words">
            {dispute.resolution}
          </p>

        </div>
      )}

      {dispute.resolved_at && (
        <p className="text-sm text-slate-500">
          Closed: {formatDate(dispute.resolved_at)}
        </p>
      )}

      {children}

    </article>
  );
}