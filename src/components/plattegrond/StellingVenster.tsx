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

/** Een nieuwe kant begint met één rij van zoveel producten. */
const STANDAARD_PLEKKEN = 4;
const nieuweKant = (): Kant => ({ naam: "", rijen: [STANDAARD_PLEKKEN] });

/**
 * Een stelling inrichten, in de drie stappen van de schets:
 * 1. een naam,
 * 2. hoeveel rijen (planken),
 * 3. hoeveel producten er op elke rij naast elkaar staan.
 *
 * Hoeveel kanten er zijn hangt af van de dikte. Eén hokje dik is één
 * kant met één naam. Twee hokjes dik is een linker- en rechterkant (of
 * boven en onder bij een liggende stelling), elk met een eigen naam.
 */
export function StellingVenster({ vlak, begin, alleenLezen, bewaar, verwijder }: Props) {
  const labels = kantLabels(vlak);
  const eenKant = labels.rechts === null;

  const [links, setLinks] = useState<Kant>(begin?.links ?? nieuweKant());
  const [rechts, setRechts] = useState<Kant>(begin?.rechts ?? nieuweKant());
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [zekerWeten, setZekerWeten] = useState(false);

  if (alleenLezen) {
    return (
      <div className="space-y-5">
        <Overzicht label={eenKant ? null : labels.links} kant={begin?.links ?? null} />
        {!eenKant && <Overzicht label={labels.rechts} kant={begin?.rechts ?? null} />}
      </div>
    );
  }

  async function opslaan(event: React.FormEvent) {
    event.preventDefault();
    setFout(null);

    // Dezelfde controle als de server, maar dan meteen, zonder heen
    // en weer. De server controleert het daarna toch nog een keer.
    if (eenKant && !links.naam.trim()) {
      setFout("Geef de stelling een naam.");
      return;
    }
    const zonderNaam = eenKant
      ? []
      : [
          !links.naam.trim() && labels.links.toLowerCase(),
          !rechts.naam.trim() && labels.rechts?.toLowerCase(),
        ].filter(Boolean);
    if (zonderNaam.length > 0) {
      setFout(`Geef de ${zonderNaam.join(" en de ")} een naam.`);
      return;
    }

    setBezig(true);
    try {
      await bewaar?.({ links, rechts: eenKant ? null : rechts });
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

      {eenKant ? (
        <KantVelden kant={links} zet={setLinks} naamLabel="Naam" voorbeeld="Dranken" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <KantVelden
            titel={labels.links}
            kant={links}
            zet={setLinks}
            naamLabel={`Naam van de ${labels.links.toLowerCase()}`}
            voorbeeld="Koek en snoep"
          />
          <KantVelden
            titel={labels.rechts ?? ""}
            kant={rechts}
            zet={setRechts}
            naamLabel={`Naam van de ${labels.rechts?.toLowerCase()}`}
            voorbeeld="Chips"
          />
        </div>
      )}

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

type KantProps = {
  /** Kop boven het blok. Weglaten bij een stelling met maar één kant. */
  titel?: string;
  kant: Kant;
  zet: (kant: Kant) => void;
  naamLabel: string;
  voorbeeld: string;
};

function KantVelden({ titel, kant, zet, naamLabel, voorbeeld }: KantProps) {
  function zetAantalRijen(aantal: number) {
    const rijen = kant.rijen.slice(0, aantal);
    // Een nieuwe rij krijgt evenveel producten als de rij erboven.
    while (rijen.length < aantal) rijen.push(rijen.at(-1) ?? STANDAARD_PLEKKEN);
    zet({ ...kant, rijen });
  }

  const velden = (
    <>
      <Veld
        label={naamLabel}
        waarde={kant.naam}
        zet={(naam) => zet({ ...kant, naam })}
        placeholder={voorbeeld}
      />

      <Teller
        label="Hoeveel rijen?"
        waarde={kant.rijen.length}
        zet={zetAantalRijen}
        min={1}
        max={MAX_RIJEN_PER_KANT}
      />

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
    </>
  );

  if (!titel) return <div className="space-y-4">{velden}</div>;

  return (
    <fieldset className="space-y-4 rounded-2xl border border-black-forest/10 p-4">
      <legend className="px-1 text-sm font-bold">{titel}</legend>
      {velden}
    </fieldset>
  );
}

function Overzicht({ label, kant }: { label: string | null; kant: Kant | null }) {
  if (!kant) return null;

  return (
    <section>
      {label && <h3 className="text-sm font-bold text-black-forest/60">{label}</h3>}
      {label && <p className="mt-1 text-lg font-extrabold">{kant.naam}</p>}
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
    </section>
  );
}
