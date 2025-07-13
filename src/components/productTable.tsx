import { useTranslation } from "react-i18next";
import { Product, useProductStore } from "../stores/productStore";

interface Props {
  data: Product[];
  onEdit: (p: Product) => void;
}

export default function ProductTable({ data, onEdit }: Props) {
  const { t } = useTranslation();
  const deleteProduct = useProductStore((s) => s.deleteProduct);

  if (data.length === 0)
    return <p className="text-gray-500">{t("noRecords")}</p>;

  return (
    <table className="w-full bg-white shadow rounded">
      <thead className="bg-slate-200 text-left text-sm">
        <tr>
          <th className="p-2">{t("productName")}</th>
          <th className="p-2">{t("productNumber")}</th>
          <th className="p-2">{t("qty")}</th>
          <th className="p-2 w-32">{t("actions")}</th>
        </tr>
      </thead>

      <tbody>
        {data.map((p) => {
          const low = p.qtyInStock < p.minPrice;
          return (
            <tr key={p.id} className={`border-t text-sm ${low ? "bg-red-50" : ""}`}>
              {/* نام محصول */}
              <td className="p-2">{p.productName}</td>

              {/* کد محصول */}
              <td className="p-2">{p.productNumber}</td>

              {/* موجودی + هشدار */}
              <td className="p-2">
                {p.qtyInStock}
                {low && (
                  <span className="ml-1 text-xs text-red-600">⚠</span>
                )}
              </td>

              {/* عملیات */}
              <td className="p-2 space-x-2">
                <button
                  onClick={() => onEdit(p)}
                  className="text-blue-600 hover:underline"
                >
                  {t("edit")}
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="text-red-600 hover:underline"
                >
                  {t("delete")}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
