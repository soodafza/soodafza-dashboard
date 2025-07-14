import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import QrScanner from "react-qr-scanner";
import type { Sale } from "../stores/saleStore";
import { useSaleStore } from "../stores/saleStore";

type FS = Omit<Sale, "id" | "createdAt">;
interface Props {
  initial?: Sale | null;
  onClose: () => void;
}

export default function SaleForm({ initial, onClose }: Props) {
  const { t } = useTranslation();
  const addSale = useSaleStore((s) => s.addSale);
  const updateSale = useSaleStore((s) => s.updateSale);

  const [form, setForm] = useState<FS>(
    initial ?? {
      invoiceNumber: "",
      customerName: "",
      date: new Date().toISOString().slice(0, 10),
      grossAmount: 0,
      vat: 0,
      discount: 0,
      taxableAmount: 0,
    }
  );

  const [err, setErr] = useState<{ invoiceNumber?: string; customerName?: string }>({});
  const [scanQR, setScanQR] = useState(false);

  const setField = (k: keyof FS) => (v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.invoiceNumber.trim()) return setErr({ invoiceNumber: t("required") });
    if (!form.customerName.trim()) return setErr({ customerName: t("required") });

    const taxable = form.grossAmount - form.discount;
    const vatCalc = +(taxable * 0.09).toFixed(2);

    const data: Sale = {
      ...form,
      taxableAmount: taxable,
      vat: vatCalc,
      id: initial?.id ?? "",
      createdAt: initial?.createdAt ?? "",
    };

    initial ? updateSale(data) : addSale(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <form onSubmit={submit} className="bg-white p-6 rounded-xl w-[450px] space-y-4">
        <h3 className="text-lg font-bold">
          {initial ? t("editSale") : t("addSale")}
        </h3>

        <div>
          <input
            value={form.invoiceNumber}
            onChange={(e) => setField("invoiceNumber")(e.target.value)}
            placeholder={t("invoiceNumber")}
            className={`w-full border p-2 rounded ${err.invoiceNumber ? "border-red-500" : ""}`}
          />
          {err.invoiceNumber && <p className="text-xs text-red-600">{err.invoiceNumber}</p>}
        </div>

        <div>
          {scanQR ? (
            <>
              <QrScanner
                delay={300}
                style={{ width: "100%" }}
                onError={() => {}}
                onScan={(data) => {
                  const text = (data as any)?.text;
                  if (text) {
                    try {
                      const obj = JSON.parse(text);
                      setField("customerName")(obj.name);
                    } catch {}
                    setScanQR(false);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setScanQR(false)}
                className="underline text-sm"
              >
                {t("cancelScan")}
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <input
                value={form.customerName}
                onChange={(e) => setField("customerName")(e.target.value)}
                placeholder={t("customer")}
                className="flex-1 border p-2 rounded"
              />
              <button
                type="button"
                onClick={() => setScanQR(true)}
                className="btn-primary"
              >
                {t("scanQR")}
              </button>
            </div>
          )}
        </div>

        <input
          type="date"
          value={form.date}
          onChange={(e) => setField("date")(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder={t("grossAmount")}
          value={form.grossAmount}
          onChange={(e) => setField("grossAmount")(Number(e.target.value))}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder={t("discount")}
          value={form.discount}
          onChange={(e) => setField("discount")(Number(e.target.value))}
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
