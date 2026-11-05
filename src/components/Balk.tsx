import { LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useSessie } from "../auth/authContext";

const stijl = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors ${
    isActive ? "bg-olive-leaf/10 text-olive-leaf" : "text-black-forest/70 hover:text-black-forest"
  }`;

/**
 * De balk boven elke pagina waarop je ingelogd bent.
 *
 * Zonder deze balk is /winkel nergens vandaan te bereiken, want de
 * startpagina is nu een doorverwijzing naar de plattegrond.
 */
export function Balk() {
  const { gebruiker, logUit } = useSessie();

  return (
    <header className="border-b border-black-forest/10">
      <div className="mx-auto flex max-w-3xl items-center gap-1 px-5 py-3">
        <span className="mr-3 font-extrabold tracking-tight">SchapWacht</span>

        <nav className="flex items-center gap-1">
          <NavLink to="/plattegrond" className={stijl}>
            Plattegrond
          </NavLink>
          <NavLink to="/winkel" className={stijl}>
            Winkel
          </NavLink>
        </nav>

        <span className="ml-auto hidden text-sm text-black-forest/60 sm:inline">
          {gebruiker?.naam}
        </span>

        <button
          type="button"
          onClick={() => void logUit()}
          className="ml-3 inline-flex items-center gap-1.5 rounded-lg border border-black-forest/20
                     px-2.5 py-1.5 text-sm font-semibold transition-colors
                     hover:border-olive-leaf hover:text-olive-leaf"
        >
          <LogOut aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">Uitloggen</span>
        </button>
      </div>
    </header>
  );
}
