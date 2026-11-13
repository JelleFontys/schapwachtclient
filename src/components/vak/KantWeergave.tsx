import { kortDatum } from "../../data/datum";
import type { InhoudKant, InhoudVak } from "../../data/plattegronden";
import { leegVlak, statusOpmaak } from "../../data/statussen";
import { Statusmerk } from "../Statusmerk";

export function KantWeergave({
  kant,
  toonNaam,
  kies,
}: {
  kant: InhoudKant;
  toonNaam: boolean;
  kies: (vak: InhoudVak, rij: number) => void;
}) {
  return (
    <section aria-label={kant.naam}>
      {toonNaam && (
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-xl font-extrabold tracking-tight">{kant.naam}</h2>
          {kant.status && <Statusmerk status={kant.status} klein />}
        </div>
      )}

      <div className="space-y-3">
        {kant.rijen.map((rij) => (
          <div key={rij.nummer} className="flex items-start gap-2">
            <span className="w-10 shrink-0 pt-2 text-xs font-bold text-black-forest/50">
              Rij {rij.nummer}
            </span>
            <div className="relative min-w-0 flex-1 overflow-x-auto pb-1">
              <ul className="flex gap-1.5">
                {rij.vakken.map((vak) => (
                  <li key={vak.id}>
                    <VakKnop vak={vak} kies={(v) => kies(v, rij.nummer)} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function VakKnop({ vak, kies }: { vak: InhoudVak; kies: (vak: InhoudVak) => void }) {
  const eerste = vak.partijen[0];
  const opmaak = vak.status ? statusOpmaak[vak.status] : null;
  const Icoon = opmaak?.icoon;

  return (
    <button
      type="button"
      onClick={() => kies(vak)}
      className={`flex h-20 w-[4.75rem] flex-col items-start justify-between overflow-hidden rounded-lg border-2 p-1.5 text-left
                  transition-[filter] hover:brightness-95 sm:w-24 ${opmaak?.vlak ?? leegVlak}`}
    >
      <span className="flex w-full items-center justify-between text-[10px] font-bold opacity-70">
        <span>
          <span className="sr-only">Vak </span>
          {vak.positie}
        </span>
        {Icoon && <Icoon aria-hidden="true" className="size-3.5" />}
      </span>

      {eerste ? (
        <>
          <span className="line-clamp-2 w-full text-[11px] leading-tight font-semibold">
            {eerste.product.naam}
          </span>
          <span className="flex w-full justify-between text-[10px] font-semibold">
            <time dateTime={eerste.houdbaarTot}>{kortDatum(eerste.houdbaarTot)}</time>
            {vak.partijen.length > 1 && <span>+{vak.partijen.length - 1}</span>}
          </span>
          {opmaak && <span className="sr-only">, {opmaak.label}</span>}
        </>
      ) : (
        <span className="text-[11px] text-black-forest/45">Leeg</span>
      )}
    </button>
  );
}
