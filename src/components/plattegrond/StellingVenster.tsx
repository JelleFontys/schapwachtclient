import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Knop } from "../Knop";
import { Melding } from "../Melding";
import { Teller } from "../Teller";
import { Veld } from "../Veld";
import { meldingVan } from "../../data/api";
import { MAX_RIJEN_PER_KANT, MAX_VAKKEN_PER_RIJ, kantLabels } from "../../data/plattegronden";
import type { Kant, StellingInvoer, Vlak } from "../../data/plattegronden";

type Props = {
  vlak: Vlak;
  /** Bij een bestaande stelling: hoe hij nu is ingericht. */
  begin?: StellingInvoer;
  alleenLezen: boolean;
  bewaar?: (invoer: StellingInvoer) => Promise<void>;
  verwijder?: () => Promise<void>;
};

/** Een nieuwe rij krijgt evenveel plekken als de rij erboven. */
const STANDAARD_PLEKKEN = 4;

/**
 * Een stelling inrichten, in de drie stappen van de schets:
 * 1. een naam per kant,
 * 2. hoeveel rijen (planken) elke kant heeft,
 * 3. hoeveel producten er op elke rij naast elkaar staan.
 *
 * Een kant met 0 rijen bestaat niet: zo maak je een stelling tegen de
 * muur, met maar één kant.
 */
export function StellingVenster({ vlak, begin, alleenLezen, bewaar, verwijder }: Props) {
  const labels = kantLabels(vlak);
  const [links, setLinks] = useState<Kant>(begin?.links ?? { naam: "", rijen: [] });
  const [rechts, setRechts] = useState<Kant>(begin?.rechts ?? { naam: "", rijen: [] });
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [zekerWeten, setZekerWeten] = useState(false);

  if (alleenLezen) {
    return (
      <div className="space-y-5">
        <Overzicht label={labels.links} kant={begin?.links ?? null} />
        <Overzicht label={labels.rechts} kant={begin?.rechts ?? null} />
      </div>
    );
  }

  async function opslaan(event: React.FormEvent) {
    event.preventDefault();
    setFout(null);

    // Dezelfde controle als de server, maar dan meteen, zonder heen
    // en weer. De server controleert het daarna toch nog een keer.
    const zonderNaam = [
      links.rijen.length > 0 && !links.naam.trim() && labels.links.toLowerCase(),
      rechts.rijen.length > 0 && !rechts.naam.trim() && labels.rechts.toLowerCase(),
    ].filter(Boolean);
    if (links.rijen.length === 0 && rechts.rijen.length === 0) {
      setFout("Geef minstens één kant een rij.");
      return;
    }
    if (zonderNaam.length > 0) {
      setFout(`Geef de ${zonderNaam.join(" en de ")} een naam.`);
      return;
    }

    setBezig(true);
    try {
      await bewaar?.({
        links: links.rijen.length > 0 ? links : null,
        rechts: rechts.rijen.length > 0 ? rechts : null,
      });
    } catch (probleem) {
      setFout(meldingVan(probleem, "Opslaan is niet gelukt."));
      setBezig(false);
    }
  }

  async function weghalen() {
    setFout(null);
    setBezig(true);
    try {
      await verwijder?.();
    } catch (probleem) {
      setFout(meldingVan(probleem, "Weghalen is niet gelukt."));
      setBezig(false);
      setZekerWeten(false);
    }
  }

  return (
    <form onSubmit={opslaan} className="space-y-6" noValidate>
      {fout && <Melding tekst={fout} />}

      <div className="grid gap-6 sm:grid-cols-2">
        <KantVelden label={labels.links} kant={links} zet={setLinks} />
        <KantVelden label={labels.rechts} kant={rechts} zet={setRechts} />
      </div>

      <div className="flex flex-col gap-2 border-t border-black-forest/10 pt-5 sm:flex-row-reverse">
        <div className="sm:w-48">
          <Knop type="submit" bezig={bezig}>
            {begin ? "Opslaan" : "Stelling neerzetten"}
          </Knop>
        </div>

        {verwijder && !zekerWeten && (
          <div className="sm:mr-auto sm:w-48">
            <Knop soort="lijn" onClick={() => setZekerWeten(true)}>
              <Trash2 aria-hidden="true" className="size-4" />
              Stelling weghalen
            </Knop>
          </div>
        )}
        {verwijder && zekerWeten && (
          <div className="flex items-center gap-2 sm:mr-auto" role="group" aria-label="Bevestigen">
            <span className="text-sm font-semibold text-copperwood">Zeker weten?</span>
            <button
              type="button"
              onClick={() => void weghalen()}
              className="rounded-lg bg-copperwood px-3 py-1.5 text-sm font-semibold text-cornsilk"
            >
              Ja, weghalen
            </button>
            <button
              type="button"
              onClick={() => setZekerWeten(false)}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-black-forest/70"
            >
              Nee
            </button>
          </div>
        )}
      </div>
    </form>
  );
}

function KantVelden({ label, kant, zet }: { label: string; kant: Kant; zet: (kant: Kant) => void }) {
  function zetAantalRijen(aantal: number) {
    const rijen = kant.rijen.slice(0, aantal);
    while (rijen.length < aantal) rijen.push(rijen.at(-1) ?? STANDAARD_PLEKKEN);
    zet({ ...kant, rijen });
  }

  return (
    <fieldset className="space-y-4 rounded-2xl border border-black-forest/10 p-4">
      <legend className="px-1 text-sm font-bold">{label}</legend>

      <Veld
        label={`Naam van de ${label.toLowerCase()}`}
        waarde={kant.naam}
        zet={(naam) => zet({ ...kant, naam })}
        vereist={kant.rijen.length > 0}
        placeholder={label === "Linkerkant" || label === "Bovenkant" ? "Koek en snoep" : "Chips"}
      />

      <Teller
        label="Hoeveel rijen?"
        waarde={kant.rijen.length}
        zet={zetAantalRijen}
        min={0}
        max={MAX_RIJEN_PER_KANT}
      />

      {kant.rijen.length === 0 ? (
        <p className="text-sm text-black-forest/60">
          Geen rijen: deze kant staat tegen de muur en telt niet mee.
        </p>
      ) : (
        <div>
          <p className="text-sm font-semibold">Hoeveel producten per rij?</p>
          <p className="text-xs text-black-forest/60">Rij 1 is de bovenste plank.</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {kant.rijen.map((aantal, i) => (
              <Teller
                key={i}
                klein
                label={`Rij ${i + 1}`}
                waarde={aantal}
                zet={(nieuw) =>
                  zet({ ...kant, rijen: kant.rijen.map((oud, j) => (j === i ? nieuw : oud)) })
                }
                min={1}
                max={MAX_VAKKEN_PER_RIJ}
              />
            ))}
          </div>
        </div>
      )}
    </fieldset>
  );
}

function Overzicht({ label, kant }: { label: string; kant: Kant | null }) {
  return (
    <section>
      <h3 className="text-sm font-bold text-black-forest/60">{label}</h3>
      {kant ? (
        <>
          <p className="mt-1 text-lg font-extrabold">{kant.naam}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {kant.rijen.map((aantal, i) => (
              <li key={i} className="flex justify-between border-b border-black-forest/10 py-1">
                <span>Rij {i + 1}</span>
                <span data-getal>
                  {aantal} {aantal === 1 ? "product" : "producten"}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-1 text-sm text-black-forest/60">Geen; deze kant staat tegen de muur.</p>
      )}
    </section>
  );
}
