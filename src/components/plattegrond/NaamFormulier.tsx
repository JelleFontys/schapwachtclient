import { useState } from "react";

import { Knop } from "../Knop";
import { Melding } from "../Melding";
import { Veld } from "../Veld";
import { meldingVan } from "../../data/api";

type Props = {
  begin?: string;
  knoptekst: string;
  bewaar: (naam: string) => Promise<void>;
};

/**
 * Alleen een naam. Een nieuwe plattegrond begint als lege vloer van
 * standaardgrootte; de afmetingen regel je daarna met de plusjes.
 */
export function NaamFormulier({ begin = "", knoptekst, bewaar }: Props) {
  const [naam, setNaam] = useState(begin);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setFout(null);
        setBezig(true);
        try {
          await bewaar(naam);
        } catch (probleem) {
          setFout(meldingVan(probleem, "Opslaan is niet gelukt."));
          setBezig(false);
        }
      }}
      className="space-y-4"
      noValidate
    >
      {fout && <Melding tekst={fout} />}
      <Veld label="Naam" waarde={naam} zet={setNaam} placeholder="Winkel, Magazijn, Koeling" />
      <Knop type="submit" bezig={bezig}>
        {knoptekst}
      </Knop>
    </form>
  );
}
