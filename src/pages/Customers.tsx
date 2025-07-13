import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCustomerStore, Customer } from "../stores/customerStore";
import CustomerQRCode from "../components/CustomerQRCode";

export default function CustomersPage() {
  const { t } = useTranslation();
  const customers = useCustomerStore(s => s.customers);
  const [qrFor, setQrFor] = useState<Customer | null>(null);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">{t("customers")}</h2>
      <table className="w-full bg-white shadow rounded text-sm">
        <thead className="bg-slate-200 text-left">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2">{t("fullName")}</th>
            <th className="p-2">{t("phone")}</th>
            <th className="p-2">{t("email")}</th>
            <th className="p-2">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id}>
              <td className="p-2">{c.id}</td>
              <td className="p-2">{c.fullName}</td>
              <td className="p-2">{c.phone}</td>
              <td className="p-2">{c.email}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => setQrFor(c)}
                  className="text-blue-600 underline"
                >
                  {t("printQRCode")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {qrFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded space-y-4">
            <h3 className="text-lg font-semibold">{t("customerQR")}</h3>
            <CustomerQRCode
              customerId={qrFor.id}
              customerName={qrFor.fullName}
            />
            <button
              onClick={() => setQrFor(null)}
              className="btn-primary"
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
