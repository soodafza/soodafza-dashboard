import React from "react";
import QRCode from "react-qr-code";

interface Props {
  customerId: string;
  customerName: string;
}

export default function CustomerQRCode({ customerId, customerName }: Props) {
  // محتوای QR: می‌توانیم یک JSON کوچک یا فقط شناسه را کد کنیم
  const qrValue = JSON.stringify({ id: customerId, name: customerName });

  return (
    <div className="p-4 bg-white rounded shadow text-center">
      <h4 className="mb-2 font-semibold">{customerName}</h4>
      <QRCode value={qrValue} size={128} />
    </div>
  );
}
