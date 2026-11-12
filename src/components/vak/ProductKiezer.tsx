import { useEffect, useId, useState } from "react";
import { Check, Plus, Search } from "lucide-react";

import { meldingVan } from "../../data/api";
import { producten } from "../../data/producten";
import type { Product } from "../../data/producten";
import { ProductFormulier } from "./ProductFormulier";

type Props = {
  gekozen: Product | null;
  kies: (product: Product | null) => void;
};

/**
 * Een product kiezen uit het assortiment, of er meteen een toevoegen als
 * het er nog niet in staat. Zoeken kan op naam en op (het begin van) de
 * barcode.
 */
export function ProductKiezer({ gekozen, kies }: Props) {
  const id = useId();
  const [zoek, setZoek] = useState("");
  const [lijst, setLijst] = useState<Product[] | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [nieuw, setNieuw] = useState(false);

  useEffect(() => {
    if (gekozen) return;
    let afgebroken = false;
    // Even wachten met zoeken tot iemand stopt met typen, anders gaat er
    // bij elke letter een verzoek naar de server.
    const wacht = setTimeout(() => {
      producten
        .lijst(zoek.trim())
        .then((gevonden) => {
          if (!afgebroken) setLijst(gevonden);
        })
        .catch((probleem: unknown) => {
          if (!afgebroken) setFout(meldingVan(probleem));
        });
    }, 200);
    return () => {
      afgebroken = true;
      clearTimeout(wacht);
    };
  }, [zoek, gekozen]);

  if (gekozen) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-olive-leaf bg-olive-leaf/10 px-3.5 py-2.5">
        <div className="min-w-0">
          <p className="truncate font-semibold">{gekozen.naam}</p>
          <p className="text-xs text-black-forest/60">
            {gekozen.productgroep?.naam ?? "Geen productgroep"} · oranje vanaf{" "}
            {gekozen.afprijsDagen} {gekozen.afprijsDagen === 1 ? "dag" : "dagen"} voor de datum
          </p>
        </div>
        <button
          type="button"
          onClick={() => kies(null)}
          className="shrink-0 text-sm font-semibold text-olive-leaf hover:text-black-forest"
        >
          Ander product
        </button>
      </div>
    );
  }

  if (nieuw) {
    return (
      <div className="rounded-xl border border-black-forest/10 p-4">
        <p className="mb-3 text-sm font-bold">Nieuw product</p>
        <ProductFormulier
          begin={{ naam: zoek, barcode: /^\d+$/.test(zoek) ? zoek : "", productgroepId: null }}
          knoptekst="Toevoegen en kiezen"
          bewaar={async (invoer) => kies(await producten.maak(invoer))}
          annuleer={() => setNieuw(false)}
        />
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        Product
      </label>
      <div className="relative mt-2">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-black-forest/40"
        />
        <input
          id={id}
          type="search"
          value={zoek}
          onChange={(e) => setZoek(e.target.value)}
          placeholder="Zoek op naam of barcode"
          className="w-full rounded-xl border border-black-forest/15 bg-white/60 py-2.5 pr-3 pl-9
                     focus:border-olive-leaf focus:bg-white focus:outline-none"
        />
      </div>

      {fout && <p className="mt-2 text-sm text-copperwood">{fout}</p>}

      <ul className="mt-2 max-h-56 divide-y divide-black-forest/10 overflow-y-auto rounded-xl border border-black-forest/10">
        {lijst?.slice(0, 50).map((product) => (
          <li key={product.id}>
            <button
              type="button"
              onClick={() => kies(product)}
              className="flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left hover:bg-olive-leaf/10"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{product.naam}</span>
                <span className="block text-xs text-black-forest/55">
                  {product.productgroep?.naam ?? "Geen productgroep"}
                  {product.barcode && ` · ${product.barcode}`}
                </span>
              </span>
              <Check aria-hidden="true" className="size-4 shrink-0 text-black-forest/25" />
            </button>
          </li>
        ))}
        {lijst && lijst.length === 0 && (
          <li className="px-3.5 py-2.5 text-sm text-black-forest/60">Geen product gevonden.</li>
        )}
      </ul>

      <button
        type="button"
        onClick={() => setNieuw(true)}
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-olive-leaf hover:text-black-forest"
      >
        <Plus aria-hidden="true" className="size-4" />
        Staat er niet tussen? Nieuw product
      </button>
    </div>
  );
}
