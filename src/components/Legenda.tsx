import { alleStatussen, leegVlak, statusOpmaak } from "../data/statussen";

/**
 * Uitleg van de kleuren (SW-33). Kleur, icoon en woord: wie de kleuren
 * niet ziet, heeft genoeg aan het icoon en het woord.
 */
export function Legenda() {
  return (
    <aside
      aria-label="Legenda"
      className="rounded-xl border border-black-forest/10 bg-white/50 px-3 py-2.5 text-xs"
    >
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 sm:flex-col sm:gap-y-1">
        {[...alleStatussen].reverse().map((status) => {
          const { label, icoon: Icoon, vlak } = statusOpmaak[status];
          return (
            <li key={status} className="flex items-center gap-2">
              <span className={`grid size-5 place-items-center rounded border ${vlak}`}>
                <Icoon aria-hidden="true" className="size-3" />
              </span>
              <span className="font-semibold">{label}</span>
            </li>
          );
        })}
        <li className="flex items-center gap-2">
          <span className={`size-5 rounded border ${leegVlak}`} />
          <span className="font-semibold text-black-forest/70">Leeg</span>
        </li>
      </ul>
    </aside>
  );
}
