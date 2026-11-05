import { useState } from "react";

import { Knop } from "../Knop";
import { Melding } from "../Melding";
import { Veld } from "../Veld";
import { meldingVan } from "../../data/api";
import type { Vak } from "../../data/plattegronden";

type Props = {
  vak: Vak;
  bewaar: (naam: string) => Promise<void>;
};

/** Een vak een naam geven of de naam weghalen (SW-21). */
export function VakVenster({ vak, bewaar }: Props) {
  const [naam, setNaam] = useState(vak.naam ?? "");
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  async function opslaan(nieuweNaam: string) {
    setFout(null);
    setBezig(true);
    try {
      await bewaar(nieuweNaam);
    } catch (probleem) {
      setFout(meldingVan(probleem, "Opslaan is niet gelukt."));
      setBezig(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void opslaan(naam);
      }}
      className="space-y-4"
      noValidate
    >
      {fout && <Melding tekst={fout} />}

      <Veld
        label="Naam van dit vak"
        waarde={naam}
        zet={setNaam}
        vereist={false}
        placeholder="Stelling B, plank 3"
        uitleg="Zoals je collega's het in de winkel noemen. Leeg laten mag: dan heet het vak gewoon naar zijn plek."
      />

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Knop type="submit" bezig={bezig}>
          Opslaan
        </Knop>
        {vak.naam && (
          <Knop soort="lijn" onClick={() => void opslaan("")}>
            Naam weghalen
          </Knop>
        )}
      </div>
    </form>
  );
}
