import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  vatNumber: string;
  createdAt: string;
}

interface CustomerState {
  customers: Customer[];
  addCustomer: (c: Omit<Customer, "id" | "createdAt">) => void;
  updateCustomer: (c: Customer) => void;
  deleteCustomer: (id: string) => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      customers: [],
      addCustomer: (data) =>
        set((s) => ({
          customers: [
            ...s.customers,
            { ...data, id: uuid(), createdAt: new Date().toISOString() },
          ],
        })),
      updateCustomer: (cust) =>
        set((s) => ({
          customers: s.customers.map((c) => (c.id === cust.id ? cust : c)),
        })),
      deleteCustomer: (id) =>
        set((s) => ({
          customers: s.customers.filter((c) => c.id !== id),
        })),
    }),
    { name: "customer-storage" } // ذخیره در LocalStorage
  )
);
