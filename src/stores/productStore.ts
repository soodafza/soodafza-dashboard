import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";

export interface Product {
  id: string;
  productName: string;
  productNumber: string;
  tireDate: string;
  qtyInStock: number;
  lastPurchasePrice: number;
  minPrice: number;
  maxPrice: number;
  createdAt: string;
}

interface ProductState {
  products: Product[];
  addProduct: (p: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: [],
      addProduct: (data) =>
        set((s) => ({
          products: [
            ...s.products,
            { ...data, id: uuid(), createdAt: new Date().toISOString() }
          ]
        })),
      updateProduct: (prod) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === prod.id ? prod : p))
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }))
    }),
    { name: "product-storage" }
  )
);
