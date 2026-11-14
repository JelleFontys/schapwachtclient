import { useCallback, useId, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MapPin, ScanBarcode } from "lucide-react";

import { Balk } from "../components/Balk";
import { Knop } from "../components/Knop";
import { Melding } from "../components/Melding";
import { Statusmerk } from "../components/Statusmerk";
import { Camera } from "../components/vak/Camera";
import { PartijFormulier } from "../components/vak/PartijFormulier";
import { PlekOpPlattegrond } from "../components/vak/PlekOpPlattegrond";
import { ProductFormulier } from "../components/vak/ProductFormulier";
import { meldingVan } from "../data/api";
import { kortDatum } from "../data/datum";
import { partijen } from "../data/partijen";
import { producten } from "../data/producten";
import type { Gescand, Product } from "../data/producten";

type Vak = { id: string; tekst: string };

export default function Scannen() {
  const [gescand, setGescand] = useState<Gescand | null>(null);
  const [zoekt, setZoekt] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [vak, setVak] = useState<Vak | null>(null);
  const [andereplek, setAndereplek] = useState(false);
  const [klaar, setKlaar] = useState<string | null>(null);

  const zoek = useCallback(async (code: string) => {
    setFout(null);
    setKlaar(null);
    setVak(null);
    setAndereplek(false);
    setZoekt(true);
    try {
      setGescand(await producten.opBarcode(code));
    } catch (probleem) {
      setFout(meldingVan(probleem));
    } finally {
      setZoekt(false);
    }
  }, []);

  const gevonden = useCallback((code: string) => void zoek(code), [zoek]);

  function opnieuw() {
    setGescand(null);
    setVak(null);
    setAndereplek(false);
    setKlaar(null);
    setFout(null);
  }

  return (
    <>
      <Balk />
      <main className="mx-auto max-w-xl px-5 pt-6 pb-28 sm:py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Scannen</h1>

        {klaar && (
          <div className="mt-6 space-y-4">
            <p role="status" className="rounded-xl bg-olive-leaf/10 px-4 py-3 font-semibold text-olive-leaf">
              {klaar}
            </p>
            <Knop onClick={opnieuw}>
              <ScanBarcode aria-hidden="true" className="size-4" />
              Volgende scannen
            </Knop>
          </div>
        )}

        {!klaar && !gescand && (
          <div className="mt-6 space-y-6">
            <p className="text-sm text-black-forest/70">
              Scan de streepjescode van een product, of typ de cijfers eronder over.
            </p>
            <Camera gevonden={gevonden} />
            <HandmatigeInvoer zoek={(code) => void zoek(code)} bezig={zoekt} />
            {zoekt && (
              <p className="flex items-center gap-2 text-sm text-black-forest/60">
                <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Zoeken
              </p>
            )}
          </div>
        )}

        {fout && <div className="mt-4"><Melding tekst={fout} /></div>}

        {!klaar && gescand && !gescand.product && (
          <section className="mt-6 space-y-4">
            {gescand.openbaar ? (
              <p className="rounded-xl border border-olive-leaf bg-olive-leaf/10 px-4 py-3 text-sm">
                Barcode <strong data-getal>{gescand.barcode}</strong> staat in de openbare database
                (Open Food Facts). Controleer de naam en kies een productgroep.
              </p>
            ) : (
              <p className="rounded-xl border border-sunlit-clay bg-sunlit-clay/15 px-4 py-3 text-sm">
                Barcode <strong data-getal>{gescand.barcode}</strong> is nog niet bekend.
                {!gescand.openbaarBereikbaar && " De openbare database was niet bereikbaar."} Vul de
                naam en de productgroep aan, dan voegen we het product toe.
              </p>
            )}
            <ProductFormulier
              key={gescand.barcode}
              begin={{ naam: gescand.openbaar?.naam ?? "", barcode: gescand.barcode, productgroepId: null }}
              barcodeVast
              knoptekst="Product toevoegen en doorgaan"
              bewaar={async (invoer) => {
                const product = await producten.maak({
                  ...invoer,
                  uitOpenbareDatabase: gescand.openbaar !== null,
                });
                setGescand({
                  barcode: gescand.barcode,
                  product,
                  plekken: [],
                  openbaar: null,
                  openbaarBereikbaar: true,
                });
              }}
              annuleer={opnieuw}
            />
          </section>
        )}

        {!klaar && gescand?.product && (
          <Bekend
            gescand={gescand as Gescand & { product: Product }}
            vak={vak}
            kiesVak={setVak}
            andereplek={andereplek}
            setAndereplek={setAndereplek}
            klaar={setKlaar}
            opnieuw={opnieuw}
          />
        )}
      </main>
    </>
  );
}

function HandmatigeInvoer({ zoek, bezig }: { zoek: (code: string) => void; bezig: boolean }) {
  const id = useId();
  const [code, setCode] = useState("");
  const [fout, setFout] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const schoon = code.replace(/\s+/g, "");
        if (!/^\d{8,14}$/.test(schoon)) return setFout("Een barcode bestaat uit 8 tot 14 cijfers.");
        setFout(null);
        zoek(schoon);
      }}
      className="space-y-2"
      noValidate
    >
      <label htmlFor={id} className="block text-sm font-semibold">
        Barcode intikken
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="8710400145301"
          className="min-w-0 flex-1 rounded-xl border border-black-forest/15 bg-white/60 px-3.5 py-2.5 focus:border-olive-leaf focus:bg-white focus:outline-none"
        />
        <div className="w-28">
          <Knop type="submit" bezig={bezig}>Zoeken</Knop>
        </div>
      </div>
      {fout && <p className="text-sm text-copperwood">{fout}</p>}
    </form>
  );
}

function Bekend({
  gescand,
  vak,
  kiesVak,
  andereplek,
  setAndereplek,
  klaar,
  opnieuw,
}: {
  gescand: Gescand & { product: Product };
  vak: Vak | null;
  kiesVak: (vak: Vak | null) => void;
  andereplek: boolean;
  setAndereplek: (aan: boolean) => void;
  klaar: (bericht: string) => void;
  opnieuw: () => void;
}) {
  const { product, plekken } = gescand;
  const kiesMaarEenPlek = plekken.length === 0 || andereplek;

  return (
    <section className="mt-6 space-y-5">
      <div className="rounded-2xl border border-olive-leaf bg-olive-leaf/10 p-4">
        <p className="text-lg font-extrabold">{product.naam}</p>
        <p className="text-sm text-black-forest/65">
          {product.productgroep?.naam ?? "Geen productgroep"} · <span data-getal>{gescand.barcode}</span>
        </p>
      </div>

      {vak ? (
        <div className="space-y-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <MapPin aria-hidden="true" className="size-4 text-olive-leaf" />
            {vak.tekst}
            <button type="button" onClick={() => kiesVak(null)} className="ml-2 text-olive-leaf">
              wijzigen
            </button>
          </p>
          <PartijFormulier
            product={product}
            knoptekst="Datum opslaan"
            bewaar={async ({ houdbaarTot, aantal }) => {
              await partijen.voegToe({ vakId: vak.id, productId: product.id, houdbaarTot, aantal });
              klaar(`${product.naam} met datum ${kortDatum(houdbaarTot)} staat in ${vak.tekst}.`);
            }}
          />
        </div>
      ) : (
        <>
          {plekken.length > 0 && !andereplek && (
            <div>
              <h2 className="text-sm font-bold text-black-forest/60">Hier ligt het nu</h2>
              <ul className="mt-2 space-y-2">
                {plekken.map((p) => (
                  <li key={p.vakId} className="flex items-center justify-between gap-3 rounded-xl border border-black-forest/10 bg-white/50 p-3">
                    <div className="min-w-0">
                      <Link to={`/stelling/${p.stellingId}`} className="font-semibold hover:text-olive-leaf">
                        {p.plattegrond} · {p.tekst}
                      </Link>
                      <p className="text-xs text-black-forest/60">vroegste datum {kortDatum(p.houdbaarTot)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <Statusmerk status={p.status} klein />
                      <button
                        type="button"
                        onClick={() => kiesVak({ id: p.vakId, tekst: p.tekst })}
                        className="text-sm font-semibold text-olive-leaf hover:text-black-forest"
                      >
                        Datum invullen
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setAndereplek(true)}
                className="mt-3 text-sm font-semibold text-olive-leaf hover:text-black-forest"
              >
                Op een andere plek neerzetten
              </button>
            </div>
          )}

          {kiesMaarEenPlek && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-black-forest/60">
                {plekken.length === 0 ? "Dit product ligt nog nergens. Kies een plek:" : "Kies een plek:"}
              </h2>
              <PlekOpPlattegrond kies={kiesVak} />
              {andereplek && plekken.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAndereplek(false)}
                  className="text-sm font-semibold text-olive-leaf hover:text-black-forest"
                >
                  Terug naar waar het nu ligt
                </button>
              )}
            </div>
          )}
        </>
      )}

      <button type="button" onClick={opnieuw} className="text-sm font-semibold text-black-forest/60 hover:text-black-forest">
        Iets anders scannen
      </button>
    </section>
  );
}
