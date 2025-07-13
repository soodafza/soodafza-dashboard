import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Product, useProductStore } from "../stores/productStore";

type FormState = Omit<Product, "id" | "createdAt" | "qtyInStock">;

interface Props {
  initial?: Product | null;
  onClose: () => void;
}

export default function ProductForm({ initial, onClose }: Props) {
  const { t } = useTranslation();
  const addProduct = useProductStore((s) => s.addProduct);
  const updateProduct = useProductStore((s) => s.updateProduct);

  const [qty, setQty] = useState(initial?.qtyInStock ?? 0);
  const [form, setForm] = useState<FormState>(
    initial ?? {
      productName: "",
      productNumber: "",
      tireDate: "",
      lastPurchasePrice: 0,
      minPrice: 0,
      maxPrice: 0
    }
  );
  const [err, setErr] = useState<{ productName?: string }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim()) {
      setErr({ productName: t("required") });
      return;
    }
    const data: Product = {
      ...form,
      qtyInStock: qty,
      id: initial?.id ?? "",
      createdAt: initial?.createdAt ?? ""
    };
    initial ? updateProduct(data) : addProduct(data);
    onClose();
  };

  const set = (k: keyof FormState) => (v: string | number) =>
    setForm({ ...form, [k]: v });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <form onSubmit={submit} className="bg-white p-6 rounded-xl w-[450px] space-y-4">
        <h3 className="text-lg font-bold">
          {initial ? t("editProduct") : t("addProduct")}
        </h3>

        <div>
          <input
            value={form.productName}
            onChange={(e) => set("productName")(e.target.value)}
            placeholder={t("productName")}
            className={`w-full border p-2 rounded ${err.productName ? "border-red-500" : ""}`}
          />
          {err.productName && <p className="text-xs text-red-600">{err.productName}</p>}
        </div>

        <input
          value={form.productNumber}
          onChange={(e) => set("productNumber")(e.target.value)}
          placeholder={t("productNumber")}
          className="w-full border p-2 rounded"
        />

        <input
          value={form.tireDate}
          onChange={(e) => set("tireDate")(e.target.value)}
          placeholder={t("tireDate")}
          className="w-full border p-2 rounded"
        />

        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            value={form.lastPurchasePrice}
            onChange={(e) => set("lastPurchasePrice")(Number(e.target.value))}
            placeholder={t("lastPurchasePrice")}
            className="border p-2 rounded"
          />
          <input
            type="number"
            value={form.minPrice}
            onChange={(e) => set("minPrice")(Number(e.target.value))}
            placeholder={t("minPrice")}
            className="border p-2 rounded"
          />
          <input
            type="number"
            value={form.maxPrice}
            onChange={(e) => set("maxPrice")(Number(e.target.value))}
            placeholder={t("maxPrice")}
            className="border p-2 rounded"
          />
        </div>

        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          placeholder={t("qty")}
          className="w-full border p-2 rounded"
        />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-1 rounded bg-gray-300">
            {t("cancel")}
          </button>
          <button type="submit" className="px-4 py-1 rounded bg-emerald-600 text-white">
            {t("save")}
          </button>
        </div>
      </form>
    </div>
  );
}
