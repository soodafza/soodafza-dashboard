// src/pages/ReportsPage.tsx
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { format, startOfWeek } from "date-fns";

import { useCustomerStore } from "../stores/customerStore";
import { useSupplierStore } from "../stores/supplierStore";
import { useProductStore } from "../stores/productStore";
import { useSaleStore } from "../stores/saleStore";

import ReportCard from "../components/ReportCard";

type Range = "day" | "week" | "month" | "year";
const bucket = (dateStr: string, range: Range) => {
  const d = new Date(dateStr);
  switch (range) {
    case "day":
      return format(d, "yyyy-MM-dd");
    case "week":
      return format(startOfWeek(d, { weekStartsOn: 6 }), "yyyy-'W'II");
    case "month":
      return format(d, "yyyy-MM");
    case "year":
      return format(d, "yyyy");
  }
};

export default function ReportsPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState<Range>("month");

  // تعیین کلید ترجمهٔ عنوان بر اساس بازه
  const periodKey = useMemo(() => {
    switch (range) {
      case "day":
        return "dailySales";
      case "week":
        return "weeklySales";
      case "year":
        return "yearlySales";
      default:
        return "monthlySales";
    }
  }, [range]);

  // داده‌های خام
  const customers = useCustomerStore((s) => s.customers);
  const suppliers = useSupplierStore((s) => s.suppliers);
  const products  = useProductStore((s) => s.products);
  const sales     = useSaleStore((s) => s.sales);

  // دادهٔ نمودار
  const chartData = useMemo(() => {
    const m = new Map<string, number>();
    sales.forEach((s) =>
      s.items.forEach((it) => {
        const key = bucket(s.date, range);
        const amount = it.qty * it.unitPrice - it.discount;
        m.set(key, (m.get(key) ?? 0) + amount);
      })
    );
    return [...m.entries()]
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([period, amount]) => ({ period, amount }));
  }, [sales, range]);

  // پرفروش/کم‌فروش
  const bestWorst = useMemo(() => {
    const map = new Map<string, number>();
    sales.forEach((s) =>
      s.items.forEach((it) => {
        const amt = it.qty * it.unitPrice - it.discount;
        map.set(s.customerName, (map.get(s.customerName) ?? 0) + amt);
      })
    );
    const arr = [...map.entries()].sort((a, b) => b[1] - a[1]);
    return { top: arr.slice(0, 5), bottom: arr.slice(-5).reverse() };
  }, [sales]);

  // مجموع فروش
  const totalSales = sales.reduce(
    (sum, s) =>
      sum +
      s.items.reduce((sub, it) => sub + it.qty * it.unitPrice - it.discount, 0),
    0
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">{t("reports")}</h2>

      {/* انتخاب بازه */}
      <select
        value={range}
        onChange={(e) => setRange(e.target.value as Range)}
        className="border p-2 rounded mb-2"
      >
        <option value="day">{t("daily")}</option>
        <option value="week">{t("weekly")}</option>
        <option value="month">{t("monthly")}</option>
        <option value="year">{t("yearly")}</option>
      </select>

      {/* کارت‌های خلاصه */}
      <div className="flex gap-4 flex-wrap">
        <ReportCard title={t("lowStock")}       value={products.filter(p => p.qtyInStock < p.minPrice).length} />
        <ReportCard title={t("totalCustomers")} value={customers.length} />
        <ReportCard title={t("totalSuppliers")} value={suppliers.length} />
        <ReportCard title={t("totalProducts")}  value={products.length} />
        <ReportCard title={t("totalSales")}     value={totalSales.toLocaleString()} />
      </div>

      {/* نمودار فروش */}
      <div className="card">
        <h3 className="mb-2 font-semibold">{t(periodKey)}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* پرفروش و کم‌فروش */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-1">{t("bestSellers")}</h3>
          <ul className="list-disc ml-5 text-sm">
            {bestWorst.top.map(([name, amt]) => (
              <li key={name}>{name} — {amt.toLocaleString()}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-1">{t("worstSellers")}</h3>
          <ul className="list-disc ml-5 text-sm">
            {bestWorst.bottom.map(([name, amt]) => (
              <li key={name}>{name} — {amt.toLocaleString()}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
