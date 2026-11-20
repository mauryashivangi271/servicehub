import {
  X,
  User,
  BadgeCheck,
  MapPin,
  Briefcase,
  Building2,
} from "lucide-react";

import { formatPrice, pricingLabels } from "./ServiceCard";

export default function ProviderProfile({
  provider,
  services,
  onClose,
  onBook,
}) {
  const providerServices = services.filter(
    item => item.provider_id === provider.provider_id
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Provider profile"
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >

        <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-7 rounded-t-2xl">

          <div className="flex justify-between items-start">

            <div className="bg-white/20 p-4 rounded-2xl">
              {provider.provider_type === "business"
                ? <Building2 size={44} />
                : <User size={44} />}
            </div>

            <button
              onClick={onClose}
              aria-label="Close profile"
              className="p-2 hover:bg-white/20 rounded-lg"
            >
              <X size={24} />
            </button>

          </div>

          <h2 className="text-2xl font-bold mt-4">
            {provider.provider_name}
          </h2>

          <p className="flex items-center gap-2 text-blue-100 mt-2">
            <BadgeCheck size={19} />
            Verified Service Provider
          </p>

        </div>

        <div className="p-6 space-y-6">

          <div className="grid sm:grid-cols-3 gap-3">

            {[
              {
                label: "Experience",
                value: `${provider.experience} years`,
              },
              {
                label: "Listed Services",
                value: providerServices.length,
              },
              {
                label: "Provider Type",
                value:
                  provider.provider_type === "business"
                    ? "Business"
                    : "Individual",
              },
            ].map(item => (
              <div
                key={item.label}
                className="bg-slate-50 border rounded-xl p-4"
              >
                <p className="text-sm text-slate-500">
                  {item.label}
                </p>

                <p className="text-lg font-bold mt-1">
                  {item.value}
                </p>
              </div>
            ))}

          </div>

          <section>
            <h3 className="font-bold text-lg mb-2">
              About Professional
            </h3>

            <p className="text-slate-600 whitespace-pre-wrap">
              {provider.provider_description ||
                "No profile description provided."}
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-3">
              Skills & Expertise
            </h3>

            <div className="flex flex-wrap gap-2">

              {(provider.skills || "")
                .split(",")
                .map(skill => skill.trim())
                .filter(Boolean)
                .map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm"
                  >
                    {skill}
                  </span>
                ))}

            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-bold text-lg mb-2">
              <MapPin size={20} />
              Service Location
            </h3>

            <p className="text-slate-600">
              {provider.city}, {provider.service_area}
            </p>
          </section>

          <section>

            <h3 className="flex items-center gap-2 font-bold text-lg mb-4">
              <Briefcase size={20} />
              Available Services
            </h3>

            <div className="space-y-3">

              {providerServices.map(service => (
                <div
                  key={service.service_id}
                  className="border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
                >

                  <div>
                    <h4 className="font-semibold">
                      {service.service_title}
                    </h4>

                    <p className="text-sm text-slate-500">
                      {service.category_name}
                    </p>

                    <p className="font-bold text-blue-600 mt-2">
                      {formatPrice(service.price)}
                    </p>

                    <p className="text-xs text-slate-500">
                      {pricingLabels[service.pricing_type]}
                    </p>
                  </div>

                  <button
                    onClick={() => onBook(service)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
                  >
                    Book Now
                  </button>

                </div>
              ))}

            </div>
          </section>

          <button
            onClick={onClose}
            className="w-full border py-3 rounded-xl"
          >
            Close Profile
          </button>

        </div>
      </div>
    </div>
  );
}