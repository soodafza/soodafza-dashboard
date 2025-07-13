import { Outlet, NavLink } from "react-router-dom";
import LangSwitcher  from "../components/LangSwitcher";
import ThemeToggle   from "../components/ThemeToggle";
import HeaderBar     from "../components/HeaderBar";
import { useTranslation } from "react-i18next";

export default function MainLayout() {
  const { t } = useTranslation();
  const pages = ["customers","suppliers","products","inventory","sales","reports"];
  const base  = "block mb-2 py-1 px-2 rounded hover:bg-opacity-10";
  return (
    <div className="flex">
      <aside className="w-56 p-4">
        <h1 className="text-2xl font-bold mb-6">Soodafza</h1>
        {pages.map(p=>(
          <NavLink
            key={p}
            to={`/${p==="customers"?"":p}`}
            className={({isActive})=>`${base} ${isActive?"sidebar-active":""}`}
          >
            {t(p)}
          </NavLink>
        ))}
        <div className="mt-auto flex gap-2 pt-4">
          <ThemeToggle/>
          <LangSwitcher/>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <HeaderBar user="Hamid"/>
        <Outlet/>
      </main>
    </div>
  );
}
