// src/stores/purchaseStore.ts
import { create } from "zustand";
import { nanoid } from "nanoid";
import { useProductStore, Product } from "./productStore";

export interface PurchaseItem {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
}

export interface Purchase {
  id: string;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
}

interface PurchaseState {
  purchases: Purchase[];
  addPurchase: (p: Omit<Purchase, "id">) => void;
}

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  purchases: [],
  addPurchase: (p) => {
    const newP: Purchase = { ...p, id: nanoid() };
    // 1) ذخیرهٔ خرید
    set((state) => ({ purchases: [...state.purchases, newP] }));
    // 2) به‌روزرسانی موجودی و آخرین خرید در productStore
    const prodStore = useProductStore.getState();
    p.items.forEach((it) => {
      const existing: Product | undefined = prodStore.products.find(
        (prod) => prod.id === it.productId
      );
      if (existing) {
        prodStore.updateProduct({
          ...existing,
          qtyInStock:       existing.qtyInStock + it.qty,
          lastPurchasePrice: it.unitPrice,
          lastPurchaseDate:  p.date,
          lastSupplier:      p.supplierName,
        });
      }
    });
  },
}));
