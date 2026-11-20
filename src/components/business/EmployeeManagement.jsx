import { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserCheck,
  UserMinus,
  Plus,
  Search,
  Pencil,
  X,
} from "lucide-react";

import {
  getEmployees,
  addEmployee,
  updateEmployee,
  changeEmployeeStatus,
} from "../../services/businessService";

const emptyForm = {
  full_name: "",
  phone: "",
  email: "",
  designation: "",
  skills: "",
};

export default function EmployeeManagement({ business }) {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setEmployees(await getEmployees(business.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [business.id]);

  useEffect(() => {
    load();
  }, [load]);

  function openForm(employee = null) {
    setEditing(employee?.id || null);

    setForm(
      employee
        ? {
            full_name: employee.full_name,
            phone: employee.phone,
            email: employee.email || "",
            designation: employee.designation,
            skills: employee.skills,
          }
        : { ...emptyForm }
    );

    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [
          key,
          value.trim(),
        ])
      );

      if (!/^[6-9]\d{9}$/.test(payload.phone)) {
        throw new Error("Enter a valid 10-digit mobile number.");
      }

      if (!payload.full_name || !payload.designation || !payload.skills) {
        throw new Error("Complete all required fields.");
      }

      if (editing) {
        await updateEmployee(editing, payload);
      } else {
        await addEmployee({
          ...payload,
          business_id: business.id,
        });
      }

      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(employee) {
    const action = employee.is_active ? "deactivate" : "activate";

    if (!window.confirm(`Do you want to ${action} this employee?`)) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await changeEmployeeStatus(
        employee.id,
        !employee.is_active
      );

      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const filtered = employees.filter(employee => {
    const matchesSearch = [
      employee.full_name,
      employee.phone,
      employee.designation,
      employee.skills,
    ].some(value =>
      String(value || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && employee.is_active) ||
      (filter === "inactive" && !employee.is_active);

    return matchesSearch && matchesFilter;
  });

  const metrics = [
    {
      title: "Total Employees",
      value: employees.length,
      Icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Active Employees",
      value: employees.filter(e => e.is_active).length,
      Icon: UserCheck,
      color: "text-green-600 bg-green-50",
    },
    {
      title: "Inactive Employees",
      value: employees.filter(e => !e.is_active).length,
      Icon: UserMinus,
      color: "text-slate-600 bg-slate-100",
    },
  ];

  return (
    <div className="space-y-6">

      <div className="grid sm:grid-cols-3 gap-4">
        {metrics.map(({ title, value, Icon, color }) => (
          <div
            key={title}
            className="bg-white border rounded-2xl p-5"
          >
            <div className={`w-fit p-3 rounded-xl ${color}`}>
              <Icon size={24} />
            </div>

            <p className="text-sm text-slate-500 mt-4">
              {title}
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {loading || error ? "—" : value}
            </h2>
          </div>
        ))}
      </div>

      <section className="bg-white border rounded-2xl overflow-hidden">

        <div className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">
              Employee Management
            </h2>

            <p className="text-sm text-slate-500">
              Manage your professional team.
            </p>
          </div>

          <button
            disabled={saving}
            onClick={() => openForm()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold"
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>

        <div className="px-5 pb-5 flex flex-wrap gap-3">

          <div className="flex flex-1 items-center gap-3 border rounded-xl px-4">
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="w-full py-3 outline-none"
            />
          </div>

          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border rounded-xl px-4 py-3 bg-white"
          >
            <option value="all">All Employees</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {error && !showForm && (
          <p role="alert" className="mx-5 mb-5 bg-red-50 text-red-700 p-3 rounded-xl">
            {error}
          </p>
        )}

        {loading ? (
          <p className="p-10 text-center text-slate-500">
            Loading employees...
          </p>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Users size={44} className="mx-auto mb-4 text-slate-300" />
            <h3 className="font-semibold text-slate-700">
              No employees found
            </h3>
            <p className="text-sm mt-2">
              Add employees or change your search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm text-left">

              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {[
                    "Employee",
                    "Designation",
                    "Skills",
                    "Phone",
                    "Status",
                    "Actions",
                  ].map(label => (
                    <th key={label} className="p-4 whitespace-nowrap">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map(employee => (
                  <tr key={employee.id} className="border-t hover:bg-slate-50">

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          {employee.full_name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold">
                            {employee.full_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">{employee.designation}</td>
                    <td className="p-4">{employee.skills}</td>
                    <td className="p-4">{employee.phone}</td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          employee.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {employee.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">

                        <button
                          disabled={saving}
                          onClick={() => openForm(employee)}
                          className="text-blue-600"
                          aria-label={`Edit ${employee.full_name}`}
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          disabled={saving}
                          onClick={() => toggleStatus(employee)}
                          className={`text-xs font-semibold ${
                            employee.is_active
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {employee.is_active ? "Deactivate" : "Activate"}
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
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">

          <form
            role="dialog"
            aria-modal="true"
            aria-label="Employee details"
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl w-full max-w-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
          >

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editing ? "Edit Employee" : "Add New Employee"}
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

            {[
              ["full_name", "Full Name", "text", true],
              ["phone", "Mobile Number", "tel", true],
              ["email", "Email Address", "email", false],
              ["designation", "Designation", "text", true],
              ["skills", "Professional Skills", "text", true],
            ].map(([key, label, type, required]) => (
              <label key={key} className="block text-sm font-medium">
                {label}
                {required && " *"}

                <input
                  type={type}
                  required={required}
                  disabled={saving}
                  value={form[key]}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  className="w-full mt-2 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            ))}

            {error && (
              <p role="alert" className="bg-red-50 text-red-700 p-3 rounded-xl">
                {error}
              </p>
            )}

            <button
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editing
                ? "Update Employee"
                : "Add Employee"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}