import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSupplierStore, Supplier } from "../stores/supplierStore";
import SupplierTable from "../components/SupplierTable";
import SupplierForm from "../components/SupplierForm";

export default function SuppliersPage() {
  const { t } = useTranslation();
  const suppliers = useSupplierStore((s) => s.suppliers);
  const [q, setQ] = useState("");
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState<Supplier | null>(null);

  const list = useMemo(() => {
    if (!q.trim()) return suppliers;
    const k = q.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.companyName.toLowerCase().includes(k) ||
        s.phone.toLowerCase().includes(k) ||
        s.vatNumber.toLowerCase().includes(k)
    );
  }, [suppliers, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-2xl font-semibold">{t("suppliers")}</h2>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search") + "..."}
          className="border p-2 rounded w-full sm:w-64"
        />

        <button
          onClick={() => {
            setEdit(null);
            setShow(true);
          }}
          className="px-4 py-2 rounded bg-emerald-600 text-white"
        >
          + {t("add")}
        </button>
      </div>

      <SupplierTable
        data={list}
        onEdit={(s) => {
          setEdit(s);
          setShow(true);
        }}
      />

      {show && (
        <SupplierForm initial={edit} onClose={() => setShow(false)} />
      )}
    </div>
  );
}
