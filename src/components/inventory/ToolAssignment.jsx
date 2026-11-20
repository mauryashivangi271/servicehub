import { useState, useRef } from "react";
import { Wrench, X, Undo2 } from "lucide-react";

import {
  assignTool,
  returnTool,
  formatDate,
} from "../../services/inventoryService";

export default function ToolAssignment({
  item,
  employees = [],
  assignments = [],
  onClose,
  onSaved,
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const locked = useRef(false);

  async function handleAssign(event) {
    event.preventDefault();

    if (locked.current) return;

    const qty = Number(quantity);

    if (
      !employeeId ||
      !Number.isInteger(qty) ||
      qty <= 0 ||
      qty > item.quantity
    ) {
      setError("Select an employee and valid quantity.");
      return;
    }

    locked.current = true;
    setBusy(true);
    setError("");

    try {
      await assignTool(item.id, employeeId, qty, notes);
      await onSaved?.();
    } catch (err) {
      setError(err.message || "Unable to assign tool.");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function handleReturn(assignment) {
    if (locked.current) return;

    if (!window.confirm("Confirm full return of these assigned tools?")) {
      return;
    }

    locked.current = true;
    setBusy(true);
    setError("");

    try {
      await returnTool(assignment.id);
      await onSaved?.();
    } catch (err) {
      setError(err.message || "Unable to return tool.");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border rounded-2xl p-5 space-y-5">

      <div className="flex justify-between items-center">

        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Wrench className="text-purple-600" />
          {item ? "Assign Tool" : "Employee Tool Assignments"}
        </h2>

        {item && (
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label="Close assignment form"
          >
            <X />
          </button>
        )}

      </div>

      {error && (
        <p role="alert" className="bg-red-50 text-red-700 p-3 rounded-xl">
          {error}
        </p>
      )}

      {item ? (
        <form onSubmit={handleAssign} className="space-y-4">

          <div className="bg-slate-50 rounded-xl p-4">

            <h3 className="font-bold">{item.name}</h3>

            <p className="text-sm text-slate-500">
              Available: {item.quantity} {item.unit}
            </p>

          </div>

          <label className="block text-sm font-medium space-y-2">
            Select Employee
            <select
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full border rounded-xl p-3"
            >
              <option value="">Choose employee</option>

              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name}
                </option>
              ))}

            </select>
          </label>

          {!employees.length && (
            <p className="text-sm text-orange-600">
              Add an active employee in Business Management first.
            </p>
          )}

          <label className="block text-sm font-medium space-y-2">
            Quantity
            <input
              type="number"
              required
              min="1"
              max={item.quantity}
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border rounded-xl p-3"
            />
          </label>

          <label className="block text-sm font-medium space-y-2">
            Assignment Notes
            <textarea
              rows={3}
              maxLength={1000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-xl p-3"
            />
          </label>

          <button
            type="submit"
            disabled={busy || !employees.length}
            className="bg-purple-600 text-white rounded-xl
            px-5 py-3 disabled:opacity-50"
          >
            {busy ? "Assigning..." : "Confirm Assignment"}
          </button>

        </form>
      ) : (
        <div className="space-y-3">

          {assignments.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              No tool assignments found.
            </div>
          )}

          {assignments.map((assignment) => (
            <article
              key={assignment.id}
              className="border rounded-xl p-4 space-y-3"
            >

              <div className="flex flex-wrap justify-between gap-3">

                <div>
                  <h3 className="font-bold">
                    {assignment.inventory_items?.name || "Tool"}
                  </h3>

                  <p className="text-sm text-slate-500">
                    Employee: {assignment.business_employees?.full_name ||
                    assignment.employee_id.slice(0, 8)}
                  </p>
                </div>

                <span className={`rounded-full px-3 py-1 h-fit
                  text-xs font-semibold ${
                    assignment.status === "assigned"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                  {assignment.status}
                </span>

              </div>

              <p className="text-sm">
                Quantity: {assignment.quantity}
              </p>

              <p className="text-xs text-slate-500">
                Assigned: {formatDate(assignment.assigned_at)}
              </p>

              {assignment.returned_at && (
                <p className="text-xs text-slate-500">
                  Returned: {formatDate(assignment.returned_at)}
                </p>
              )}

              {assignment.notes && (
                <p className="text-sm text-slate-600 break-words">
                  {assignment.notes}
                </p>
              )}

              {assignment.status === "assigned" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleReturn(assignment)}
                  className="flex items-center gap-2 bg-blue-50
                  text-blue-700 rounded-xl px-4 py-2 disabled:opacity-50"
                >
                  <Undo2 size={17} />
                  Return Tool
                </button>
              )}

            </article>
          ))}

        </div>
      )}

    </div>
  );
}