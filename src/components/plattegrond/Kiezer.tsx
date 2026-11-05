import { Plus } from "lucide-react";
import { NavLink } from "react-router-dom";

import type { PlattegrondKort } from "../../data/plattegronden";

type Props = {
  lijst: PlattegrondKort[];
  /** Alleen meegeven als deze gebruiker plattegronden mag aanmaken. */
  nieuw?: () => void;
};

/** Wisselen tussen de plattegronden van de winkel (SW-20). */
export function Kiezer({ lijst, nieuw }: Props) {
  return (
    <nav aria-label="Plattegronden" className="flex flex-wrap items-center gap-2">
      {lijst.map((plattegrond) => (
        <NavLink
          key={plattegrond.id}
          to={`/plattegrond/${plattegrond.id}`}
          className={({ isActive }) =>
            `rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              isActive
                ? "border-olive-leaf bg-olive-leaf text-cornsilk"
                : "border-black-forest/15 hover:border-olive-leaf hover:text-olive-leaf"
            }`
          }
        >
          {plattegrond.naam}
        </NavLink>
      ))}

      {nieuw && (
        <button
          type="button"
          onClick={nieuw}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed
                     border-black-forest/25 px-3.5 py-1.5 text-sm font-semibold
                     text-black-forest/70 transition-colors hover:border-olive-leaf
                     hover:text-olive-leaf"
        >
          <Plus aria-hidden="true" className="size-4" />
          Nieuwe plattegrond
        </button>
      )}
    </nav>
  );
}
