import { useTranslation } from "react-i18next";
import type { Customer, useCustomerStore } from "../stores/customerStore";

interface Props {
  data: Customer[];                 // لیست فیلتر‌شده/کامل از بیرون می‌آید
  onEdit: (c: Customer) => void;    // فراخوان ویرایش
}

export default function CustomerTable({ data, onEdit }: Props) {
  const { t } = useTranslation();
  const deleteCustomer = useCustomerStore((s) => s.deleteCustomer);

  if (data.length === 0)
    return (
      <p className="text-gray-500">
        {t("noRecords") /* ← کلید ترجمه برای «هیچ رکوردی یافت نشد» */}
      </p>
    );

  return (
    <table className="w-full bg-white shadow rounded">
      <thead className="bg-slate-200 text-left text-sm">
        <tr>
          <th className="p-2">{t("fullName")}</th>
          <th className="p-2">{t("phone")}</th>
          <th className="p-2">{t("email")}</th>
          <th className="p-2 w-32">{t("actions")}</th>
        </tr>
      </thead>

      <tbody>
        {data.map((c) => (
          <tr key={c.id} className="border-t text-sm">
            <td className="p-2">{c.fullName}</td>
            <td className="p-2">{c.phone}</td>
            <td className="p-2">{c.email}</td>

            <td className="p-2 space-x-2">
              <button
                onClick={() => onEdit(c)}
                className="text-blue-600 hover:underline"
              >
                {t("edit")}
              </button>

              <button
                onClick={() => deleteCustomer(c.id)}
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
