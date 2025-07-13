import { useTranslation } from "react-i18next";

export default function LangSwitcher() {
  const { i18n } = useTranslation();       // دسترسی به شیء i18n

  return (
    <select
      value={i18n.language}               // زبان فعلی
      onChange={(e) => i18n.changeLanguage(e.target.value)}  // تغییر زبان
      className="border p-1 rounded text-sm"
    >
      <option value="en">EN</option>
      <option value="fa">فا</option>
    </select>
  );
}
