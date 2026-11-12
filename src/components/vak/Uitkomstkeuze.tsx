import { uitkomsten } from "../../data/partijen";
import type { Uitkomst } from "../../data/partijen";

export function Uitkomstkeuze({
  kies,
  bezig,
  annuleer,
}: {
  kies: (uitkomst: Uitkomst) => void;
  bezig: boolean;
  annuleer: () => void;
}) {
  return (
    <div role="group" aria-label="Hoe is het weg?" className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        {uitkomsten.map((u) => (
          <button
            key={u.waarde}
            type="button"
            disabled={bezig}
            onClick={() => kies(u.waarde)}
            title={u.uitleg}
            className={`rounded-lg border px-2 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
              u.waarde === "WEGGEGOOID"
                ? "border-copperwood text-copperwood hover:bg-copperwood hover:text-cornsilk"
                : "border-black-forest/20 hover:border-olive-leaf hover:text-olive-leaf"
            }`}
          >
            {u.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={annuleer}
        className="text-xs font-semibold text-black-forest/60 hover:text-black-forest"
      >
        Toch niet
      </button>
    </div>
  );
}
