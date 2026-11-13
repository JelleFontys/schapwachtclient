import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Settings2 } from "lucide-react";

import { Balk } from "../components/Balk";
import { Knop } from "../components/Knop";
import { Legenda } from "../components/Legenda";
import { Melding } from "../components/Melding";
import { Statusmerk } from "../components/Statusmerk";
import { Venster } from "../components/Venster";
import { StellingVenster } from "../components/plattegrond/StellingVenster";
import { KantWeergave } from "../components/vak/KantWeergave";
import { VakVenster } from "../components/vak/VakVenster";
import { useSessie } from "../auth/authContext";
import { meldingVan } from "../data/api";
import { dikte, stellingen, stellingNaam } from "../data/plattegronden";
import type { StellingInhoud } from "../data/plattegronden";
import { ernstigste } from "../data/ernstigste";

export default function StellingPagina() {
  const { id } = useParams();
  const navigeer = useNavigate();
  const { gebruiker } = useSessie();
  const magBeheren = gebruiker?.rol === "LEIDINGGEVENDE";

  const [inhoud, setInhoud] = useState<StellingInhoud | null>(null);
  const [fout, setFout] = useState<{ id: string; tekst: string } | null>(null);
  const [vakId, setVakId] = useState<string | null>(null);
  const [inrichten, setInrichten] = useState(false);

  useEffect(() => {
    if (!id) return;
    let weg = false;
    stellingen
      .inhoud(id)
      .then((i) => !weg && setInhoud(i))
      .catch((p: unknown) => !weg && setFout({ id, tekst: meldingVan(p) }));
    return () => {
      weg = true;
    };
  }, [id]);

  async function herlaad() {
    if (id) setInhoud(await stellingen.inhoud(id));
  }

  const huidig = inhoud?.id === id ? inhoud : null;
  const foutHier = fout && fout.id === id ? fout.tekst : null;
  const gekozenVak = vakId ? zoekVak(huidig, vakId) : null;
  const status = huidig ? ernstigste(huidig.kanten.map((k) => k.status)) : null;

  return (
    <>
      <Balk />

      <main className="mx-auto max-w-5xl px-5 pt-6 pb-28 sm:py-10">
        {huidig && (
          <Link
            to={`/plattegrond/${huidig.plattegrondId}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-olive-leaf hover:text-black-forest"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {huidig.plattegrond}
          </Link>
        )}

        {foutHier && <Melding tekst={foutHier} />}
        {!huidig && !foutHier && (
          <p className="mt-8 flex items-center gap-2 text-sm text-black-forest/60">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Stelling laden
          </p>
        )}

        {huidig && (
          <>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">{stellingNaam(huidig)}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {status ? (
                    <Statusmerk status={status} />
                  ) : (
                    <span className="text-sm text-black-forest/60">Nog niets in deze stelling</span>
                  )}
                  {magBeheren && (
                    <div className="w-auto">
                      <Knop soort="lijn" onClick={() => setInrichten(true)}>
                        <Settings2 aria-hidden="true" className="size-4" />
                        Stelling inrichten
                      </Knop>
                    </div>
                  )}
                </div>
              </div>
              <Legenda />
            </div>

            <p className="mt-4 text-sm text-black-forest/70">
              Tik op een vak om te zien wat erin ligt, iets toe te voegen of af te melden.
            </p>

            <div className="mt-6 space-y-10">
              {huidig.kanten.map((kant) => (
                <KantWeergave
                  key={kant.id}
                  kant={kant}
                  toonNaam={huidig.kanten.length > 1}
                  kies={(vak) => setVakId(vak.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <Venster
        open={gekozenVak !== null}
        sluit={() => setVakId(null)}
        titel={gekozenVak ? gekozenVak.titel : "Vak"}
      >
        {gekozenVak && <VakVenster key={gekozenVak.vak.id} vak={gekozenVak.vak} veranderd={herlaad} />}
      </Venster>

      {huidig && (
        <Venster
          open={inrichten}
          sluit={() => setInrichten(false)}
          titel="Stelling inrichten"
          breed={dikte(huidig) === 2}
        >
          <StellingVenster
            vlak={huidig}
            begin={{ links: huidig.links, rechts: huidig.rechts }}
            alleenLezen={false}
            bewaar={async (invoer, losmaken) => {
              await stellingen.wijzig(huidig.id, invoer, losmaken);
              await herlaad();
              setInrichten(false);
            }}
            verwijder={async (losmaken) => {
              await stellingen.verwijder(huidig.id, losmaken);
              navigeer(`/plattegrond/${huidig.plattegrondId}`, { replace: true });
            }}
          />
        </Venster>
      )}
    </>
  );
}

function zoekVak(inhoud: StellingInhoud | null, vakId: string) {
  for (const kant of inhoud?.kanten ?? []) {
    for (const rij of kant.rijen) {
      const vak = rij.vakken.find((v) => v.id === vakId);
      if (vak) return { vak, titel: `${kant.naam}, rij ${rij.nummer}, vak ${vak.positie}` };
    }
  }
  return null;
}
