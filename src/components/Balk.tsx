import { BarChart3, ListChecks, LogOut, Map as MapIcoon, Package, ScanBarcode, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useSessie } from "../auth/authContext";

type Item = { naar: string; label: string; icoon: LucideIcon; alleenLeiding?: boolean };

const ITEMS: Item[] = [
  { naar: "/plattegrond", label: "Plattegrond", icoon: MapIcoon },
  { naar: "/werklijst", label: "Werklijst", icoon: ListChecks },
  { naar: "/scannen", label: "Scannen", icoon: ScanBarcode },
  { naar: "/producten", label: "Producten", icoon: Package },
  { naar: "/winkel", label: "Team", icoon: Users },
  { naar: "/overzicht", label: "Weggegooid", icoon: BarChart3, alleenLeiding: true },
];

export function Balk() {
  const { gebruiker, logUit } = useSessie();
  const isLeiding = gebruiker?.rol === "LEIDINGGEVENDE";
  const items = ITEMS.filter((i) => !i.alleenLeiding || isLeiding);

  return (
    <>
      <header className="border-b border-black-forest/10">
        <div className="mx-auto flex max-w-5xl items-center gap-1 px-5 py-3">
          <span className="mr-3 font-extrabold tracking-tight">SchapWacht</span>

          <nav aria-label="Hoofdmenu" className="hidden items-center gap-0.5 md:flex">
            {items.map((item) => (
              <NavLink
                key={item.naar}
                to={item.naar}
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors ${
                    isActive ? "bg-olive-leaf/10 text-olive-leaf" : "text-black-forest/70 hover:text-black-forest"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <span className="ml-auto hidden text-sm text-black-forest/60 lg:inline">{gebruiker?.naam}</span>

          <button
            type="button"
            onClick={() => void logUit()}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-black-forest/20 px-2.5 py-1.5
                       text-sm font-semibold transition-colors hover:border-olive-leaf hover:text-olive-leaf lg:ml-3"
          >
            <LogOut aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Uitloggen</span>
            <span className="sr-only sm:hidden">Uitloggen</span>
          </button>
        </div>
      </header>

      <nav
        aria-label="Hoofdmenu"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-black-forest/10 bg-cornsilk/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-5">
          {items
            .filter((item) => !item.alleenLeiding)
            .map((item) => (
              <li key={item.naar}>
                <NavLink
                  to={item.naar}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${
                      isActive ? "text-olive-leaf" : "text-black-forest/60"
                    }`
                  }
                >
                  <item.icoon aria-hidden="true" className="size-5" />
                  {item.label}
                </NavLink>
              </li>
            ))}
        </ul>
      </nav>
    </>
  );
}
