import { TriangleAlert } from "lucide-react";

import type { Advies, LetOp } from "../data/team";

const STANDAARD_AFPRIJS_DAGEN = 2;

function advies(regel: LetOp): { titel: string; tekst: string } {
  const teksten: Record<Advies, { titel: string; tekst: string }> = {
    NIET_VERKOCHT: {
      titel: "Wordt niet verkocht",
      tekst: "Alles is weggegooid. Bestel minder, of haal het uit het assortiment.",
    },
    AFPRIJZEN_HELPT_NIET: {
      titel: "Afprijzen helpt niet genoeg",
      tekst: "Het wordt wel afgeprijsd, maar toch vaak weggegooid. Bestel kleinere hoeveelheden.",
    },
    EERDER_AFPRIJZEN: {
      titel: "Eerder afprijzen",
      tekst: `Het wordt soms verkocht, maar vaak weggegooid. Prijs eerder af (nu ${
        regel.product.productgroep?.afprijsDagen ?? STANDAARD_AFPRIJS_DAGEN
      } dagen voor de datum) of bestel minder.`,
    },
  };
  return teksten[regel.advies];
}

export function LetOpLijst({ producten }: { producten: LetOp[] }) {
  return (
    <section aria-labelledby="let-op-titel" className="mt-8">
      <h2 id="let-op-titel" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
        <TriangleAlert aria-hidden="true" className="size-5 text-copperwood" />
        Let op
      </h2>
      <p className="mt-1 max-w-prose text-sm text-black-forest/70">
        Producten die in deze periode minstens 3 keer zijn afgemeld, waarvan de helft of meer is
        weggegooid.
      </p>

      {producten.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-black-forest/20 p-5 text-sm text-black-forest/70">
          Geen producten die opvallend vaak worden weggegooid.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {producten.map((regel) => {
            const { titel, tekst } = advies(regel);
            const totaal = regel.weggegooid + regel.uitverkocht + regel.gestickerd;
            return (
              <li key={regel.product.id} className="rounded-2xl border border-copperwood/40 bg-copperwood/5 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="font-bold">{regel.product.naam}</p>
                  <p className="text-sm font-semibold text-copperwood">
                    <span data-getal>{regel.weggegooid}</span> van <span data-getal>{totaal}</span> keer
                    weggegooid (<span data-getal>{Math.round(regel.aandeel * 100)}%</span>)
                  </p>
                </div>
                <p className="mt-0.5 text-xs text-black-forest/60">
                  {regel.product.productgroep?.naam ?? "Geen productgroep"} · gestickerd {regel.gestickerd} ·
                  uitverkocht {regel.uitverkocht}
                  {regel.stuksWeggegooid > 0 && ` · ${regel.stuksWeggegooid} stuks weggegooid`}
                </p>
                <p className="mt-3 text-sm">
                  <span className="font-semibold">{titel}.</span> {tekst}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
