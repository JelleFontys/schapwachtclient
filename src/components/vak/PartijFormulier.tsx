import { useId, useState } from "react";
import { TriangleAlert } from "lucide-react";

import { Knop } from "../Knop";
import { Melding } from "../Melding";
import { Veld } from "../Veld";
import { ProductKiezer } from "./ProductKiezer";
import { meldingVan } from "../../data/api";
import { dagenTussen, langDatum, vandaag } from "../../data/datum";
import type { Product } from "../../data/producten";

export type NieuwePartij = { product: Product; houdbaarTot: string; aantal: number | null };

type Props = {
  product?: Product;
  knoptekst?: string;
  bewaar: (partij: NieuwePartij) => Promise<void>;
};

export function PartijFormulier({ product: vast, knoptekst = "Toevoegen", bewaar }: Props) {
  const datumId = useId();
  const [product, setProduct] = useState<Product | null>(vast ?? null);
  const [datum, setDatum] = useState("");
  const [aantal, setAantal] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [verledenBevestigd, setVerledenBevestigd] = useState(false);

  const inHetVerleden = datum !== "" && dagenTussen(vandaag(), datum) < 0;

  async function verstuur(event: React.FormEvent) {
    event.preventDefault();
    setFout(null);

    if (!product) return setFout("Kies eerst een product.");
    if (!datum) return setFout("Vul de houdbaarheidsdatum in.");
    if (inHetVerleden && !verledenBevestigd) return setVerledenBevestigd(true);

    const getal = aantal.trim() === "" ? null : Number(aantal);
    if (getal !== null && (!Number.isInteger(getal) || getal < 1)) {
      return setFout("Het aantal moet een heel getal van 1 of meer zijn, of leeg.");
    }

    setBezig(true);
    try {
      await bewaar({ product, houdbaarTot: datum, aantal: getal });
    } catch (probleem) {
      setFout(meldingVan(probleem, "Toevoegen is niet gelukt."));
      setBezig(false);
    }
  }

  return (
    <div className="space-y-4">
      {fout && <Melding tekst={fout} />}

      {vast ? (
        <div className="rounded-xl border border-olive-leaf bg-olive-leaf/10 px-3.5 py-2.5">
          <p className="font-semibold">{vast.naam}</p>
        </div>
      ) : (
        <ProductKiezer gekozen={product} kies={setProduct} />
      )}

      <form onSubmit={verstuur} className="space-y-4" noValidate>
        <div>
          <label htmlFor={datumId} className="block text-sm font-semibold">
            Houdbaar tot
          </label>
          <input
            id={datumId}
            type="date"
            value={datum}
            onChange={(e) => {
              setDatum(e.target.value);
              setVerledenBevestigd(false);
            }}
            className="mt-2 w-full rounded-xl border border-black-forest/15 bg-white/60 px-3.5 py-2.5
                       focus:border-olive-leaf focus:bg-white focus:outline-none"
          />
        </div>

        {inHetVerleden && verledenBevestigd && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-sunlit-clay bg-sunlit-clay/15 px-3.5 py-3 text-sm"
          >
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-copperwood" />
            <span>
              {langDatum(datum)} is al geweest. Klopt dat? Dan wordt dit meteen rood. Druk nog een
              keer op de knop om het zo op te slaan.
            </span>
          </p>
        )}

        <Veld
          label="Aantal"
          type="number"
          waarde={aantal}
          zet={setAantal}
          vereist={false}
          min={1}
          uitleg="Niet verplicht. Het is een schatting: de kassa weet niet welke datum er verkocht wordt."
        />

        <Knop type="submit" bezig={bezig}>
          {inHetVerleden && verledenBevestigd ? "Ja, toch opslaan" : knoptekst}
        </Knop>
      </form>
    </div>
  );
}
