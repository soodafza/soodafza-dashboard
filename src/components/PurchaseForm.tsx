// src/components/PurchaseForm.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useProductStore } from "../stores/productStore";
import { usePurchaseStore, PurchaseItem } from "../stores/purchaseStore";

interface Props {
  onClose: () => void;
}

export default function PurchaseForm({ onClose }: Props) {
  const { t } = useTranslation();
  const addPurchase = usePurchaseStore((s) => s.addPurchase);
  const products = useProductStore((s) => s.products);

  // فرم اولیه
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<PurchaseItem[]>([
    { productId: "", productName: "", qty: 1, unitPrice: 0 },
  ]);
  const [err, setErr] = useState<string | null>(null);

  // افزودن ردیف آیتم جدید
  const addRow = () => {
    setItems([
      ...items,
      { productId: "", productName: "", qty: 1, unitPrice: 0 },
    ]);
  };

  // حذف ردیف
  const removeRow = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // تغییر یک فیلد در یک ردیف
  const updateItem =
    (idx: number, field: keyof PurchaseItem) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const v = e.target.value;
      setItems((prev) =>
        prev.map((it, i) => {
          if (i !== idx) return it;
          if (field === "productId") {
            const prod = products.find((p) => p.id === v);
            return {
              ...it,
              productId: v,
              productName: prod?.name || "",
              unitPrice: prod?.lastPurchasePrice || 0,
            };
          }
          if (field === "qty") {
            return { ...it, qty: Number(v) };
          }
          if (field === "unitPrice") {
            return { ...it, unitPrice: Number(v) };
          }
          return it;
        })
      );
    };

  // ارسال فرم
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier.trim()) {
      setErr(t("required"));
      return;
    }
    if (items.length === 0 || items.some((it) => !it.productId)) {
      setErr(t("invalid"));
      return;
    }
    addPurchase({
      supplierName: supplier,
      date,
      items,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <form
        onSubmit={submit}
        className="card w-[500px] max-w-full space-y-4 overflow-auto"
      >
        <h3 className="text-lg font-bold">{t("addPurchase")}</h3>

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <div>
          <label className="block mb-1 text-sm">{t("supplier")}</label>
          <input
            type="text"
            className="w-full"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder={t("supplier")}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">{t("date")}</label>
          <input
            type="date"
            className="w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm">{t("items")}</label>
          {items.map((it, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <div className="flex-1">
                <select
                  className="w-full"
                  value={it.productId}
                  onChange={updateItem(idx, "productId")}
                >
                  <option value="">{t("selectProduct")}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  className="w-20"
                  value={it.qty}
                  min={1}
                  onChange={updateItem(idx, "qty")}
                  placeholder={t("qty")}
                />
              </div>
              <div>
                <input
                  type="number"
                  className="w-24"
                  value={it.unitPrice}
                  min={0}
                  onChange={updateItem(idx, "unitPrice")}
                  placeholder={t("unitPrice")}
                />
              </div>
              <button
                type="button"
                className="text-red-600 underline text-sm"
                onClick={() => removeRow(idx)}
              >
                {t("remove")}
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="btn-primary text-sm"
          >
            + {t("addItem")}
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 rounded bg-gray-300"
          >
            {t("cancel")}
          </button>
          <button type="submit" className="btn-primary">
            {t("save")}
          </button>
        </div>
      </form>
    </div>
  );
}
