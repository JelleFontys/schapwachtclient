import { useEffect, useId, useState } from "react";
import { Loader2, Plus, Search, Trash2 } from "lucide-react";

import { Balk } from "../components/Balk";
import { Knop } from "../components/Knop";
import { Melding } from "../components/Melding";
import { Teller } from "../components/Teller";
import { Veld } from "../components/Veld";
import { Venster } from "../components/Venster";
import { ProductFormulier } from "../components/vak/ProductFormulier";
import { useSessie } from "../auth/authContext";
import { meldingVan } from "../data/api";
import { producten, productgroepen } from "../data/producten";
import type { Product, Productgroep } from "../data/producten";

type Tab = "producten" | "groepen";

export default function Producten() {
  const [tab, setTab] = useState<Tab>("producten");

  return (
    <>
      <Balk />
      <main className="mx-auto max-w-3xl px-5 pt-6 pb-28 sm:py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Producten</h1>

        <div role="tablist" aria-label="Wat tonen" className="mt-6 flex gap-2">
          {(
            [
              ["producten", "Producten"],
              ["groepen", "Productgroepen en afprijsregels"],
            ] as const
          ).map(([waarde, label]) => (
            <button
              key={waarde}
              type="button"
              role="tab"
              aria-selected={tab === waarde}
              onClick={() => setTab(waarde)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                tab === waarde
                  ? "border-olive-leaf bg-olive-leaf text-cornsilk"
                  : "border-black-forest/15 hover:border-olive-leaf hover:text-olive-leaf"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6">{tab === "producten" ? <ProductLijst /> : <Groepen />}</div>
      </main>
    </>
  );
}

function ProductLijst() {
  const zoekId = useId();
  const { gebruiker } = useSessie();
  const magVerwijderen = gebruiker?.rol === "LEIDINGGEVENDE";

  const [zoek, setZoek] = useState("");
  const [lijst, setLijst] = useState<Product[] | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [open, setOpen] = useState<Product | "nieuw" | null>(null);
  const [versie, setVersie] = useState(0);

  useEffect(() => {
    let weg = false;
    const wacht = setTimeout(() => {
      producten
        .lijst(zoek.trim())
        .then((l) => !weg && setLijst(l))
        .catch((p: unknown) => !weg && setFout(meldingVan(p)));
    }, 200);
    return () => {
      weg = true;
      clearTimeout(wacht);
    };
  }, [zoek, versie]);

  const klaar = () => {
    setOpen(null);
    setVersie((v) => v + 1);
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor={zoekId} className="sr-only">Zoeken</label>
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-black-forest/40" />
          <input
            id={zoekId}
            type="search"
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            placeholder="Zoek op naam of barcode"
            className="w-full rounded-xl border border-black-forest/15 bg-white/60 py-2.5 pr-3 pl-9 focus:border-olive-leaf focus:bg-white focus:outline-none"
          />
        </div>
        <div className="sm:w-48">
          <Knop onClick={() => setOpen("nieuw")}>
            <Plus aria-hidden="true" className="size-4" />
            Nieuw product
          </Knop>
        </div>
      </div>

      {fout && <div className="mt-4"><Melding tekst={fout} /></div>}
      {!lijst && !fout && (
        <p className="mt-6 flex items-center gap-2 text-sm text-black-forest/60">
          <Loader2 aria-hidden="true" className="size-4 animate-spin" /> Laden
        </p>
      )}

      {lijst && lijst.length === 0 && (
        <p className="mt-6 text-sm text-black-forest/70">
          {zoek ? "Niets gevonden." : "Nog geen producten. Voeg er een toe, of scan een product."}
        </p>
      )}

      <ul className="mt-4 divide-y divide-black-forest/10 rounded-2xl border border-black-forest/10 bg-white/40">
        {lijst?.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setOpen(p)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-olive-leaf/5"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold">{p.naam}</span>
                <span className="block text-xs text-black-forest/60">
                  {p.productgroep?.naam ?? "Geen productgroep"} · oranje {p.afprijsDagen}{" "}
                  {p.afprijsDagen === 1 ? "dag" : "dagen"} voor de datum
                </span>
              </span>
              <span data-getal className="shrink-0 text-xs text-black-forest/50">{p.barcode ?? "geen barcode"}</span>
            </button>
          </li>
        ))}
      </ul>

      <Venster open={open === "nieuw"} sluit={() => setOpen(null)} titel="Nieuw product">
        <ProductFormulier
          knoptekst="Product toevoegen"
          bewaar={async (invoer) => {
            await producten.maak(invoer);
            klaar();
          }}
        />
      </Venster>

      <Venster
        open={open !== null && open !== "nieuw"}
        sluit={() => setOpen(null)}
        titel={open && open !== "nieuw" ? open.naam : "Product"}
      >
        {open && open !== "nieuw" && (
          <ProductBewerken product={open} magVerwijderen={magVerwijderen} klaar={klaar} />
        )}
      </Venster>
    </>
  );
}

function ProductBewerken({
  product,
  magVerwijderen,
  klaar,
}: {
  product: Product;
  magVerwijderen: boolean;
  klaar: () => void;
}) {
  const [fout, setFout] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <ProductFormulier
        begin={{ naam: product.naam, barcode: product.barcode ?? "", productgroepId: product.productgroep?.id ?? null }}
        knoptekst="Opslaan"
        bewaar={async (invoer) => {
          await producten.wijzig(product.id, invoer);
          klaar();
        }}
      />
      {magVerwijderen && (
        <div className="border-t border-black-forest/10 pt-4">
          {fout && <p className="mb-2 text-sm text-copperwood">{fout}</p>}
          <button
            type="button"
            onClick={async () => {
              try {
                await producten.verwijder(product.id);
                klaar();
              } catch (p) {
                setFout(meldingVan(p));
              }
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-black-forest/70 hover:text-copperwood"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Product weghalen
          </button>
        </div>
      )}
    </div>
  );
}

function Groepen() {
  const { gebruiker } = useSessie();
  const magBeheren = gebruiker?.rol === "LEIDINGGEVENDE";

  const [gegevens, setGegevens] = useState<{ standaardAfprijsDagen: number; groepen: Productgroep[] } | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [open, setOpen] = useState<Productgroep | "nieuw" | null>(null);
  const [versie, setVersie] = useState(0);

  useEffect(() => {
    let weg = false;
    productgroepen
      .lijst()
      .then((g) => !weg && setGegevens(g))
      .catch((p: unknown) => !weg && setFout(meldingVan(p)));
    return () => {
      weg = true;
    };
  }, [versie]);

  const klaar = () => {
    setOpen(null);
    setVersie((v) => v + 1);
  };

  return (
    <>
      <p className="max-w-prose text-sm leading-relaxed text-black-forest/75">
        De afprijsregel is hoeveel dagen voor de houdbaarheidsdatum een product oranje wordt.
        Producten zonder productgroep worden {gegevens?.standaardAfprijsDagen ?? 2} dagen van
        tevoren oranje.
        {!magBeheren && " Alleen de leidinggevende kan de regels aanpassen."}
      </p>

      {fout && <div className="mt-4"><Melding tekst={fout} /></div>}

      <ul className="mt-4 divide-y divide-black-forest/10 rounded-2xl border border-black-forest/10 bg-white/40">
        {gegevens?.groepen.map((g) => (
          <li key={g.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="min-w-0">
              <span className="block font-semibold">{g.naam}</span>
              <span className="block text-xs text-black-forest/60">
                {g.aantalProducten ?? 0} {g.aantalProducten === 1 ? "product" : "producten"}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <span data-getal className="text-sm font-semibold">
                {g.afprijsDagen} {g.afprijsDagen === 1 ? "dag" : "dagen"}
              </span>
              {magBeheren && (
                <button type="button" onClick={() => setOpen(g)} className="text-sm font-semibold text-olive-leaf hover:text-black-forest">
                  Wijzigen
                </button>
              )}
            </span>
          </li>
        ))}
        {gegevens && gegevens.groepen.length === 0 && (
          <li className="px-4 py-3 text-sm text-black-forest/60">Nog geen productgroepen.</li>
        )}
      </ul>

      {magBeheren && (
        <div className="mt-4 sm:w-60">
          <Knop soort="lijn" onClick={() => setOpen("nieuw")}>
            <Plus aria-hidden="true" className="size-4" />
            Nieuwe productgroep
          </Knop>
        </div>
      )}

      <Venster
        open={open !== null}
        sluit={() => setOpen(null)}
        titel={open === "nieuw" ? "Nieuwe productgroep" : open ? open.naam : ""}
      >
        {open && (
          <GroepFormulier
            groep={open === "nieuw" ? null : open}
            standaard={gegevens?.standaardAfprijsDagen ?? 2}
            klaar={klaar}
          />
        )}
      </Venster>
    </>
  );
}

function GroepFormulier({
  groep,
  standaard,
  klaar,
}: {
  groep: Productgroep | null;
  standaard: number;
  klaar: () => void;
}) {
  const [naam, setNaam] = useState(groep?.naam ?? "");
  const [dagen, setDagen] = useState(groep?.afprijsDagen ?? standaard);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  async function doe(actie: () => Promise<unknown>) {
    setFout(null);
    setBezig(true);
    try {
      await actie();
      klaar();
    } catch (p) {
      setFout(meldingVan(p));
      setBezig(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void doe(() =>
          groep
            ? productgroepen.wijzig(groep.id, { naam, afprijsDagen: dagen })
            : productgroepen.maak(naam, dagen),
        );
      }}
      className="space-y-4"
      noValidate
    >
      {fout && <Melding tekst={fout} />}
      <Veld label="Naam" waarde={naam} zet={setNaam} placeholder="Zuivel" />
      <Teller label="Hoeveel dagen voor de datum oranje?" waarde={dagen} zet={setDagen} min={0} max={365} />
      <p className="text-sm text-black-forest/65">
        {dagen === 0
          ? "Alleen op de dag zelf oranje, de dag erna rood."
          : `Oranje vanaf ${dagen} ${dagen === 1 ? "dag" : "dagen"} voor de datum, rood vanaf de dag erna.`}
      </p>
      <Knop type="submit" bezig={bezig}>
        {groep ? "Opslaan" : "Productgroep toevoegen"}
      </Knop>
      {groep && (
        <button
          type="button"
          onClick={() => void doe(() => productgroepen.verwijder(groep.id))}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-black-forest/70 hover:text-copperwood"
        >
          <Trash2 aria-hidden="true" className="size-4" />
          Productgroep weghalen (producten vallen terug op {standaard} dagen)
        </button>
      )}
    </form>
  );
}
