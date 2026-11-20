import { useEffect, useState, useCallback } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Pencil,
  Clock,
  CheckCircle,
  PauseCircle,
  X,
  IndianRupee,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const emptyForm = {
  category_id: "",
  title: "",
  description: "",
  price: "",
  pricing_type: "fixed",
  duration_minutes: "60",
};

const pricingLabels = {
  fixed: "Fixed Price",
  hourly: "Hourly Rate",
  inspection: "Inspection Fee",
};

export default function ManageServices() {
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError("");

    try {
      const [categoryResult, serviceResult] =
        await Promise.all([
          supabase
            .from("service_categories")
            .select("*")
            .order("name"),

          supabase
            .from("worker_services")
            .select("*, service_categories(name, is_active)")
            .eq("worker_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

      if (categoryResult.error) {
        throw categoryResult.error;
      }

      if (serviceResult.error) {
        throw serviceResult.error;
      }

      setCategories(categoryResult.data || []);
      setServices(serviceResult.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function updateField(key, value) {
    setForm(previous => ({
      ...previous,
      [key]: value,
    }));
  }

  function openForm(service = null) {
    setEditingId(service?.id || null);

    setForm(
      service
        ? {
            category_id: service.category_id,
            title: service.title,
            description: service.description || "",
            price: String(service.price),
            pricing_type: service.pricing_type || "fixed",
            duration_minutes: String(
              service.duration_minutes || 60
            ),
          }
        : { ...emptyForm }
    );

    setError("");
    setMessage("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const amount = Number(form.price);
      const duration = Number(form.duration_minutes);

      if (!form.title.trim() || !form.category_id) {
        throw new Error("Complete all required fields.");
      }

      if (
        form.price === "" ||
        !Number.isFinite(amount) ||
        amount < 0 ||
        amount > 99999999.99
      ) {
        throw new Error("Enter a valid service price.");
      }

      if (
        !Number.isInteger(duration) ||
        duration < 15 ||
        duration > 1440
      ) {
        throw new Error(
          "Duration must be between 15 and 1440 minutes."
        );
      }

      const selectedCategory = categories.find(
        category => category.id === form.category_id
      );

      if (!selectedCategory?.is_active) {
        throw new Error("Please select an active category.");
      }

      const payload = {
        category_id: form.category_id,
        title: form.title.trim(),
        description: form.description.trim(),
        price: amount,
        pricing_type: form.pricing_type,
        duration_minutes: duration,
        updated_at: new Date().toISOString(),
      };

      const result = editingId
        ? await supabase
            .from("worker_services")
            .update(payload)
            .eq("id", editingId)
            .eq("worker_id", user.id)
            .select("id")
            .single()
        : await supabase
            .from("worker_services")
            .insert({
              ...payload,
              worker_id: user.id,
              is_active: true,
            })
            .select("id")
            .single();

      if (result.error) throw result.error;

      setMessage(
        editingId
          ? "Service updated successfully."
          : "Service added successfully."
      );

      closeForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleService(service) {
    const nextStatus = !service.is_active;

    if (
      nextStatus &&
      !service.service_categories?.is_active
    ) {
      setError(
        "This category is inactive. Edit the service and select an active category."
      );
      return;
    }

    if (
      !window.confirm(
        `Do you want to ${
          nextStatus ? "activate" : "deactivate"
        } this service?`
      )
    ) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase
        .from("worker_services")
        .update({
          is_active: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", service.id)
        .eq("worker_id", user.id)
        .select("id")
        .single();

      if (error) throw error;

      setMessage(
        nextStatus
          ? "Service activated successfully."
          : "Service deactivated successfully."
      );

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = [
      service.title,
      service.description,
      service.service_categories?.name,
    ].some(value =>
      String(value || "")
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    );

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && service.is_active) ||
      (filter === "inactive" && !service.is_active);

    return matchesSearch && matchesFilter;
  });

  const metrics = [
    {
      label: "Total Services",
      value: services.length,
      Icon: Briefcase,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Active Services",
      value: services.filter(s => s.is_active).length,
      Icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Inactive Services",
      value: services.filter(s => !s.is_active).length,
      Icon: PauseCircle,
      color: "bg-slate-100 text-slate-600",
    },
  ];

  const inputClass =
    "w-full mt-2 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500";

  function formatPrice(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(Number(value));
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-700 text-white rounded-2xl p-7">

        <Briefcase size={38} className="mb-4" />

        <h1 className="text-2xl font-bold">
          My Services
        </h1>

        <p className="text-blue-100 mt-2">
          Manage your professional services, pricing
          and availability status.
        </p>

      </div>

      {/* Statistics */}

      <div className="grid sm:grid-cols-3 gap-4">

        {metrics.map(({ label, value, Icon, color }) => (
          <div
            key={label}
            className="bg-white border border-slate-200 shadow-sm rounded-3xl p-5"
          >

            <div className={`w-fit p-3 rounded-xl ${color}`}>
              <Icon size={25} />
            </div>

            <p className="text-sm text-slate-500 mt-4">
              {label}
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {loading || error ? "—" : value}
            </h2>

          </div>
        ))}

      </div>

      {/* Service List */}

      <section className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6">

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

          <div>
            <h2 className="text-xl font-bold">
              Your Services
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Add and manage your service listings.
            </p>
          </div>

          <button
            disabled={saving || loading}
            onClick={() => openForm()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            <Plus size={19} />
            Add Service
          </button>

        </div>

        {/* Search and Filters */}

        <div className="flex flex-wrap gap-3 mb-6">

          <div className="flex flex-1 items-center gap-3 border rounded-xl px-4">

            <Search size={19} className="text-slate-400" />

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full py-3 outline-none"
              aria-label="Search services"
            />

          </div>

          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border rounded-xl px-4 py-3 bg-white"
            aria-label="Filter services by status"
          >
            <option value="all">All Services</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

        </div>

        {message && (
          <p
            role="status"
            className="bg-green-50 text-green-700 rounded-xl p-4 mb-5"
          >
            {message}
          </p>
        )}

        {error && !showForm && (
          <p
            role="alert"
            className="bg-red-50 text-red-700 rounded-xl p-4 mb-5"
          >
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-center p-10 text-slate-500">
            Loading services...
          </p>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16">

            <Briefcase
              size={48}
              className="mx-auto text-slate-300 mb-4"
            />

            <h3 className="font-semibold text-slate-700">
              No services found
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Add a new service or change your search filters.
            </p>

          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

            {filteredServices.map(service => (
              <div
                key={service.id}
                className="border border-slate-200 rounded-2xl p-5 space-y-4 hover:shadow-md transition-shadow flex flex-col"
              >

                <div className="flex justify-between items-start gap-3">

                  <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                    <Briefcase size={25} />
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      service.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {service.is_active ? "Active" : "Inactive"}
                  </span>

                </div>

                <div>

                  <p className="text-xs font-medium text-blue-600">
                    {service.service_categories?.name ||
                      "Uncategorized"}
                  </p>

                  <h3 className="text-lg font-bold mt-1">
                    {service.title}
                  </h3>

                </div>

                <p className="text-sm text-slate-500 whitespace-pre-wrap">
                  {service.description ||
                    "No description provided."}
                </p>

                <div className="flex items-center gap-2 text-blue-600">

                  <span className="text-2xl font-bold">
                    {formatPrice(service.price)}
                  </span>

                  {service.pricing_type === "hourly" && (
                    <span className="text-sm">/ hour</span>
                  )}

                </div>

                <div className="flex flex-wrap gap-3 text-xs text-slate-600">

                  <span className="flex items-center gap-1 bg-slate-50 rounded-lg px-3 py-2">
                    <Clock size={15} />
                    {service.duration_minutes || 60} mins
                  </span>

                  <span className="flex items-center gap-1 bg-slate-50 rounded-lg px-3 py-2">
                    <IndianRupee size={15} />

                    {pricingLabels[service.pricing_type] ||
                      "Fixed Price"}
                  </span>

                </div>

                {!service.service_categories?.is_active && (
                  <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg">
                    Category inactive. Customers cannot book
                    this service.
                  </p>
                )}

                <div className="flex gap-3 pt-4 border-t mt-auto">

                  <button
                    disabled={saving}
                    onClick={() => openForm(service)}
                    className="flex flex-1 justify-center items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-medium"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    disabled={saving}
                    onClick={() => toggleService(service)}
                    className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium ${
                      service.is_active
                        ? "bg-red-50 text-red-700"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    {service.is_active
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* Add/Edit Service Modal */}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">

          <form
            role="dialog"
            aria-modal="true"
            aria-label="Service details"
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl w-full max-w-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
          >

            <div className="flex justify-between items-center">

              <div>
                <h2 className="text-xl font-bold">
                  {editingId
                    ? "Edit Service"
                    : "Add New Service"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Enter your professional service information.
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={closeForm}
                aria-label="Close"
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={22} />
              </button>

            </div>

            <label className="block text-sm font-medium">

              Service Name *

              <input
                required
                disabled={saving}
                value={form.title}
                onChange={e =>
                  updateField("title", e.target.value)
                }
                placeholder="Enter service name"
                className={inputClass}
              />

            </label>

            <label className="block text-sm font-medium">

              Service Category *

              <select
                required
                disabled={saving}
                value={form.category_id}
                onChange={e =>
                  updateField("category_id", e.target.value)
                }
                className={inputClass}
              >

                <option value="">
                  Select Category
                </option>

                {categories
                  .filter(
                    category =>
                      category.is_active ||
                      category.id === form.category_id
                  )
                  .map(category => (
                    <option
                      key={category.id}
                      value={category.id}
                      disabled={!category.is_active}
                    >
                      {category.name}
                      {!category.is_active && " (Inactive)"}
                    </option>
                  ))}

              </select>

            </label>

            <div className="grid sm:grid-cols-2 gap-4">

              <label className="text-sm font-medium">

                Price (INR) *

                <input
                  required
                  disabled={saving}
                  type="number"
                  min="0"
                  max="99999999.99"
                  step="0.01"
                  value={form.price}
                  onChange={e =>
                    updateField("price", e.target.value)
                  }
                  placeholder="Enter price"
                  className={inputClass}
                />

              </label>

              <label className="text-sm font-medium">

                Pricing Type *

                <select
                  value={form.pricing_type}
                  disabled={saving}
                  onChange={e =>
                    updateField("pricing_type", e.target.value)
                  }
                  className={inputClass}
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                  <option value="inspection">
                    Inspection Fee
                  </option>
                </select>

              </label>

            </div>

            <label className="block text-sm font-medium">

              Estimated Duration (Minutes) *

              <input
                type="number"
                required
                disabled={saving}
                min="15"
                max="1440"
                step="1"
                value={form.duration_minutes}
                onChange={e =>
                  updateField(
                    "duration_minutes",
                    e.target.value
                  )
                }
                className={inputClass}
              />

            </label>

            <label className="block text-sm font-medium">

              Service Description

              <textarea
                rows={4}
                value={form.description}
                disabled={saving}
                onChange={e =>
                  updateField("description", e.target.value)
                }
                placeholder="Describe your service..."
                className={inputClass}
              />

            </label>

            {error && (
              <p
                role="alert"
                className="bg-red-50 text-red-700 p-3 rounded-xl"
              >
                {error}
              </p>
            )}

            <div className="flex gap-3">

              <button
                type="button"
                disabled={saving}
                onClick={closeForm}
                className="flex-1 border px-5 py-3 rounded-xl font-medium"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Service"
                  : "Save Service"}
              </button>

            </div>

          </form>

        </div>
      )}

    </div>
  );
}