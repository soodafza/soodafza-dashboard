import { useProductStore } from "../stores/productStore";

/* delta می‌تواند مثبت (خرید) یا منفی (فروش) باشد */
export function adjustStock(productId: string, delta: number) {
  const st = useProductStore.getState();
  const p  = st.products.find((x) => x.id === productId);
  if (p) st.updateProduct({ ...p, qtyInStock: p.qtyInStock + delta });
}
