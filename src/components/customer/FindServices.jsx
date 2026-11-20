import { useEffect, useState, useCallback } from "react";

import {
  Search,
  MapPin,
  SlidersHorizontal,
  ShieldCheck,
  RefreshCw,
  Briefcase,
} from "lucide-react";

import {
  getPublicServices,
  getPublicCategories,
} from "../../services/marketplaceService";

import {useAuth} from "../../context/AuthContext";
import {getFavorites} from "../../services/favoriteService";
import ServiceCard from "../marketplace/ServiceCard";
import ProviderProfile from "../marketplace/ProviderProfile";
import ServiceDetails from "../marketplace/ServiceDetails";
import BookingForm from "./BookingForm";

export default function FindServices({savedOnly=false}) {
  const {user}=useAuth();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [providerType, setProviderType] = useState("");
  const [pricingType, setPricingType] = useState("");
  const [sort, setSort] = useState("latest");

  const [selected, setSelected] = useState(null);
  const [profile, setProfile] = useState(null);
  const [details, setDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [serviceData, categoryData] =
        await Promise.all([
          getPublicServices(),
          getPublicCategories(),
        ]);

      const saved = savedOnly ? new Set((await getFavorites(user.id)).map(r=>r.service_id)) : null;
      setServices(saved ? serviceData.filter(s=>saved.has(s.service_id)) : serviceData);
      setCategories(categoryData);
    } catch (err) {
      setError(
        err.message || "Unable to load services."
      );
    } finally {
      setLoading(false);
    }
  }, [savedOnly,user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  const cities = [
    ...new Set(
      services
        .map(service => normalize(service.city))
        .filter(Boolean)
    ),
  ].sort();

  const filteredServices = services
    .filter(service => {
      const text = [
        service.service_title,
        service.service_description,
        service.provider_name,
        service.category_name,
        service.skills,
        service.city,
        service.service_area,
      ]
        .join(" ")
        .toLowerCase();

      return (
        text.includes(normalize(search)) &&
        (!category ||
          service.category_id === category) &&
        (!city ||
          normalize(service.city) === city) &&
        (!area ||
          normalize(service.service_area).includes(
            normalize(area)
          )) &&
        (!providerType ||
          service.provider_type === providerType) &&
        (!pricingType ||
          service.pricing_type === pricingType)
      );
    })
    .sort((a, b) => {
      if (sort === "price-low") {
        return Number(a.price) - Number(b.price);
      }

      if (sort === "price-high") {
        return Number(b.price) - Number(a.price);
      }

      if (sort === "experience") {
        return b.experience - a.experience;
      }

      return 0;
    });

  function resetFilters() {
    setSearch("");
    setCategory("");
    setCity("");
    setArea("");
    setProviderType("");
    setPricingType("");
    setSort("latest");
  }

  function bookService(service) {
    setProfile(null);
    setDetails(null);
    setMessage("");

    // Preserve the existing BookingForm interface.
    setSelected({
      id: service.service_id,
      worker_id: service.provider_id,
      category_id: service.category_id,
      title: service.service_title,
      description: service.service_description,
      price: service.price,
      pricing_type: service.pricing_type,
      duration_minutes: service.duration_minutes,
      provider_name: service.provider_name,
    });
  }

  const inputClass =
    "w-full border border-slate-200 bg-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-6">

      {/* Marketplace Header */}

      <div className="bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-700 rounded-2xl p-7 text-white">

        <div className="flex items-center gap-2 text-blue-100 text-sm mb-3">
          <ShieldCheck size={20} />
          Verified Professionals
        </div>

        <h1 className="text-3xl font-bold">
          {savedOnly ? "Saved Services" : "Find Trusted Professionals"}
        </h1>

        <p className="text-blue-100 mt-2">
          Discover and book professional services
          for your home and business.
        </p>

        <div className="flex items-center bg-white rounded-xl px-4 mt-6 text-slate-700">

          <Search size={22} />

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services, professionals or skills..."
            aria-label="Search marketplace"
            className="w-full p-4 outline-none bg-transparent"
          />

        </div>

      </div>

      {/* Advanced Filters */}

      <section className="bg-white border border-slate-200 shadow-sm rounded-3xl p-5 space-y-4">

        <div className="flex items-center justify-between gap-3">

          <h2 className="flex items-center gap-2 font-bold">
            <SlidersHorizontal size={20} />
            Search Filters
          </h2>

          <button
            onClick={resetFilters}
            className="text-sm font-semibold text-blue-600"
          >
            Clear Filters
          </button>

        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <label className="text-sm font-medium">
            Category

            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className={`${inputClass} mt-2`}
            >
              <option value="">All Categories</option>

              {categories.map(item => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium">
            City

            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className={`${inputClass} mt-2 capitalize`}
            >
              <option value="">All Cities</option>

              {cities.map(item => (
                <option
                  key={item}
                  value={item}
                  className="capitalize"
                >
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium">
            Service Area

            <div className="relative mt-2">

              <MapPin
                size={18}
                className="absolute left-3 top-3.5 text-slate-400"
              />

              <input
                value={area}
                onChange={e => setArea(e.target.value)}
                placeholder="Enter locality"
                className={`${inputClass} pl-10`}
              />

            </div>
          </label>

          <label className="text-sm font-medium">
            Provider Type

            <select
              value={providerType}
              onChange={e =>
                setProviderType(e.target.value)
              }
              className={`${inputClass} mt-2`}
            >
              <option value="">All Providers</option>
              <option value="individual">
                Individual Professional
              </option>
              <option value="business">
                Business
              </option>
            </select>
          </label>

          <label className="text-sm font-medium">
            Pricing Type

            <select
              value={pricingType}
              onChange={e =>
                setPricingType(e.target.value)
              }
              className={`${inputClass} mt-2`}
            >
              <option value="">All Pricing Types</option>
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly Rate</option>
              <option value="inspection">
                Inspection Fee
              </option>
            </select>
          </label>

          <label className="text-sm font-medium">
            Sort By

            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className={`${inputClass} mt-2`}
            >
              <option value="latest">
                Latest Services
              </option>
              <option value="price-low">
                Listed Price: Low to High
              </option>
              <option value="price-high">
                Listed Price: High to Low
              </option>
              <option value="experience">
                Most Experienced
              </option>
            </select>
          </label>

        </div>

      </section>

      {/* Messages */}

      {message && (
        <div
          role="status"
          className="bg-green-50 text-green-700 rounded-xl p-4"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="bg-red-50 text-red-700 rounded-xl p-4"
        >
          {error}

          <button
            onClick={loadData}
            className="underline ml-3 font-semibold"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Result Heading */}

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-bold">
            Available Services
          </h2>

          {!loading && !error && (
            <p className="text-sm text-slate-500 mt-1">
              {filteredServices.length} services found
            </p>
          )}
        </div>

        <button
          disabled={loading}
          onClick={loadData}
          aria-label="Refresh services"
          className="border rounded-xl p-3 bg-white"
        >
          <RefreshCw
            size={20}
            className={loading ? "animate-spin" : ""}
          />
        </button>

      </div>

      {/* Results */}

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

          {[1, 2, 3].map(item => (
            <div
              key={item}
              className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 animate-pulse space-y-5"
            >
              <div className="h-12 w-12 bg-slate-200 rounded-xl" />
              <div className="h-5 bg-slate-200 rounded" />
              <div className="h-20 bg-slate-100 rounded" />
              <div className="h-12 bg-slate-200 rounded" />
            </div>
          ))}

        </div>
      ) : !error && filteredServices.length === 0 ? (
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl py-16 px-6 text-center">

          <Briefcase
            size={50}
            className="mx-auto text-slate-300 mb-4"
          />

          <h3 className="text-xl font-semibold">
            No Services Found
          </h3>

          <p className="text-slate-500 mt-2">
            Try another category, location or search term.
          </p>

          <button
            onClick={resetFilters}
            className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-xl"
          >
            Reset Filters
          </button>

        </div>
      ) : !error && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {filteredServices.map(service => (
            <ServiceCard
              key={service.service_id}
              service={service}
              onProfile={setProfile}
              onDetails={setDetails}
              onBook={bookService}
              onFavoriteChange={savedOnly ? loadData : undefined}
            />
          ))}

        </div>
      )}

      {/* Provider Profile */}

      {profile && (
        <ProviderProfile
          provider={profile}
          services={services}
          onClose={() => setProfile(null)}
          onBook={bookService}
        />
      )}

      {/* Service Details */}

      {details && (
        <ServiceDetails
          service={details}
          onClose={() => setDetails(null)}
          onBook={bookService}
        />
      )}

      {/* Existing Booking Integration */}

      {selected && (
        <BookingForm
          service={selected}
          onClose={() => setSelected(null)}
          onBooked={() => {
            setSelected(null);

            setMessage(
              "Booking request submitted! Check My Bookings."
            );

            loadData();
          }}
        />
      )}

    </div>
  );
}