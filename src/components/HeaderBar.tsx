import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { format } from "date-fns-jalali"; // یا date-fns اگر شمسی لازم نیست

export default function HeaderBar({ user="Admin" }: { user?: string }) {
  const { i18n } = useTranslation();
  const [time, setTime] = useState(() => new Date().toLocaleTimeString());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString()),1000);
    return () => clearInterval(id);
  }, []);
  const today = new Date().toLocaleDateString(i18n.language);
  return (
    <div className="card flex justify-between items-center mb-4">
      <span className="font-bold text-lg">{today}</span>
      <span className="font-bold tabular-nums">{time}</span>
      <span className="font-bold">{user}</span>
    </div>
  );
}
