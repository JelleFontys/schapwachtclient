import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Loader2, Map as MapIcoon, Pencil } from "lucide-react";

import { Balk } from "../components/Balk";
import { Knop } from "../components/Knop";
import { Melding } from "../components/Melding";
import { Venster } from "../components/Venster";
import { Legenda } from "../components/Legenda";
import { Kiezer } from "../components/plattegrond/Kiezer";
import { NaamFormulier } from "../components/plattegrond/NaamFormulier";
import { StellingVenster } from "../components/plattegrond/StellingVenster";
import { Vloer } from "../components/plattegrond/Vloer";
import { useSessie } from "../auth/authContext";
import { meldingVan } from "../data/api";
import { dikte, kort, plattegronden, stellingen } from "../data/plattegronden";
import type {
  Plattegrond,
  PlattegrondKort,
  Rand,
  RandActie,
  StellingInvoer,
  Vlak,
} from "../data/plattegronden";

type Open = "nieuw" | "hernoem" | null;

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
  const [nieuwVlak, setNieuwVlak] = useState<Vlak | null>(null);
  const [randBezig, setRandBezig] = useState(false);
  const [randFout, setRandFout] = useState<string | null>(null);

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

  const huidig = detail && detail.id === id ? detail : null;
  const fout = detailFout && detailFout.id === id ? detailFout.tekst : null;

  function neemOver(nieuw: Plattegrond) {
    setDetail(nieuw);
    setLijst((oud) => oud?.map((p) => (p.id === nieuw.id ? kort(nieuw) : p)) ?? null);
  }

  async function maakNieuw(naam: string) {
    const nieuw = await plattegronden.maak(naam);
    setLijst((oud) => [...(oud ?? []), kort(nieuw)]);
    setDetail(nieuw);
    setOpen(null);
    navigeer(`/plattegrond/${nieuw.id}`);
  }

  async function hernoem(naam: string) {
    if (!huidig) return;
    neemOver(await plattegronden.hernoem(huidig.id, naam));
    setOpen(null);
  }

  async function pasRandAan(rand: Rand, actie: RandActie) {
    if (!huidig) return;
    setRandFout(null);
    setRandBezig(true);
    try {
      neemOver(await plattegronden.rand(huidig.id, rand, actie));
    } catch (probleem) {
      setRandFout(meldingVan(probleem));
    } finally {
      setRandBezig(false);
    }
  }

  async function zetNeer(invoer: StellingInvoer) {
    if (!huidig || !nieuwVlak) return;
    const nieuw = await stellingen.maak(huidig.id, nieuwVlak, invoer);
    setDetail({ ...huidig, stellingen: [...huidig.stellingen, nieuw] });
    setNieuwVlak(null);
  }

  if (!id && lijst && lijst.length > 0) {
    return <Navigate to={`/plattegrond/${lijst[0].id}`} replace />;
  }

  return (
    <>
      <Balk />

      <main className="mx-auto max-w-5xl px-5 pt-8 pb-28 sm:py-10">
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

            {!huidig && !fout && <Laden tekst="Plattegrond laden" />}

            {huidig && (
              <section className="mt-8" aria-labelledby="plattegrond-titel">
                <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h1 id="plattegrond-titel" className="text-3xl font-extrabold tracking-tight">
                    {huidig.naam}
                  </h1>
                  {magBeheren && (
                    <button
                      type="button"
                      onClick={() => setOpen("hernoem")}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm
                                 font-semibold text-black-forest/60 hover:text-olive-leaf"
                    >
                      <Pencil aria-hidden="true" className="size-3.5" />
                      Naam wijzigen
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm text-black-forest/65">
                  <span data-getal>
                    {huidig.kolommen} × {huidig.rijen}
                  </span>{" "}
                  hokjes ·{" "}
                  {huidig.stellingen.length === 1
                    ? "1 stelling"
                    : `${huidig.stellingen.length} stellingen`}
                </p>
                <p className="mt-3 max-w-prose text-sm leading-relaxed text-black-forest/75">
                  {magBeheren
                    ? "Tik op twee hoeken om een stelling neer te zetten: 1 hokje dik voor één kant, 2 dik voor een linker- en rechterkant. Tik op een stelling om hem open te klappen. Met de plusjes maak je de vloer groter."
                    : "Tik op een stelling om te zien wat erin ligt."}
                </p>
                </div>
                <Legenda />
                </div>

                {randFout && (
                  <div className="mt-4">
                    <Melding tekst={randFout} />
                  </div>
                )}

                <div className="mt-6">
                  <Vloer
                    plattegrond={huidig}
                    magBeheren={magBeheren}
                    bezig={randBezig}
                    pasRandAan={(rand, actie) => void pasRandAan(rand, actie)}
                    kiesVlak={setNieuwVlak}
                    kiesStelling={(stelling) => navigeer(`/stelling/${stelling.id}`)}
                  />
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Venster open={open === "nieuw"} sluit={() => setOpen(null)} titel="Nieuwe plattegrond">
        <NaamFormulier knoptekst="Plattegrond aanmaken" bewaar={maakNieuw} />
      </Venster>

      <Venster open={open === "hernoem"} sluit={() => setOpen(null)} titel="Naam wijzigen">
        {huidig && <NaamFormulier begin={huidig.naam} knoptekst="Opslaan" bewaar={hernoem} />}
      </Venster>

      <Venster
        open={nieuwVlak !== null}
        sluit={() => setNieuwVlak(null)}
        titel="Nieuwe stelling"
        onder={nieuwVlak ? beschrijfVlak(nieuwVlak) : undefined}
        breed={nieuwVlak !== null && dikte(nieuwVlak) === 2}
      >
        {nieuwVlak && <StellingVenster vlak={nieuwVlak} alleenLezen={false} bewaar={zetNeer} />}
      </Venster>

    </>
  );
}

function beschrijfVlak(vlak: Vlak) {
  return `${vlak.breedte} × ${vlak.hoogte} hokjes, vanaf kolom ${vlak.x}, rij ${vlak.y}`;
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
            Een plattegrond is de vloer van je winkel van bovenaf. Je geeft hem een naam, en
            daarna zet je er de stellingen op.
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
