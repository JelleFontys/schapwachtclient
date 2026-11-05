import { rijLetter } from "../../data/plattegronden";
import type { Plattegrond, Vak } from "../../data/plattegronden";

type Props = {
  plattegrond: Plattegrond;
  kies: (vak: Vak) => void;
};

/**
 * Het raster van vakken.
 *
 * Een tabel, geen losse blokjes. Een schermlezer leest dan bij elk vak
 * voor in welke rij en kolom het staat, en dat is precies de
 * informatie die iemand nodig heeft om te weten waar het in de winkel
 * is.
 *
 * Op een telefoon zijn de vakken 3rem breed. Zo past een raster van
 * zes kolommen precies op het scherm. Bij een breder raster scrolt het
 * raster zelf opzij, niet de hele pagina.
 *
 * Het kader is `relative`, en dat is geen opmaak maar een reparatie.
 * De verborgen tekst voor schermlezers (sr-only) staat absoluut
 * gepositioneerd. Zonder gepositioneerde ouder rekent de browser die
 * tekst tegen de hele pagina in plaats van tegen dit kader, en dan
 * maakt een vak in kolom 8 de hele pagina breder dan het scherm.
 */
export function Raster({ plattegrond, kies }: Props) {
  const rijen = Array.from({ length: plattegrond.rijen }, (_, i) => i + 1);
  const kolommen = Array.from({ length: plattegrond.kolommen }, (_, i) => i + 1);
  const opPlek = new Map(plattegrond.vakken.map((vak) => [`${vak.rij}:${vak.kolom}`, vak]));

  return (
    <div className="relative -mx-5 overflow-x-auto px-5 pb-2 [--vak:3rem] sm:[--vak:5rem]">
      <table className="border-separate border-spacing-1 sm:border-spacing-1.5">
        <caption className="sr-only">
          {plattegrond.naam}: {plattegrond.rijen} rijen en {plattegrond.kolommen} kolommen
        </caption>

        <thead>
          <tr>
            <td />
            {kolommen.map((kolom) => (
              <th
                key={kolom}
                scope="col"
                data-getal
                className="pb-0.5 text-center text-xs font-semibold text-black-forest/50"
              >
                {kolom}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rijen.map((rij) => (
            <tr key={rij}>
              <th
                scope="row"
                className="pr-1 text-right text-xs font-semibold text-black-forest/50"
              >
                {rijLetter(rij)}
              </th>

              {kolommen.map((kolom) => {
                const vak = opPlek.get(`${rij}:${kolom}`);
                return (
                  <td key={kolom} className="p-0">
                    {vak ? <VakKnop vak={vak} kies={kies} /> : <div className="size-(--vak)" />}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VakKnop({ vak, kies }: { vak: Vak; kies: (vak: Vak) => void }) {
  return (
    <button
      type="button"
      onClick={() => kies(vak)}
      // De volledige naam bij aanwijzen met de muis, want in een klein
      // vak past hij vaak niet helemaal.
      title={vak.naam ?? undefined}
      className="flex size-(--vak) flex-col items-start justify-between gap-0.5 overflow-hidden
                 rounded-lg border border-black-forest/15 bg-white/50 p-1 text-left
                 transition-colors hover:border-olive-leaf hover:bg-white sm:p-1.5"
    >
      <span data-getal className="text-[10px] font-semibold leading-none text-black-forest/45">
        <span className="sr-only">Vak </span>
        {vak.positie}
      </span>

      {vak.naam && (
        <span className="line-clamp-2 w-full break-words text-[10px] leading-tight sm:text-xs">
          {vak.naam}
        </span>
      )}
    </button>
  );
}
