import { useTranslation } from "react-i18next";
import type { Supplier, useSupplierStore } from "../stores/supplierStore";

interface Props {
  data: Supplier[];
  onEdit: (s: Supplier) => void;
}

export default function SupplierTable({ data, onEdit }: Props) {
  const { t } = useTranslation();
  const deleteSupplier = useSupplierStore((s) => s.deleteSupplier);

  if (data.length === 0)
    return <p className="text-gray-500">{t("noRecords")}</p>;

  return (
    <table className="w-full bg-white shadow rounded">
      <thead className="bg-slate-200 text-left text-sm">
        <tr>
          <th className="p-2">{t("companyName")}</th>
          <th className="p-2">{t("phone")}</th>
          <th className="p-2">{t("email")}</th>
          <th className="p-2 w-32">{t("actions")}</th>
        </tr>
      </thead>
      <tbody>
        {data.map((s) => (
          <tr key={s.id} className="border-t text-sm">
            <td className="p-2">{s.companyName}</td>
            <td className="p-2">{s.phone}</td>
            <td className="p-2">{s.email}</td>
            <td className="p-2 space-x-2">
              <button
                onClick={() => onEdit(s)}
                className="text-blue-600 hover:underline"
              >
                {t("edit")}
              </button>
              <button
                onClick={() => deleteSupplier(s.id)}
                className="text-red-600 hover:underline"
              >
                {t("delete")}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
