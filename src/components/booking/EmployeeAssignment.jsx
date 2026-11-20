import { useEffect, useState } from "react";
import { Users, UserCheck, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function EmployeeAssignment({
  booking,
  onAssigned,
}) {
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEmployees() {
      if (!user?.id) return;

      setLoading(true);
      setError("");

      try {
        const { data: business, error: businessError } =
          await supabase
            .from("businesses")
            .select("id")
            .eq("owner_id", user.id)
            .maybeSingle();

        if (businessError) throw businessError;

        if (!business) {
          throw new Error(
            "Please complete your business profile first."
          );
        }

        const { data, error: employeeError } =
          await supabase
            .from("business_employees")
            .select("id, full_name, designation, skills")
            .eq("business_id", business.id)
            .eq("is_active", true)
            .order("full_name");

        if (employeeError) throw employeeError;

        if (!cancelled) {
          setEmployees(data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEmployees();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function assignEmployee(e) {
    e.preventDefault();

    if (saving) return;

    setError("");
    setMessage("");

    if (!employeeId) {
      setError("Please select an employee.");
      return;
    }

    if (booking.status !== "accepted") {
      setError("Only accepted bookings can be assigned.");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.rpc(
        "assign_booking_employee",
        {
          p_booking_id: booking.id,
          p_employee_id: employeeId,
        }
      );

      if (error) throw error;

      setMessage("Employee assigned successfully!");

      if (onAssigned) {
        await onAssigned();
      }
    } catch (err) {
      setError(
        err.message || "Unable to assign employee."
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedEmployee = employees.find(
    employee => employee.id === employeeId
  );

  return (
    <section className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-4">

      <div className="flex items-center gap-3">

        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
          <Users size={24} />
        </div>

        <div>
          <h3 className="font-bold text-lg">
            Assign Employee
          </h3>

          <p className="text-sm text-slate-500">
            Select a professional for this service.
          </p>
        </div>

      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          Loading employees...
        </div>
      ) : (

        <form
          onSubmit={assignEmployee}
          className="space-y-4"
        >

          <label className="block text-sm font-medium">

            Select Employee

            <select
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              disabled={saving}
              className="mt-2 w-full border bg-white rounded-xl p-3"
              required
            >
              <option value="">
                Choose an employee
              </option>

              {employees.map(employee => (
                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.full_name} - {employee.designation}
                </option>
              ))}

            </select>

          </label>

          {!error && employees.length === 0 && (
            <p className="text-sm text-slate-500">
              No active employees available.
              Add employees in Business Management.
            </p>
          )}

          {selectedEmployee && (

            <div className="bg-white border rounded-xl p-4">

              <div className="flex items-center gap-3">

                <UserCheck
                  size={25}
                  className="text-indigo-600"
                />

                <div>
                  <h4 className="font-bold">
                    {selectedEmployee.full_name}
                  </h4>

                  <p className="text-sm text-slate-500">
                    {selectedEmployee.designation}
                  </p>
                </div>

              </div>

              <p className="text-sm mt-3">
                <b>Skills:</b> {selectedEmployee.skills}
              </p>

            </div>
          )}

          <button
            type="submit"
            disabled={
              saving ||
              !employeeId ||
              booking.status !== "accepted"
            }
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {saving
              ? "Assigning..."
              : "Assign Employee"}
          </button>

        </form>

      )}

      {error && (
        <p role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="text-green-700 text-sm">
          {message}
        </p>
      )}

    </section>
  );
}