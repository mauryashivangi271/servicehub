import FavoriteButton from "./FavoriteButton";
import CategoryArt from "./CategoryArt";
import {
  Briefcase,
  BadgeCheck,
  MapPin,
  Clock,
  Building2,
  User,
} from "lucide-react";

export function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(price));
}

export const pricingLabels = {
  fixed: "Fixed Price",
  hourly: "Hourly Rate",
  inspection: "Inspection Fee",
};

export default function ServiceCard({
  service,
  onProfile,
  onDetails,
  onBook,
  onFavoriteChange,
}) {
  return (
    <article className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 hover:shadow-lg transition-all flex flex-col">

      <CategoryArt name={service.category_name} />
      <FavoriteButton serviceId={service.service_id} onChange={onFavoriteChange} />
      <div className="flex items-start justify-between gap-3">

        <div className="bg-blue-50 text-blue-600 rounded-xl p-3">
          <Briefcase size={26} />
        </div>

        <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-2 rounded-full">
          <BadgeCheck size={15} />
          Verified
        </span>

      </div>

      <div>
        <p className="text-xs font-semibold text-blue-600">
          {service.category_name}
        </p>

        <h3 className="text-lg font-bold mt-1">
          {service.service_title}
        </h3>
      </div>

      <p className="text-sm text-slate-500 line-clamp-3">
        {service.service_description ||
          "Contact the provider through a booking request for more details."}
      </p>

      <div className="bg-slate-50 rounded-xl p-3">

        <div className="flex items-center gap-2 font-semibold">

          {service.provider_type === "business"
            ? <Building2 size={18} />
            : <User size={18} />}

          {service.provider_name}

        </div>

        <p className="text-xs text-slate-500 mt-2">
          {service.experience} years of experience
        </p>

      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600">
        <MapPin size={17} />
        {service.city}, {service.service_area}
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Clock size={17} />
        Estimated {service.duration_minutes} minutes
      </div>

      <div className="border-t pt-4 mt-auto">

        <p className="text-xs text-slate-500">
          {pricingLabels[service.pricing_type]}
        </p>

        <p className="text-2xl font-bold text-blue-600">
          {formatPrice(service.price)}

          {service.pricing_type === "hourly" && (
            <span className="text-sm font-normal">
              {" "}/ hour
            </span>
          )}
        </p>

      </div>

      <div className="grid grid-cols-2 gap-2">

        <button
          onClick={() => onProfile(service)}
          className="border border-blue-200 text-blue-700 rounded-xl py-2 text-sm font-medium hover:bg-blue-50"
        >
          View Profile
        </button>

        <button
          onClick={() => onDetails(service)}
          className="border rounded-xl py-2 text-sm font-medium hover:bg-slate-50"
        >
          Details
        </button>

      </div>

      <button
        onClick={() => onBook(service)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold"
      >
        Book Now
      </button>

    </article>
  );
}