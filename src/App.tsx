import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./index.css";           // اطمینان از بارگذاری Tailwind

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-100">
      {/* لوگوها */}
      <div className="flex items-center gap-8">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img
            src={viteLogo}
            className="h-24 w-24 transition-transform hover:rotate-180 duration-700"
            alt="Vite logo"
          />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img
            src={reactLogo}
            className="h-24 w-24 transition-transform hover:rotate-180 duration-700"
            alt="React logo"
          />
        </a>
      </div>

      {/* عنوان */}
      <h1 className="text-5xl font-bold text-indigo-600">Vite + React</h1>

      {/* کارت شمارنده */}
      <div className="rounded-xl bg-white shadow-lg p-6 flex flex-col items-center gap-4">
        <button
          className="rounded-lg bg-emerald-500 px-6 py-2 text-white font-semibold hover:bg-emerald-600 active:scale-95 transition"
          onClick={() => setCount((c) => c + 1)}
        >
          count is {count}
        </button>
        <p className="text-sm text-gray-600">
          Edit <code>src/App.tsx</code> and save&nbsp;to&nbsp;test HMR
        </p>
      </div>

      {/* لینک مستندات */}
      <p className="text-gray-500 text-sm">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
