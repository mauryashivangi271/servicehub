import CategoryArt from "./CategoryArt";
import {
  X,
  Clock,
  MapPin,
  BadgeCheck,
  Briefcase,
} from "lucide-react";

import { formatPrice, pricingLabels } from "./ServiceCard";

export default function ServiceDetails({
  service,
  onClose,
  onBook,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Service details"
        className="bg-white shadow-2xl rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-6"
      >

        <div className="flex justify-between items-start">

          <div className="bg-blue-50 text-blue-600 rounded-xl p-4">
            <Briefcase size={30} />
          </div>

          <button
            onClick={onClose}
            aria-label="Close service details"
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <X size={23} />
          </button>

        </div>

        <CategoryArt name={service.category_name} />
        <div>
          <p className="text-sm text-blue-600">
            {service.category_name}
          </p>

          <h2 className="text-2xl font-bold mt-1">
            {service.service_title}
          </h2>
        </div>

        <div className="bg-green-50 text-green-700 rounded-xl p-4 flex items-center gap-2">
          <BadgeCheck size={21} />
          {service.provider_name}
        </div>

        <section>
          <h3 className="font-bold mb-2">
            Service Description
          </h3>

          <p className="text-slate-600 whitespace-pre-wrap">
            {service.service_description ||
              "No detailed description provided."}
          </p>
        </section>

        <div className="space-y-3 text-slate-600">

          <p className="flex items-center gap-2">
            <Clock size={20} />
            Estimated {service.duration_minutes} minutes
          </p>

          <p className="flex items-center gap-2">
            <MapPin size={20} />
            {service.city}, {service.service_area}
          </p>

        </div>

        <div className="bg-blue-50 rounded-xl p-5">

          <p className="text-sm text-blue-700">
            {pricingLabels[service.pricing_type]}
          </p>

          <p className="text-3xl font-bold text-blue-700 mt-2">
            {formatPrice(service.price)}

            {service.pricing_type === "hourly" && (
              <span className="text-sm"> / hour</span>
            )}
          </p>

          <p className="text-xs text-slate-600 mt-3">
            {service.pricing_type === "inspection"
              ? "This is the inspection fee, not the final repair cost."
              : service.pricing_type === "hourly"
              ? "Final charges depend on actual service duration."
              : "Listed price for the described service."}
          </p>

        </div>

        <div className="flex gap-3">

          <button
            onClick={onClose}
            className="flex-1 border rounded-xl py-3"
          >
            Cancel
          </button>

          <button
            onClick={() => onBook(service)}
            className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-semibold"
          >
            Book Service
          </button>

        </div>

      </div>
    </div>
  );
}