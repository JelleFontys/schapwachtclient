import { useEffect, useId, useState } from "react";
import { Loader2 } from "lucide-react";

import { Balk } from "../components/Balk";
import { Melding } from "../components/Melding";
import { meldingVan } from "../data/api";
import { langDatum, vandaag, verschuif } from "../data/datum";
import { overzicht } from "../data/team";
import type { Overzicht as OverzichtGegevens } from "../data/team";

const SNEL = [7, 30, 90];

export default function Overzicht() {
  const vanId = useId();
  const totId = useId();
  const [tot, setTot] = useState(vandaag());
  const [van, setVan] = useState(verschuif(vandaag(), -29));
  const [gegevens, setGegevens] = useState<OverzichtGegevens | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    if (!van || !tot) return;
    let weg = false;
    overzicht
      .weggegooid(van, tot)
      .then((g) => {
        if (weg) return;
        setGegevens(g);
        setFout(null);
      })
      .catch((p: unknown) => !weg && setFout(meldingVan(p)));
    return () => {
      weg = true;
    };
  }, [van, tot]);

  const huidig = gegevens && gegevens.van === van && gegevens.tot === tot ? gegevens : null;
  const meeste = Math.max(1, ...(huidig?.groepen.map((g) => g.partijen) ?? [1]));

  return (
    <>
      <Balk />
      <main className="mx-auto max-w-3xl px-5 pt-6 pb-28 sm:py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Weggegooid</h1>
        <p className="mt-1 max-w-prose text-sm text-black-forest/70">
          Alles wat is afgemeld als "weggegooid", per productgroep. Staat een groep steeds
          bovenaan, dan is het misschien tijd om die eerder af te prijzen.
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <div role="group" aria-label="Snel kiezen" className="flex gap-1.5">
            {SNEL.map((dagen) => {
              const actief = tot === vandaag() && van === verschuif(vandaag(), -(dagen - 1));
              return (
                <button
                  key={dagen}
                  type="button"
                  aria-pressed={actief}
                  onClick={() => {
                    setTot(vandaag());
                    setVan(verschuif(vandaag(), -(dagen - 1)));
                  }}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                    actief ? "border-olive-leaf bg-olive-leaf text-cornsilk" : "border-black-forest/15 hover:border-olive-leaf"
                  }`}
                >
                  {dagen} dagen
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <div>
              <label htmlFor={vanId} className="block text-xs font-semibold">Van</label>
              <input id={vanId} type="date" value={van} max={tot} onChange={(e) => setVan(e.target.value)}
                className="mt-1 rounded-lg border border-black-forest/15 bg-white/60 px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label htmlFor={totId} className="block text-xs font-semibold">Tot en met</label>
              <input id={totId} type="date" value={tot} min={van} onChange={(e) => setTot(e.target.value)}
                className="mt-1 rounded-lg border border-black-forest/15 bg-white/60 px-2 py-1.5 text-sm" />
            </div>
          </div>
        </div>

        {fout && <div className="mt-4"><Melding tekst={fout} /></div>}
        {!huidig && !fout && (
          <p className="mt-8 flex items-center gap-2 text-sm text-black-forest/60">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Laden
          </p>
        )}

        {huidig && (
          <>
            <p className="mt-6 text-sm">
              <span className="font-bold" data-getal>{huidig.totaal.partijen}</span>{" "}
              {huidig.totaal.partijen === 1 ? "partij" : "partijen"} weggegooid
              {huidig.totaal.stuks > 0 && (
                <>, samen <span className="font-bold" data-getal>{huidig.totaal.stuks}</span> stuks</>
              )}
              {huidig.totaal.zonderAantal > 0 && ` (van ${huidig.totaal.zonderAantal} is het aantal niet bekend)`}
              , van {langDatum(huidig.van)} tot en met {langDatum(huidig.tot)}.
            </p>

            {huidig.groepen.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-black-forest/20 p-6 text-center text-sm text-black-forest/70">
                In deze periode is er niets weggegooid.
              </p>
            ) : (
              <table className="mt-6 w-full text-sm">
                <caption className="sr-only">Weggegooid per productgroep</caption>
                <thead>
                  <tr className="text-left text-xs text-black-forest/60">
                    <th scope="col" className="pb-2 font-semibold">Productgroep</th>
                    <th scope="col" className="pb-2 text-right font-semibold">Partijen</th>
                    <th scope="col" className="pb-2 text-right font-semibold">Stuks</th>
                  </tr>
                </thead>
                <tbody>
                  {huidig.groepen.map((g) => (
                    <tr key={g.productgroep?.id ?? "geen"} className="border-t border-black-forest/10 align-top">
                      <th scope="row" className="py-3 pr-3 text-left font-normal">
                        <span className="font-semibold">{g.productgroep?.naam ?? "Zonder productgroep"}</span>
                        <span
                          aria-hidden="true"
                          className="mt-1.5 block h-2 rounded-full bg-copperwood"
                          style={{ width: `${(g.partijen / meeste) * 100}%` }}
                        />
                        <span className="mt-1.5 block text-xs text-black-forest/60">
                          {g.producten.slice(0, 3).map((p) => `${p.naam} (${p.partijen})`).join(", ")}
                          {g.producten.length > 3 && ` en ${g.producten.length - 3} meer`}
                        </span>
                      </th>
                      <td data-getal className="py-3 text-right font-semibold">{g.partijen}</td>
                      <td data-getal className="py-3 text-right">
                        {g.stuks}
                        {g.zonderAantal > 0 && <span className="block text-xs text-black-forest/50">+{g.zonderAantal} onbekend</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </main>
    </>
  );
}
