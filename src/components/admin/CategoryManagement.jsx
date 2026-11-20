import { useEffect, useState } from "react";
import { Layers, Plus, Pencil, Search, X } from "lucide-react";
import { supabase } from "../../lib/supabase";

const emptyForm = {
  name: "",
  description: "",
};

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("name");

      if (error) throw error;

      setCategories(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openForm(category = null) {
    setEditing(category?.id || null);

    setForm({
      name: category?.name || "",
      description: category?.description || "",
    });

    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
      };

      if (!payload.name) {
        throw new Error("Category name is required.");
      }

      const query = supabase.from("service_categories");

      const { error } = await (
        editing
          ? query.update(payload).eq("id", editing)
          : query.insert(payload)
      ).select().single();

      if (error) throw error;

      setShowForm(false);
      await loadCategories();
    } catch (err) {
      setError(
        err.code === "23505"
          ? "This category already exists."
          : err.message
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(category) {
    if (!window.confirm("Change this category's status?")) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const { error } = await supabase
        .from("service_categories")
        .update({
          is_active: !category.is_active,
        })
        .eq("id", category.id)
        .select()
        .single();

      if (error) throw error;

      await loadCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const filtered = categories.filter(category =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-7 text-white">
        <Layers size={36} className="mb-4" />

        <h1 className="text-2xl font-bold">
          Category Management
        </h1>

        <p className="mt-2 text-blue-100">
          Manage all ServiceHub service categories.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          ["Total Categories", categories.length],
          [
            "Active Categories",
            categories.filter(c => c.is_active).length,
          ],
          [
            "Inactive Categories",
            categories.filter(c => !c.is_active).length,
          ],
        ].map(([label, count]) => (
          <div
            key={label}
            className="bg-white border rounded-2xl p-5"
          >
            <p className="text-sm text-slate-500">
              {label}
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {loading || error ? "—" : count}
            </h2>
          </div>
        ))}
      </div>

      <section className="bg-white border rounded-2xl p-6">

        <div className="flex flex-wrap justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold">
            Service Categories
          </h2>

          <button
            disabled={saving}
            onClick={() => openForm()}
            className="flex items-center gap-2 bg-blue-600 text-white rounded-xl px-5 py-3"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>

        <div className="flex items-center gap-3 border rounded-xl px-4 mb-6">

          <Search size={18} className="text-slate-400" />

          <input
            placeholder="Search categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full py-3 outline-none"
          />
        </div>

        {error && !showForm && (
          <p role="alert" className="bg-red-50 text-red-700 p-3 rounded-xl mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <p className="p-8 text-center">
            Loading categories...
          </p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-slate-500">
            No categories found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">

              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4">Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(category => (
                  <tr key={category.id} className="border-t">

                    <td className="p-4 font-semibold">
                      {category.name}
                    </td>

                    <td className="p-4 text-slate-500">
                      {category.description}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          category.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {category.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-4">

                        <button
                          disabled={saving}
                          onClick={() => openForm(category)}
                          className="text-blue-600"
                          aria-label={`Edit ${category.name}`}
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          disabled={saving}
                          onClick={() => toggleStatus(category)}
                          className="text-sm font-medium text-slate-600"
                        >
                          {category.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

          <form
            role="dialog"
            aria-modal="true"
            aria-label="Category details"
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-5"
          >

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editing ? "Edit Category" : "Add Category"}
              </h2>

              <button
                type="button"
                disabled={saving}
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                <X />
              </button>
            </div>

            <label className="block text-sm font-medium">
              Category Name *
              <input
                required
                disabled={saving}
                value={form.name}
                onChange={e =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3 mt-2"
              />
            </label>

            <label className="block text-sm font-medium">
              Description
              <textarea
                rows={4}
                disabled={saving}
                value={form.description}
                onChange={e =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3 mt-2"
              />
            </label>

            {error && (
              <p role="alert" className="bg-red-50 text-red-700 p-3 rounded-xl">
                {error}
              </p>
            )}

            <button
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Category"}
            </button>

          </form>
        </div>
      )}

    </div>
  );
}