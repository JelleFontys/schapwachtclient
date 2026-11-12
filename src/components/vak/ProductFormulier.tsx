import { useEffect, useId, useState } from "react";

import { Knop } from "../Knop";
import { Melding } from "../Melding";
import { Veld } from "../Veld";
import { meldingVan } from "../../data/api";
import { productgroepen } from "../../data/producten";
import type { Productgroep, ProductInvoer } from "../../data/producten";

type Props = {
  begin?: ProductInvoer;
  barcodeVast?: boolean;
  knoptekst: string;
  bewaar: (invoer: ProductInvoer) => Promise<void>;
  annuleer?: () => void;
};

export function ProductFormulier({ begin, barcodeVast = false, knoptekst, bewaar, annuleer }: Props) {
  const groepId = useId();
  const [naam, setNaam] = useState(begin?.naam ?? "");
  const [barcode, setBarcode] = useState(begin?.barcode ?? "");
  const [productgroepId, setProductgroepId] = useState(begin?.productgroepId ?? "");
  const [groepen, setGroepen] = useState<Productgroep[]>([]);
  const [standaard, setStandaard] = useState(2);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  useEffect(() => {
    let afgebroken = false;
    productgroepen
      .lijst()
      .then((g) => {
        if (afgebroken) return;
        setGroepen(g.groepen);
        setStandaard(g.standaardAfprijsDagen);
      })
      .catch(() => {
      });
    return () => {
      afgebroken = true;
    };
  }, []);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setFout(null);
        setBezig(true);
        try {
          await bewaar({ naam, barcode, productgroepId: productgroepId || null });
        } catch (probleem) {
          setFout(meldingVan(probleem, "Opslaan is niet gelukt."));
          setBezig(false);
        }
      }}
      className="space-y-4"
      noValidate
    >
      {fout && <Melding tekst={fout} />}

      <Veld label="Naam" waarde={naam} zet={setNaam} placeholder="Halfvolle melk 1L" />

      {barcodeVast ? (
        <div>
          <p className="text-sm font-semibold">Barcode</p>
          <p data-getal className="mt-1 rounded-xl bg-black-forest/5 px-3.5 py-2.5 font-semibold">
            {barcode}
          </p>
        </div>
      ) : (
        <Veld
          label="Barcode"
          waarde={barcode}
          zet={setBarcode}
          vereist={false}
          uitleg="Niet verplicht. 8 tot 14 cijfers, van de streepjescode."
          placeholder="8710400145301"
        />
      )}

      <div>
        <label htmlFor={groepId} className="block text-sm font-semibold">
          Productgroep
        </label>
        <p className="mt-1 text-sm text-black-forest/60">
          Bepaalt hoeveel dagen voor de datum het product oranje wordt.
        </p>
        <select
          id={groepId}
          value={productgroepId}
          onChange={(e) => setProductgroepId(e.target.value)}
          className="mt-2 w-full rounded-xl border border-black-forest/15 bg-white/60 px-3 py-2.5
                     focus:border-olive-leaf focus:outline-none"
        >
          <option value="">Geen (standaard: {standaard} dagen)</option>
          {groepen.map((g) => (
            <option key={g.id} value={g.id}>
              {g.naam} ({g.afprijsDagen} {g.afprijsDagen === 1 ? "dag" : "dagen"})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <div className="sm:w-56">
          <Knop type="submit" bezig={bezig}>
            {knoptekst}
          </Knop>
        </div>
        {annuleer && (
          <div className="sm:w-32">
            <Knop soort="lijn" onClick={annuleer}>
              Annuleren
            </Knop>
          </div>
        )}
      </div>
    </form>
  );
}
