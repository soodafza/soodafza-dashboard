// src/pages/InventoryPage.tsx
import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useProductStore } from "../stores/productStore";
import { usePurchaseStore } from "../stores/purchaseStore";

import PurchaseForm from "../components/PurchaseForm";

export default function InventoryPage() {
  const { t } = useTranslation();
  const products  = useProductStore((s) => s.products);
  const purchases = usePurchaseStore((s) => s.purchases);

  // محاسبهٔ اطلاعات آخرین خرید برای هر محصول
  const lastInfo = useMemo(() => {
    const map = new Map<string, { date: string; supplier: string }>();
    purchases.forEach((p) => {
      p.items.forEach((it) => {
        const prev = map.get(it.productId);
        if (!prev || p.date > prev.date) {
          map.set(it.productId, {
            date:     p.date,
            supplier: p.supplierName,
          });
        }
      });
    });
    return map;
  }, [purchases]);

  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      {/* هدر و دکمهٔ افزودن خرید */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{t("inventory")}</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          + {t("addPurchase")}
        </button>
      </div>

      {/* جدول موجودی */}
      <table className="table">
        <thead>
          <tr>
            <th>{t("productName")}</th>
            <th>{t("qty")}</th>
            <th>{t("lastPurchasePrice")}</th>
            <th>{t("lastPurchaseDate")}</th>
            <th>{t("lastSupplier")}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const info = lastInfo.get(p.id);
            const lowStock = p.qtyInStock < p.minPrice;
            return (
              <tr key={p.id} className={lowStock ? "bg-red-50" : ""}>
                <td>{p.productName}</td>
                <td>{p.qtyInStock}</td>
                <td>{p.lastPurchasePrice}</td>
                <td>{info ? info.date : "-"}</td>
                <td>{info ? info.supplier : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* مدال فرم خرید */}
      {showForm && <PurchaseForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
