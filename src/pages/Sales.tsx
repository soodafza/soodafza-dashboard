// src/pages/SalesPage.tsx
import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSaleStore, Sale } from "../stores/saleStore";
import SaleForm from "../components/SaleForm";

export default function SalesPage() {
  const { t } = useTranslation();
  const sales = useSaleStore((s) => s.sales);
  const deleteSale = useSaleStore((s) => s.deleteSale);

  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      {/* عنوان و دکمهٔ افزودن */}
      <h2 className="text-2xl font-semibold flex justify-between">
        {t("sales")}
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          + {t("addSale")}
        </button>
      </h2>

      {/* جدول فروش‌ها */}
      <table className="table">
        <thead>
          <tr>
            <th className="p-2">#</th>
            <th className="p-2">{t("customer")}</th>
            <th className="p-2">{t("date")}</th>
            <th className="p-2">{t("grossAmount")}</th>
            <th className="p-2">{t("discount")}</th>
            <th className="p-2">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-4 text-gray-500">
                {t("noRecords")}
              </td>
            </tr>
          )}
          {sales.map((s: Sale) => {
            const gross = s.items.reduce(
              (sum, it) => sum + it.qty * it.unitPrice,
              0
            );
            const disc = s.items.reduce((sum, it) => sum + it.discount, 0);
            return (
              <tr key={s.id}>
                <td className="p-2">{s.invoiceNumber}</td>
                <td className="p-2">{s.customerName}</td>
                <td className="p-2">{s.date}</td>
                <td className="p-2">{gross.toLocaleString()}</td>
                <td className="p-2">{disc.toLocaleString()}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => deleteSale(s.id)}
                    className="text-red-600 underline"
                  >
                    {t("delete")}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* مدال افزودن فروش */}
      {showForm && <SaleForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
