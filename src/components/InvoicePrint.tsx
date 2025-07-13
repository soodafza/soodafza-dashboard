import React, { forwardRef } from "react";
import { Sale } from "../stores/saleStore";

const InvoicePrint = forwardRef<HTMLDivElement, { sale: Sale }>(
  ({ sale }, ref) => (
    <div ref={ref} className="p-6">
      <h2>Invoice #{sale.invoiceNumber}</h2>
      <p>{sale.date} – {sale.customerName}</p>
      <table className="w-full mt-4 text-sm">
        <thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead>
        <tbody>
          {sale.items.map(it=>(
            <tr key={it.id}>
              <td>{it.productId}</td>
              <td>{it.qty}</td>
              <td>{it.unitPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
);

export default InvoicePrint;
