import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import { adjustStock } from "../utils/stock";

/* ـــــــــــ Types ـــــــــــ */

export interface SaleItem {
  id: string;
  productId: string;
  qty: number;
  unitPrice: number;
  discount: number;
}

export interface Sale {
  id: string;
  team: string;              // شعبه یا تیم فروش
  invoiceNumber: string;
  customerName: string;
  date: string;              // YYYY-MM-DD
  items: SaleItem[];
  note: string;
  createdAt: string;
}

interface SaleState {
  sales: Sale[];
  addSale: (s: Omit<Sale, "id" | "createdAt">) => void;
  updateSale: (s: Sale) => void;
  deleteSale: (id: string) => void;
}

/* ـــــــــــ Helper: اختلاف موجودی بین دو آرایه ردیف ـــــــــــ */
function diffStock(oldItems: SaleItem[], newItems: SaleItem[]) {
  const map = new Map<string, number>();

  oldItems.forEach((it) =>
    map.set(it.productId, (map.get(it.productId) ?? 0) + it.qty)
  ); // + قدیمی

  newItems.forEach((it) =>
    map.set(it.productId, (map.get(it.productId) ?? 0) - it.qty)
  ); // - جدید

  return map; // مقدار نهایی: مثبت یعنی باید موجودی ↑، منفی یعنی ↓
}

/* ـــــــــــ Store ـــــــــــ */

export const useSaleStore = create<SaleState>()(
  persist(
    (set) => ({
      sales: [],

      /* افزودن */
      addSale: (data) =>
        set((st) => {
          data.items.forEach((it) => adjustStock(it.productId, -it.qty));
          const sale: Sale = {
            ...data,
            id: uuid(),
            createdAt: new Date().toISOString()
          };
          return { sales: [...st.sales, sale] };
        }),

      /* ویرایش */
      updateSale: (sale) =>
        set((st) => {
          const idx = st.sales.findIndex((s) => s.id === sale.id);
          if (idx === -1) return st;

          /* برگشت موجودی قدیم + کم کردن جدید */
          const delta = diffStock(st.sales[idx].items, sale.items);
          delta.forEach((d, pid) => adjustStock(pid, d));

          const arr = [...st.sales];
          arr[idx] = sale;
          return { sales: arr };
        }),

      /* حذف */
      deleteSale: (id) =>
        set((st) => {
          const sale = st.sales.find((s) => s.id === id);
          if (sale)
            sale.items.forEach((it) =>
              adjustStock(it.productId, it.qty) // برگرداندن موجودی
            );
          return { sales: st.sales.filter((s) => s.id !== id) };
        })
    }),
    { name: "sales-storage" }
  )
);
