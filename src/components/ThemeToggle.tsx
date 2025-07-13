import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme")==="dark");
  useEffect(() => {
    const root = document.documentElement;
    if (dark) { root.classList.add("dark"); localStorage.setItem("theme","dark"); }
    else      { root.classList.remove("dark"); localStorage.setItem("theme","light"); }
  }, [dark]);
  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded transition"
      title={dark?"حالت روز":"حالت شب"}
      style={{ background: "var(--brand)", color: "#fff" }}
    >
      {dark? <Sun size={18}/> : <Moon size={18}/>}
    </button>
  );
}
