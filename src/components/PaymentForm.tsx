import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePaymentStore } from "../stores/paymentStore";

interface Props { saleId: string; onClose: () => void; }

export default function PaymentForm({ saleId, onClose }: Props) {
  const { t } = useTranslation();
  const addPayment = usePaymentStore((s) => s.addPayment);
  const [amount, setAmt] = useState(0);

  const save = () => {
    if (amount > 0) {
      addPayment({ saleId, date: new Date().toISOString().slice(0, 10), amount });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded">
        <h3 className="font-bold mb-2">{t("addPayment")}</h3>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmt(Number(e.target.value))}
          className="border p-2 w-40 mb-3"
          placeholder={t("amount")}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-300 px-3 py-1 rounded">{t("cancel")}</button>
          <button onClick={save} className="bg-emerald-600 text-white px-3 py-1 rounded">{t("save")}</button>
        </div>
      </div>
    </div>
  );
}
