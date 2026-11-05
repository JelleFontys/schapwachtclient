import { useState } from "react";
import { TriangleAlert } from "lucide-react";

import { Knop } from "../Knop";
import { Melding } from "../Melding";
import { Veld } from "../Veld";
import { meldingVan } from "../../data/api";
import { MAX_KOLOMMEN, MAX_RIJEN, rijLetter } from "../../data/plattegronden";
import type { Afmetingen } from "../../data/plattegronden";

type Props = {
  /** Bij aanpassen: hoe het raster nu is. Bij een nieuwe: leeg. */
  huidig?: Afmetingen;
  knoptekst: string;
  bewaar: (gegevens: Afmetingen) => Promise<void>;
};

/** Naam en afmetingen van een plattegrond (SW-19 en SW-22). */
export function PlattegrondFormulier({ huidig, knoptekst, bewaar }: Props) {
  const [naam, setNaam] = useState(huidig?.naam ?? "");
  const [rijen, setRijen] = useState(String(huidig?.rijen ?? 4));
  const [kolommen, setKolommen] = useState(String(huidig?.kolommen ?? 6));
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  const nieuweRijen = Number(rijen);
  const nieuweKolommen = Number(kolommen);
  const wegvallend = huidig ? telWegvallend(huidig, nieuweRijen, nieuweKolommen) : 0;

  async function verstuurFormulier(event: React.FormEvent) {
    event.preventDefault();
    setFout(null);
    setBezig(true);

    try {
      await bewaar({ naam, rijen: nieuweRijen, kolommen: nieuweKolommen });
    } catch (probleem) {
      setFout(meldingVan(probleem, "Opslaan is niet gelukt."));
      setBezig(false);
    }
  }

  return (
    <form onSubmit={verstuurFormulier} className="space-y-4" noValidate>
      {fout && <Melding tekst={fout} />}

      <Veld label="Naam" waarde={naam} zet={setNaam} placeholder="Winkel, Magazijn, Koeling" />

      <div className="grid grid-cols-2 gap-3">
        <Veld
          label="Rijen"
          type="number"
          waarde={rijen}
          zet={setRijen}
          min={1}
          max={MAX_RIJEN}
          uitleg={`A tot ${rijLetter(MAX_RIJEN)}`}
        />
        <Veld
          label="Kolommen"
          type="number"
          waarde={kolommen}
          zet={setKolommen}
          min={1}
          max={MAX_KOLOMMEN}
          uitleg={`1 tot ${MAX_KOLOMMEN}`}
        />
      </div>

      {/* Vooraf zeggen wat er gebeurt, in plaats van achteraf. De
          server houdt het tegen als er producten in die vakken liggen;
          dit is alleen om niemand te verrassen. */}
      {wegvallend > 0 && (
        <p className="flex items-start gap-2 rounded-xl border border-sunlit-clay bg-sunlit-clay/15 px-3.5 py-3 text-sm">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-copperwood" />
          <span>
            Er {wegvallend === 1 ? "valt 1 vak" : `vallen ${wegvallend} vakken`} weg, met hun
            naam. Liggen daar nog producten in, dan wordt het verkleinen tegengehouden.
          </span>
        </p>
      )}

      <Knop type="submit" bezig={bezig}>
        {knoptekst}
      </Knop>
    </form>
  );
}

function telWegvallend(huidig: Afmetingen, rijen: number, kolommen: number) {
  if (!Number.isInteger(rijen) || !Number.isInteger(kolommen) || rijen < 1 || kolommen < 1) {
    return 0;
  }
  const blijft = Math.min(rijen, huidig.rijen) * Math.min(kolommen, huidig.kolommen);
  return huidig.rijen * huidig.kolommen - blijft;
}
