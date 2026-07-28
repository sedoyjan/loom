import { useState } from "react";
import { CoreCounterDemo } from "./demos/CoreCounterDemo.js";
import { ChangePasswordDemo } from "./demos/ChangePasswordDemo.js";
import { TanStackDemo } from "./demos/TanStackDemo.js";
import { ZustandDemo } from "./demos/ZustandDemo.js";
import { ReduxDemo } from "./demos/ReduxDemo.js";
import { RxJsDemo } from "./demos/RxJsDemo.js";
import { DiagnosticsDemo } from "./demos/DiagnosticsDemo.js";

const tabs = [
  { id: "core", label: "Core counter", component: CoreCounterDemo },
  { id: "password", label: "Change password", component: ChangePasswordDemo },
  { id: "tanstack", label: "TanStack Query", component: TanStackDemo },
  { id: "zustand", label: "Zustand", component: ZustandDemo },
  { id: "redux", label: "Redux", component: ReduxDemo },
  { id: "rxjs", label: "RxJS", component: RxJsDemo },
  { id: "diagnostics", label: "Diagnostics", component: DiagnosticsDemo },
] as const;

const repoBase = "https://github.com/sedoyjan/loom/tree/main/apps/demo-web/src/demos";

export function App() {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("core");
  const Active = tabs.find((tab) => tab.id === active)?.component ?? CoreCounterDemo;

  return (
    <div>
      <div className="banner">Experimental API — not production ready</div>
      <div className="layout">
        <h1>Loom demo</h1>
        <p className="meta">
          Opinionated MVVM/reactivity foundation with adapter packages for React,
          TanStack Query, Zustand, Redux, and RxJS.
        </p>
        <nav className="tabs" aria-label="Demo sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={tab.id === active ? "active" : ""}
              onClick={() => {
                setActive(tab.id);
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <section className="panel">
          <Active />
          <p className="meta">
            <a href={`${repoBase}/${Active.name}.tsx`}>View source on GitHub</a>
          </p>
        </section>
      </div>
    </div>
  );
}
