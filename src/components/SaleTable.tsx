import { useTranslation } from "react-i18next";
import { Sale, useSaleStore } from "../stores/saleStore";

interface Props {
  data: Sale[];
  onEdit: (s: Sale) => void;
}

export default function SaleTable({ data, onEdit }: Props) {
  const { t } = useTranslation();
  const deleteSale = useSaleStore((s) => s.deleteSale);

  if (data.length === 0) return <p className="text-gray-500">{t("noRecords")}</p>;

  return (
    <table className="w-full bg-white shadow rounded">
      <thead className="bg-slate-200 text-left text-sm">
        <tr>
          <th className="p-2">{t("invoiceNumber")}</th>
          <th className="p-2">{t("customer")}</th>
          <th className="p-2">{t("date")}</th>
          <th className="p-2">{t("grossAmount")}</th>
          <th className="p-2 w-32">{t("actions")}</th>
        </tr>
      </thead>
      <tbody>
        {data.map((s) => (
          <tr key={s.id} className="border-t text-sm">
            <td className="p-2">{s.invoiceNumber}</td>
            <td className="p-2">{s.customerName}</td>
            <td className="p-2">{s.date}</td>
            <td className="p-2">{s.grossAmount.toLocaleString()}</td>
            <td className="p-2 space-x-2">
              <button onClick={() => onEdit(s)} className="text-blue-600 hover:underline">
                {t("edit")}
              </button>
              <button onClick={() => deleteSale(s.id)} className="text-red-600 hover:underline">
                {t("delete")}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
