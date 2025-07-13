import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Customer, useCustomerStore } from "../stores/customerStore";

type FormState = Omit<Customer, "id" | "createdAt">;

interface Props {
  initial?: Customer | null;
  onClose: () => void;
}

export default function CustomerForm({ initial, onClose }: Props) {
  const { t } = useTranslation();
  const addCustomer    = useCustomerStore((s) => s.addCustomer);
  const updateCustomer = useCustomerStore((s) => s.updateCustomer);

  const [form, setForm] = useState<FormState>(
    initial ?? { fullName: "", phone: "", email: "", address: "", vatNumber: "" }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormState,string>>>({});

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.fullName.trim())        e.fullName = t("required");
    if (!/^\d{8,15}$/.test(form.phone)) e.phone   = t("invalidPhone");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = t("invalidEmail");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (initial) updateCustomer({ ...initial, ...form });
    else         addCustomer(form);
    onClose();
  }

  const set = (k: keyof FormState) => (v: string) =>
    setForm({ ...form, [k]: v });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl w-[400px] space-y-4"
      >
        <h3 className="text-lg font-bold">
          {initial ? t("editCustomer") : t("addCustomer")}
        </h3>

        {(["fullName","phone","email","address","vatNumber"] as const).map((f) => (
          <div key={f}>
            <input
              value={form[f]}
              onChange={(e) => set(f)(e.target.value)}
              placeholder={t(f)}
              className={`w-full border p-2 rounded ${errors[f] ? "border-red-500" : ""}`}
            />
            {errors[f] && <p className="text-xs text-red-600">{errors[f]}</p>}
          </div>
        ))}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose}
            className="px-4 py-1 rounded bg-gray-300">
            {t("cancel")}
          </button>
          <button type="submit"
            className="px-4 py-1 rounded bg-emerald-600 text-white">
            {t("save")}
          </button>
        </div>
      </form>
    </div>
  );
}
