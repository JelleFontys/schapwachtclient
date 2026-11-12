import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Knop } from "../Knop";
import { Melding } from "../Melding";
import { Teller } from "../Teller";
import { Veld } from "../Veld";
import { ApiFout, meldingVan } from "../../data/api";
import { Losmaken } from "../vak/Losmaken";
import { MAX_RIJEN_PER_KANT, MAX_VAKKEN_PER_RIJ, kantLabels } from "../../data/plattegronden";
import type { Geraakt, Kant, StellingInvoer, Vlak } from "../../data/plattegronden";

type Props = {
  vlak: Vlak;
  begin?: StellingInvoer;
  alleenLezen: boolean;
  bewaar?: (invoer: StellingInvoer, losmaken: boolean) => Promise<void>;
  verwijder?: (losmaken: boolean) => Promise<void>;
};

function geraaktUit(probleem: unknown): Geraakt[] | null {
  if (probleem instanceof ApiFout && probleem.status === 409 && Array.isArray(probleem.gegevens.geraakt)) {
    return probleem.gegevens.geraakt as Geraakt[];
  }
  return null;
}

const STANDAARD_PLEKKEN = 4;
const nieuweKant = (): Kant => ({ naam: "", rijen: [STANDAARD_PLEKKEN] });

export function StellingVenster({ vlak, begin, alleenLezen, bewaar, verwijder }: Props) {
  const labels = kantLabels(vlak);
  const eenKant = labels.rechts === null;

  const [links, setLinks] = useState<Kant>(begin?.links ?? nieuweKant());
  const [rechts, setRechts] = useState<Kant>(begin?.rechts ?? nieuweKant());
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [zekerWeten, setZekerWeten] = useState(false);
  const [geraakt, setGeraakt] = useState<{ lijst: Geraakt[]; doorgaan: () => Promise<void> } | null>(
    null,
  );

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

    const invoer = { links, rechts: eenKant ? null : rechts };
    await probeer(
      () => bewaar?.(invoer, false),
      () => bewaar?.(invoer, true),
      "Opslaan is niet gelukt.",
    );
  }

  async function weghalen() {
    setFout(null);
    await probeer(
      () => verwijder?.(false),
      () => verwijder?.(true),
      "Weghalen is niet gelukt.",
    );
    setZekerWeten(false);
  }

  async function probeer(
    gewoon: () => Promise<void> | undefined,
    metLosmaken: () => Promise<void> | undefined,
    melding: string,
  ) {
    setBezig(true);
    try {
      await gewoon();
    } catch (probleem) {
      const lijst = geraaktUit(probleem);
      if (lijst) {
        setGeraakt({
          lijst,
          doorgaan: async () => {
            setBezig(true);
            try {
              await metLosmaken();
            } catch (opnieuw) {
              setFout(meldingVan(opnieuw, melding));
              setGeraakt(null);
              setBezig(false);
            }
          },
        });
      } else {
        setFout(meldingVan(probleem, melding));
      }
      setBezig(false);
    }
  }

  if (geraakt) {
    return (
      <Losmaken
        geraakt={geraakt.lijst}
        bezig={bezig}
        doorgaan={() => void geraakt.doorgaan()}
        terug={() => setGeraakt(null)}
      />
    );
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
  titel?: string;
  kant: Kant;
  zet: (kant: Kant) => void;
  naamLabel: string;
  voorbeeld: string;
};

function KantVelden({ titel, kant, zet, naamLabel, voorbeeld }: KantProps) {
  function zetAantalRijen(aantal: number) {
    const rijen = kant.rijen.slice(0, aantal);
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
