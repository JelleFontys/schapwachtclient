import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Loader2, Map as MapIcoon, Ruler } from "lucide-react";

import { Balk } from "../components/Balk";
import { Knop } from "../components/Knop";
import { Melding } from "../components/Melding";
import { Venster } from "../components/Venster";
import { Kiezer } from "../components/plattegrond/Kiezer";
import { PlattegrondFormulier } from "../components/plattegrond/PlattegrondFormulier";
import { Raster } from "../components/plattegrond/Raster";
import { VakVenster } from "../components/plattegrond/VakVenster";
import { useSessie } from "../auth/authContext";
import { meldingVan } from "../data/api";
import { kort, plattegronden } from "../data/plattegronden";
import type { Afmetingen, Plattegrond, PlattegrondKort, Vak } from "../data/plattegronden";

type Open = "nieuw" | "aanpassen" | null;

/**
 * De plattegrond: het raster van de winkel, en wisselen tussen
 * plattegronden.
 *
 * Het id staat in de URL (/plattegrond/:id). Zo kun je een link naar
 * het magazijn delen, en blijft de keuze staan als je de pagina
 * herlaadt. Zonder id gaat de pagina door naar de eerste.
 */
export default function PlattegrondPagina() {
  const { id } = useParams();
  const navigeer = useNavigate();
  const { gebruiker } = useSessie();
  const magBeheren = gebruiker?.rol === "LEIDINGGEVENDE";

  const [lijst, setLijst] = useState<PlattegrondKort[] | null>(null);
  const [lijstFout, setLijstFout] = useState<string | null>(null);
  const [detail, setDetail] = useState<Plattegrond | null>(null);
  const [detailFout, setDetailFout] = useState<{ id: string; tekst: string } | null>(null);
  const [open, setOpen] = useState<Open>(null);
  const [gekozenVak, setGekozenVak] = useState<Vak | null>(null);

  useEffect(() => {
    let afgebroken = false;
    plattegronden
      .lijst()
      .then((gegevens) => {
        if (!afgebroken) setLijst(gegevens);
      })
      .catch((probleem: unknown) => {
        if (!afgebroken) setLijstFout(meldingVan(probleem, "De plattegronden laden niet."));
      });
    return () => {
      afgebroken = true;
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    let afgebroken = false;
    plattegronden
      .haal(id)
      .then((gegevens) => {
        if (!afgebroken) setDetail(gegevens);
      })
      .catch((probleem: unknown) => {
        if (!afgebroken) setDetailFout({ id, tekst: meldingVan(probleem) });
      });
    return () => {
      afgebroken = true;
    };
  }, [id]);

  // Wat er nu getoond wordt hoort bij het id in de URL. Bij wisselen
  // staat even de vorige nog in `detail`; die tonen we dan niet.
  const huidig = detail && detail.id === id ? detail : null;
  const fout = detailFout && detailFout.id === id ? detailFout.tekst : null;

  async function maakNieuw(gegevens: Afmetingen) {
    const nieuw = await plattegronden.maak(gegevens);
    setLijst((oud) => [...(oud ?? []), kort(nieuw)]);
    setDetail(nieuw);
    setOpen(null);
    navigeer(`/plattegrond/${nieuw.id}`);
  }

  async function pasAan(gegevens: Afmetingen) {
    if (!huidig) return;
    const nieuw = await plattegronden.wijzig(huidig.id, gegevens);
    setDetail(nieuw);
    setLijst((oud) => oud?.map((p) => (p.id === nieuw.id ? kort(nieuw) : p)) ?? null);
    setOpen(null);
  }

  async function hernoem(vak: Vak, naam: string) {
    const nieuw = await plattegronden.hernoemVak(vak.id, naam);
    setDetail((oud) =>
      oud ? { ...oud, vakken: oud.vakken.map((v) => (v.id === nieuw.id ? nieuw : v)) } : oud,
    );
    setGekozenVak(null);
  }

  // Geen id in de URL: door naar de eerste plattegrond.
  if (!id && lijst && lijst.length > 0) {
    return <Navigate to={`/plattegrond/${lijst[0].id}`} replace />;
  }

  return (
    <>
      <Balk />

      <main className="mx-auto max-w-5xl px-5 py-8 sm:py-10">
        {lijstFout && <Melding tekst={lijstFout} />}

        {!lijst && !lijstFout && <Laden tekst="Plattegronden laden" />}

        {lijst && lijst.length === 0 && (
          <Leeg magBeheren={magBeheren} maak={() => setOpen("nieuw")} />
        )}

        {lijst && lijst.length > 0 && (
          <>
            <Kiezer lijst={lijst} nieuw={magBeheren ? () => setOpen("nieuw") : undefined} />

            {fout && (
              <div className="mt-8 space-y-3">
                <Melding tekst={fout} />
                <Link
                  to="/plattegrond"
                  className="inline-block text-sm font-semibold text-olive-leaf hover:text-black-forest"
                >
                  Naar de eerste plattegrond
                </Link>
              </div>
            )}

            {!huidig && !fout && <Laden tekst="Raster laden" />}

            {huidig && (
              <section className="mt-8" aria-labelledby="plattegrond-titel">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h1 id="plattegrond-titel" className="text-3xl font-extrabold tracking-tight">
                      {huidig.naam}
                    </h1>
                    <p className="mt-1 text-sm text-black-forest/65">
                      <span data-getal>
                        {huidig.rijen} × {huidig.kolommen}
                      </span>{" "}
                      vakken · tik op een vak om het een naam te geven
                    </p>
                  </div>

                  {magBeheren && (
                    <div className="w-full sm:w-auto">
                      <Knop soort="lijn" onClick={() => setOpen("aanpassen")}>
                        <Ruler aria-hidden="true" className="size-4" />
                        Raster aanpassen
                      </Knop>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <Raster plattegrond={huidig} kies={setGekozenVak} />
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Venster open={open === "nieuw"} sluit={() => setOpen(null)} titel="Nieuwe plattegrond">
        <PlattegrondFormulier knoptekst="Plattegrond aanmaken" bewaar={maakNieuw} />
      </Venster>

      <Venster open={open === "aanpassen"} sluit={() => setOpen(null)} titel="Raster aanpassen">
        {huidig && (
          <PlattegrondFormulier knoptekst="Opslaan" huidig={huidig} bewaar={pasAan} />
        )}
      </Venster>

      <Venster
        open={gekozenVak !== null}
        sluit={() => setGekozenVak(null)}
        titel={gekozenVak ? `Vak ${gekozenVak.positie}` : "Vak"}
      >
        {gekozenVak && (
          <VakVenster vak={gekozenVak} bewaar={(naam) => hernoem(gekozenVak, naam)} />
        )}
      </Venster>
    </>
  );
}

function Laden({ tekst }: { tekst: string }) {
  return (
    <p className="mt-8 flex items-center gap-2 text-sm text-black-forest/60">
      <Loader2 aria-hidden="true" className="size-4 animate-spin" />
      {tekst}
    </p>
  );
}

function Leeg({ magBeheren, maak }: { magBeheren: boolean; maak: () => void }) {
  return (
    <section className="mx-auto max-w-md py-12 text-center">
      <MapIcoon aria-hidden="true" className="mx-auto size-10 text-olive-leaf" />
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Nog geen plattegrond</h1>

      {magBeheren ? (
        <>
          <p className="mt-2 leading-relaxed text-black-forest/70">
            Maak een raster dat lijkt op je winkel: elke rij een stelling, elke kolom een
            plank of een stuk schap. Je kunt het later altijd groter of kleiner maken.
          </p>
          <div className="mx-auto mt-6 max-w-60">
            <Knop onClick={maak}>Plattegrond aanmaken</Knop>
          </div>
        </>
      ) : (
        <p className="mt-2 leading-relaxed text-black-forest/70">
          Je leidinggevende kan een plattegrond van de winkel aanmaken. Daarna zie je hem
          hier.
        </p>
      )}
    </section>
  );
}
