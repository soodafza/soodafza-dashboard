import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";

export interface Supplier {
  id: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  vatNumber: string;
  createdAt: string;
}

interface SupplierState {
  suppliers: Supplier[];
  addSupplier: (s: Omit<Supplier, "id" | "createdAt">) => void;
  updateSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;
}

export const useSupplierStore = create<SupplierState>()(
  persist(
    (set) => ({
      suppliers: [],
      addSupplier: (data) =>
        set((st) => ({
          suppliers: [
            ...st.suppliers,
            { ...data, id: uuid(), createdAt: new Date().toISOString() }
          ]
        })),
      updateSupplier: (sup) =>
        set((st) => ({
          suppliers: st.suppliers.map((s) =>
            s.id === sup.id ? sup : s
          )
        })),
      deleteSupplier: (id) =>
        set((st) => ({
          suppliers: st.suppliers.filter((s) => s.id !== id)
        }))
    }),
    { name: "supplier-storage" }
  )
);
