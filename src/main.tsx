import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./i18n";
import "./index.css";

/* لایه و صفحات */
import MainLayout      from "./layouts/MainLayout";
import CustomersPage   from "./pages/Customers";
import SuppliersPage   from "./pages/Suppliers";
import ProductsPage    from "./pages/Products";
import SalesPage       from "./pages/Sales";
import ReportsPage     from "./pages/Reports";
import InventoryPage   from "./pages/Inventory";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Suspense برای بارگذاری ترجمه‌ها */}
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>…</div>}>
      <BrowserRouter>
        <Routes>
          {/* لایهٔ اصلی با سایدبار */}
          <Route path="/" element={<MainLayout />}>
            <Route index            element={<CustomersPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="products"  element={<ProductsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="sales"     element={<SalesPage />} />
            <Route path="reports"   element={<ReportsPage />} />
            {/* مسیر CSV حذف شد */}
          </Route>
        </Routes>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);
