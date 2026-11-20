import { Download } from "lucide-react";
import { useState } from "react";

export default function InvoiceDownload({ invoice }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function downloadInvoice() {
    setBusy(true);
    setError("");

    try {
      const { jsPDF } = await import("jspdf");
      const { autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();

      function money(paise) {
        return "INR " + (Number(paise) / 100).toFixed(2);
      }

      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 43, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(27);
      doc.text("ServiceHub", 15, 19);

      doc.setFontSize(12);
      doc.text("Service Payment Receipt", 15, 30);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);

      doc.text(
        `Invoice: ${invoice.invoice_number}`,
        15,
        55
      );

      doc.text(
        `Date: ${new Date(invoice.issued_at).toLocaleDateString(
          "en-IN",
          { timeZone: "Asia/Kolkata" }
        )}`,
        15,
        63
      );

      doc.text(
        `Status: ${invoice.status.toUpperCase()}`,
        15,
        71
      );

      doc.text(
        `Booking ID: ${invoice.booking_id}`,
        15,
        79
      );

      autoTable(doc, {
        startY: 90,
        head: [
          ["Service", "Qty", "Unit Price", "Total"],
        ],
        body: (invoice.invoice_items || []).map((item) => [
          item.description,
          item.quantity,
          money(item.unit_price_paise),
          money(item.total_paise),
        ]),
        theme: "striped",
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
        },
      });

      let y = doc.lastAutoTable.finalY + 15;

      if (y > 245) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(16);

      doc.text(
        `Original amount: ${money(invoice.amount_paise)}`,
        195,
        y,
        { align: "right" }
      );

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);

      doc.text(
        "Thank you for choosing ServiceHub.",
        105,
        y + 18,
        { align: "center" }
      );

      doc.text(
        "Computer-generated payment receipt. Not a GST tax invoice.",
        105,
        y + 25,
        { align: "center" }
      );

      doc.save(`${invoice.invoice_number}.pdf`);

    } catch (err) {
      setError(err.message || "Unable to generate PDF");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={downloadInvoice}
        className="flex items-center justify-center gap-2
        w-full rounded-xl bg-blue-600 px-5 py-3
        text-white font-semibold hover:bg-blue-700
        disabled:opacity-50"
      >

        <Download size={18} />

        {busy ? "Generating PDF..." : "Download Invoice PDF"}

      </button>

    </div>
  );
}