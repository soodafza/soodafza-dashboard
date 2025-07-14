import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Supplier } from "../stores/supplierStore";
import { useSupplierStore } from "../stores/supplierStore";

type FormState = Omit<Supplier, "id" | "createdAt">;

interface Props {
  initial?: Supplier | null;
  onClose: () => void;
}

export default function SupplierForm({ initial, onClose }: Props) {
  const { t } = useTranslation();
  const addSupplier = useSupplierStore((s) => s.addSupplier);
  const updateSupplier = useSupplierStore((s) => s.updateSupplier);

  const [form, setForm] = useState<FormState>(
    initial ?? {
      companyName: "",
      phone: "",
      email: "",
      address: "",
      vatNumber: "",
    }
  );

  const [err, setErr] = useState<Partial<Record<keyof FormState, string>>>({});

  const check = () => {
    const e: typeof err = {};
    if (!form.companyName.trim()) e.companyName = t("required");
    if (!/^\d{8,15}$/.test(form.phone)) e.phone = t("invalidPhone");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = t("invalidEmail");
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!check()) return;
    initial ? updateSupplier({ ...initial, ...form }) : addSupplier(form);
    onClose();
  };

  const set = (k: keyof FormState) => (v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <form
        onSubmit={submit}
        className="bg-white p-6 rounded-xl w-[400px] space-y-4"
      >
        <h3 className="text-lg font-bold">
          {initial ? t("editSupplier") : t("addSupplier")}
        </h3>

        {(
          ["companyName", "phone", "email", "address", "vatNumber"] as const
        ).map((f) => (
          <div key={f}>
            <input
              value={form[f]}
              onChange={(e) => set(f)(e.target.value)}
              placeholder={t(f)}
              className={`w-full border p-2 rounded ${
                err[f] ? "border-red-500" : ""
              }`}
            />
            {err[f] && <p className="text-xs text-red-600">{err[f]}</p>}
          </div>
        ))}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 rounded bg-gray-300"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            className="px-4 py-1 rounded bg-emerald-600 text-white"
          >
            {t("save")}
          </button>
        </div>
      </form>
    </div>
  );
}
