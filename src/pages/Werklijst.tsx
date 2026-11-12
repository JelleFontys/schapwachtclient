import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MapPin, MapPinOff } from "lucide-react";

import { Balk } from "../components/Balk";
import { Knop } from "../components/Knop";
import { Melding } from "../components/Melding";
import { Statusmerk } from "../components/Statusmerk";
import { PlekKiezer } from "../components/vak/PlekKiezer";
import { Uitkomstkeuze } from "../components/vak/Uitkomstkeuze";
import { meldingVan } from "../data/api";
import { hoeLang, kortDatum } from "../data/datum";
import { partijen } from "../data/partijen";
import type { Partij } from "../data/partijen";

type Filter = "alles" | "actie" | "zonder";

export default function Werklijst() {
  const [gegevens, setGegevens] = useState<{ vandaag: string; partijen: Partij[] } | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("actie");
  const [gemeld, setGemeld] = useState<string | null>(null);

  useEffect(() => {
    let weg = false;
    partijen
      .werklijst()
      .then((g) => !weg && setGegevens(g))
      .catch((p: unknown) => !weg && setFout(meldingVan(p, "De werklijst laadt niet.")));
    return () => {
      weg = true;
    };
  }, []);

  async function herlaad(bericht: string) {
    setGegevens(await partijen.werklijst());
    setGemeld(bericht);
  }

  const alles = gegevens?.partijen ?? [];
  const actie = alles.filter((p) => p.status !== "RUIM");
  const zonder = alles.filter((p) => p.plek === null);
  const getoond = filter === "alles" ? alles : filter === "actie" ? actie : zonder;

  const tabs: { waarde: Filter; label: string; aantal: number }[] = [
    { waarde: "actie", label: "Actie nodig", aantal: actie.length },
    { waarde: "alles", label: "Alles", aantal: alles.length },
    { waarde: "zonder", label: "Zonder plek", aantal: zonder.length },
  ];

  return (
    <>
      <Balk />

      <main className="mx-auto max-w-3xl px-5 pt-6 pb-28 sm:py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Werklijst</h1>
        <p className="mt-1 text-sm text-black-forest/65">
          Alles wat in de winkel ligt, kortst houdbaar bovenaan.
        </p>

        <div role="tablist" aria-label="Wat tonen" className="mt-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.waarde}
              type="button"
              role="tab"
              aria-selected={filter === tab.waarde}
              onClick={() => setFilter(tab.waarde)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                filter === tab.waarde
                  ? "border-olive-leaf bg-olive-leaf text-cornsilk"
                  : "border-black-forest/15 hover:border-olive-leaf hover:text-olive-leaf"
              }`}
            >
              {tab.label} <span data-getal className="opacity-75">({tab.aantal})</span>
            </button>
          ))}
        </div>

        {gemeld && (
          <p role="status" className="mt-4 rounded-xl bg-olive-leaf/10 px-3.5 py-2.5 text-sm font-semibold text-olive-leaf">
            {gemeld}
          </p>
        )}
        {fout && (
          <div className="mt-4">
            <Melding tekst={fout} />
          </div>
        )}
        {!gegevens && !fout && (
          <p className="mt-8 flex items-center gap-2 text-sm text-black-forest/60">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Werklijst laden
          </p>
        )}

        {gegevens && getoond.length === 0 && (
          <p className="mt-8 rounded-2xl border border-dashed border-black-forest/20 p-6 text-center text-sm text-black-forest/70">
            {filter === "actie"
              ? "Niets te doen. Alles in de winkel is ruim houdbaar."
              : filter === "zonder"
                ? "Alle producten hebben een plek."
                : "Er ligt nog niets in de winkel. Zet producten in een vak via de plattegrond of door te scannen."}
          </p>
        )}

        <ul className="mt-6 space-y-2">
          {gegevens &&
            getoond.map((partij) => (
              <Regel
                key={partij.id}
                partij={partij}
                vandaag={gegevens.vandaag}
                klaar={(bericht) => void herlaad(bericht)}
              />
            ))}
        </ul>
      </main>
    </>
  );
}

function Regel({
  partij,
  vandaag,
  klaar,
}: {
  partij: Partij;
  vandaag: string;
  klaar: (bericht: string) => void;
}) {
  const [stand, setStand] = useState<"niets" | "afmelden" | "plaatsen">("niets");
  const [vak, setVak] = useState<{ id: string; tekst: string } | null>(null);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  async function doe(actie: () => Promise<unknown>, bericht: string) {
    setFout(null);
    setBezig(true);
    try {
      await actie();
      klaar(bericht);
    } catch (probleem) {
      setFout(meldingVan(probleem));
      setBezig(false);
    }
  }

  return (
    <li className="rounded-2xl border border-black-forest/10 bg-white/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{partij.product.naam}</p>
          <p className="text-sm text-black-forest/70">
            <time dateTime={partij.houdbaarTot}>{kortDatum(partij.houdbaarTot)}</time> ·{" "}
            {hoeLang(partij.houdbaarTot, vandaag)}
            {partij.aantal !== null && <> · <span data-getal>{partij.aantal}</span> stuks</>}
          </p>
          {partij.plek ? (
            <Link
              to={`/stelling/${partij.plek.stellingId}`}
              className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-olive-leaf hover:text-black-forest"
            >
              <MapPin aria-hidden="true" className="size-3.5" />
              {partij.plek.plattegrond} · {partij.plek.tekst}
            </Link>
          ) : (
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-copperwood">
              <MapPinOff aria-hidden="true" className="size-3.5" />
              Zonder plek
            </p>
          )}
        </div>
        <Statusmerk status={partij.status} klein />
      </div>

      {fout && <p className="mt-2 text-sm text-copperwood">{fout}</p>}

      <div className="mt-3">
        {stand === "afmelden" && (
          <Uitkomstkeuze
            bezig={bezig}
            annuleer={() => setStand("niets")}
            kies={(uitkomst) =>
              void doe(
                () => partijen.afmelden(partij.id, uitkomst),
                `${partij.product.naam} afgemeld als ${uitkomst.toLowerCase()}.`,
              )
            }
          />
        )}

        {stand === "plaatsen" && (
          <div className="space-y-3 rounded-xl border border-black-forest/10 p-3">
            <PlekKiezer kies={setVak} />
            <div className="flex gap-2">
              <div className="w-40">
                <Knop
                  bezig={bezig}
                  onClick={() =>
                    vak
                      ? void doe(() => partijen.plaats(partij.id, vak.id), `${partij.product.naam} staat nu in ${vak.tekst}.`)
                      : setFout("Kies eerst een vak.")
                  }
                >
                  Hier neerzetten
                </Knop>
              </div>
              <button
                type="button"
                onClick={() => setStand("niets")}
                className="px-3 text-sm font-semibold text-black-forest/60"
              >
                Annuleren
              </button>
            </div>
          </div>
        )}

        {stand === "niets" && (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStand("afmelden")}
              className="text-sm font-semibold text-olive-leaf hover:text-black-forest"
            >
              Afmelden
            </button>
            {partij.plek === null && (
              <button
                type="button"
                onClick={() => setStand("plaatsen")}
                className="text-sm font-semibold text-olive-leaf hover:text-black-forest"
              >
                Plaatsen
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
