import { useSaleStore } from "../stores/saleStore";

export function topProducts(n = 5) {
  const map = new Map<string, number>();

  useSaleStore
    .getState()
    .sales.forEach((s) => {
      const key = s.customerName ?? "unknown";
      map.set(key, (map.get(key) ?? 0) + s.grossAmount);
    });

  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

export function bottomProducts(n = 5) {
  return topProducts(999).reverse().slice(0, n);
}
