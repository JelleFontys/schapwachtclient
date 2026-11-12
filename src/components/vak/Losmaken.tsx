import { TriangleAlert } from "lucide-react";

import type { Geraakt } from "../../data/plattegronden";

export function Losmaken({
  geraakt,
  doorgaan,
  terug,
  bezig,
}: {
  geraakt: Geraakt[];
  doorgaan: () => void;
  terug: () => void;
  bezig: boolean;
}) {
  const n = geraakt.length;

  return (
    <div role="alert" className="space-y-3 rounded-xl border border-copperwood bg-copperwood/10 p-4">
      <p className="flex items-start gap-2 font-semibold text-copperwood">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        {n === 1 ? "1 product raakt zijn plek kwijt" : `${n} producten raken hun plek kwijt`}
      </p>
      <ul className="space-y-1 text-sm">
        {geraakt.map((g, i) => (
          <li key={i} className="flex flex-wrap justify-between gap-x-3">
            <span className="font-semibold">{g.product}</span>
            <span className="text-black-forest/65">{g.plek}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-black-forest/75">
        Ze worden niet weggegooid. Je vindt ze daarna in de werklijst onder "Zonder plek", en
        daar kun je ze opnieuw in een vak zetten.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={doorgaan}
          disabled={bezig}
          className="rounded-lg bg-copperwood px-3.5 py-2 text-sm font-semibold text-cornsilk disabled:opacity-50"
        >
          Doorgaan en {n === 1 ? "1 product" : `${n} producten`} losmaken
        </button>
        <button
          type="button"
          onClick={terug}
          className="rounded-lg px-3.5 py-2 text-sm font-semibold text-black-forest/70"
        >
          Terug
        </button>
      </div>
    </div>
  );
}
