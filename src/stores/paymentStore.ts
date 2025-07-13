import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";

export interface Payment {
  id: string;
  saleId: string;         // فاکتور مربوطه
  date: string;           // YYYY-MM-DD
  amount: number;
}

interface PaymentState {
  payments: Payment[];
  addPayment: (p: Omit<Payment, "id">) => void;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      payments: [],
      addPayment: (p) =>
        set((st) => ({
          payments: [...st.payments, { ...p, id: uuid() }]
        }))
    }),
    { name: "payments-storage" }
  )
);
