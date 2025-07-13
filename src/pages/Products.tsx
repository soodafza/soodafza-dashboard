import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useProductStore, Product } from "../stores/productStore";
import ProductTable from "../components/ProductTable";
import ProductForm from "../components/ProductForm";

export default function ProductsPage() {
  const { t } = useTranslation();
  const products = useProductStore((s) => s.products);
  const [q, setQ] = useState("");
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState<Product | null>(null);

  const list = useMemo(() => {
    if (!q.trim()) return products;
    const k = q.toLowerCase();
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(k) ||
        p.productNumber.toLowerCase().includes(k)
    );
  }, [products, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-2xl font-semibold">{t("products")}</h2>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search") + "..."}
          className="border p-2 rounded w-full sm:w-64"
        />

        <button
          onClick={() => {
            setEdit(null);
            setShow(true);
          }}
          className="px-4 py-2 rounded bg-emerald-600 text-white"
        >
          + {t("add")}
        </button>
      </div>

      <ProductTable
        data={list}
        onEdit={(p) => {
          setEdit(p);
          setShow(true);
        }}
      />

      {show && <ProductForm initial={edit} onClose={() => setShow(false)} />}
    </div>
  );
}
