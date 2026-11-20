import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  Package,
  Plus,
  RefreshCw,
  History,
  Wrench,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getBusiness,
  getInventory,
  getEmployees,
  getStockHistory,
  getAssignments,
  setInventoryStatus,
} from "../../services/inventoryService";

import InventorySummary from "./InventorySummary";
import InventoryForm from "./InventoryForm";
import InventoryList from "./InventoryList";
import StockMovement from "./StockMovement";
import StockHistory from "./StockHistory";
import ToolAssignment from "./ToolAssignment";

export default function InventoryDashboard() {
  const { user, role } = useAuth();

  const [business, setBusiness] = useState(null);
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [movements, setMovements] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [tab, setTab] = useState("items");
  const [panel, setPanel] = useState(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const locked = useRef(false);
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    if (!user?.id || role !== "worker") return;

    const requestId = ++requestRef.current;

    try {
      const businessData = await getBusiness(user.id);

      if (requestId !== requestRef.current) return;

      setBusiness(businessData);

      if (!businessData) {
        setItems([]);
        setEmployees([]);
        setMovements([]);
        setAssignments([]);
        setError("");
        return;
      }

      const [
        itemData,
        employeeData,
        movementData,
        assignmentData,
      ] = await Promise.all([
        getInventory(businessData.id),
        getEmployees(businessData.id),
        getStockHistory(businessData.id),
        getAssignments(businessData.id),
      ]);

      if (requestId !== requestRef.current) return;

      setItems(itemData || []);
      setEmployees(employeeData || []);
      setMovements(movementData || []);
      setAssignments(assignmentData || []);
      setError("");

    } catch (err) {
      if (requestId === requestRef.current) {
        setError(err.message || "Unable to load inventory.");
      }
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id, role]);

  useEffect(() => {
    setLoading(true);
    setBusiness(null);
    setItems([]);
    setEmployees([]);
    setMovements([]);
    setAssignments([]);
    setPanel(null);
    setError("");
    setMessage("");

    if (!user?.id || role !== "worker") {
      setLoading(false);
      return;
    }

    load();

    return () => {
      requestRef.current++;
    };
  }, [load, user?.id, role]);

  function openPanel(value) {
    setMessage("");
    setPanel(value);
    setTab("items");
  }

  async function handleSaved() {
    setPanel(null);
    setMessage("Inventory operation completed successfully.");
    await load();
  }

  async function handleToggle(item) {
    if (locked.current) return;

    if (
      !window.confirm(
        `${item.is_active ? "Deactivate" : "Activate"} ${item.name}?`
      )
    ) {
      return;
    }

    locked.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await setInventoryStatus(item.id, !item.is_active);

      setMessage("Item status updated successfully.");
      await load();

    } catch (err) {
      setError(err.message || "Unable to update item status.");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  if (role !== "worker") {
    return <p>Business provider access required.</p>;
  }

  if (loading) {
    return (
      <div className="bg-white border rounded-2xl p-12 text-center">
        Loading inventory...
      </div>
    );
  }

  if (!business) {
    return (
      <div className="bg-white border rounded-2xl p-10 text-center">

        <Package size={45} className="mx-auto text-slate-300" />

        <h2 className="font-bold text-xl mt-4">
          Business Inventory
        </h2>

        <p className="text-slate-500 mt-2">
          {error || "Create your business profile to access inventory."}
        </p>

        <button
          onClick={load}
          className="mt-4 text-blue-600 underline"
        >
          Retry
        </button>

      </div>
    );
  }

  const tabs = [
    { id: "items", label: "Inventory Items", icon: Package },
    { id: "history", label: "Stock History", icon: History },
    { id: "assignments", label: "Tool Assignments", icon: Wrench },
  ];

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap justify-between items-center gap-4">

        <div>
          <h1 className="text-2xl font-bold">
            Inventory Management
          </h1>

          <p className="text-slate-500 mt-1">
            Manage tools, materials, equipment and employee assignments.
          </p>

          <p className="text-sm text-blue-600 font-medium mt-1">
            {business.business_name}
          </p>
        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={load}
            aria-label="Refresh inventory"
            className="border bg-white rounded-xl p-3"
          >
            <RefreshCw size={20} />
          </button>

          <button
            type="button"
            disabled={busy || !!panel}
            onClick={() => openPanel({ type: "add" })}
            className="flex items-center gap-2 bg-blue-600
              text-white rounded-xl px-4 py-3 disabled:opacity-50"
          >
            <Plus size={20} /> Add Item
          </button>

        </div>

      </div>

      {error && (
        <div role="alert" className="bg-red-50 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      {message && (
        <div role="status" className="bg-green-50 text-green-700 p-4 rounded-xl">
          {message}
        </div>
      )}

      <InventorySummary
        items={items}
        assignments={assignments}
      />

      {panel && (
        <div className="space-y-4">

          {["add", "edit"].includes(panel.type) && (
            <InventoryForm
              key={panel.item?.id || "new-item"}
              businessId={business.id}
              item={panel.item}
              onClose={() => setPanel(null)}
              onSaved={handleSaved}
            />
          )}

          {panel.type === "stock" && (
            <StockMovement
              key={`${panel.item.id}-${panel.movementType}`}
              item={panel.item}
              type={panel.movementType}
              onClose={() => setPanel(null)}
              onSaved={handleSaved}
            />
          )}

          {panel.type === "assign" && (
            <ToolAssignment
              key={panel.item.id}
              item={panel.item}
              employees={employees}
              onClose={() => setPanel(null)}
              onSaved={handleSaved}
            />
          )}

        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b pb-3">

        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            disabled={!!panel}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3
              rounded-xl font-medium text-sm disabled:opacity-50 ${
                tab === id
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-slate-600"
              }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}

      </div>

      {tab === "items" && (
        <InventoryList
          items={items}
          busy={busy || !!panel}
          onEdit={(item) =>
            openPanel({ type: "edit", item })
          }
          onStock={(item, movementType) =>
            openPanel({ type: "stock", item, movementType })
          }
          onAssign={(item) =>
            openPanel({ type: "assign", item })
          }
          onToggle={handleToggle}
        />
      )}

      {tab === "history" && (
        <StockHistory movements={movements} />
      )}

      {tab === "assignments" && (
        <ToolAssignment
          assignments={assignments}
          onSaved={handleSaved}
        />
      )}

    </div>
  );
}