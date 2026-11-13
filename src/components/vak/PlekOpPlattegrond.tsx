import { useEffect, useId, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";

import { Vloer } from "../plattegrond/Vloer";
import { KantWeergave } from "./KantWeergave";
import { meldingVan } from "../../data/api";
import { kantLabels, plattegronden, stellingen, stellingNaam } from "../../data/plattegronden";
import type { Plattegrond, PlattegrondKort, StellingInhoud } from "../../data/plattegronden";
import { leegVlak, statusOpmaak } from "../../data/statussen";

export type GekozenVak = { id: string; tekst: string };

type Props = {
  kies: (vak: GekozenVak) => void;
};

// Plek kiezen in vier stappen: plattegrond, stelling, kant, vak.
export function PlekOpPlattegrond({ kies }: Props) {
  const keuzeId = useId();
  const [lijst, setLijst] = useState<PlattegrondKort[] | null>(null);
  const [plattegrondId, setPlattegrondId] = useState("");
  const [plattegrond, setPlattegrond] = useState<Plattegrond | null>(null);
  const [stellingId, setStellingId] = useState<string | null>(null);
  const [inhoud, setInhoud] = useState<StellingInhoud | null>(null);
  const [kantId, setKantId] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    plattegronden
      .lijst()
      .then((l) => {
        setLijst(l);
        if (l.length === 1) setPlattegrondId(l[0].id);
      })
      .catch((p: unknown) => setFout(meldingVan(p)));
  }, []);

  useEffect(() => {
    if (!plattegrondId) return;
    let weg = false;
    plattegronden
      .haal(plattegrondId)
      .then((p) => !weg && setPlattegrond(p))
      .catch((p: unknown) => !weg && setFout(meldingVan(p)));
    return () => {
      weg = true;
    };
  }, [plattegrondId]);

  useEffect(() => {
    if (!stellingId) return;
    let weg = false;
    stellingen
      .inhoud(stellingId)
      .then((s) => !weg && setInhoud(s))
      .catch((p: unknown) => !weg && setFout(meldingVan(p)));
    return () => {
      weg = true;
    };
  }, [stellingId]);

  const huidigePlattegrond = plattegrond?.id === plattegrondId ? plattegrond : null;
  const huidigeInhoud = stellingId && inhoud?.id === stellingId ? inhoud : null;
  const eenKant = huidigeInhoud?.kanten.length === 1;
  const kant = huidigeInhoud
    ? eenKant
      ? huidigeInhoud.kanten[0]
      : (huidigeInhoud.kanten.find((k) => k.id === kantId) ?? null)
    : null;

  function naarVloer() {
    setStellingId(null);
    setKantId(null);
  }

  const laden = (tekst: string) => (
    <p className="flex items-center gap-2 text-sm text-black-forest/60">
      <Loader2 aria-hidden="true" className="size-4 animate-spin" />
      {tekst}
    </p>
  );

  if (fout) return <p className="text-sm text-copperwood">{fout}</p>;
  if (!lijst) return laden("Plattegronden laden");
  if (lijst.length === 0) {
    return (
      <p className="text-sm text-black-forest/70">
        Er is nog geen plattegrond. Maak er eerst een aan bij Plattegrond.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {lijst.length > 1 && (
        <div>
          <label htmlFor={keuzeId} className="text-sm font-semibold">
            Plattegrond
          </label>
          <select
            id={keuzeId}
            value={plattegrondId}
            onChange={(e) => {
              setPlattegrondId(e.target.value);
              naarVloer();
            }}
            className="mt-1 w-full rounded-xl border border-black-forest/15 bg-white/60 px-3 py-2 focus:border-olive-leaf focus:outline-none"
          >
            <option value="">Kies…</option>
            {lijst.map((p) => (
              <option key={p.id} value={p.id}>
                {p.naam}
              </option>
            ))}
          </select>
        </div>
      )}

      {huidigePlattegrond && (
        <nav aria-label="Waar ben je" className="flex flex-wrap items-center gap-1 text-sm font-semibold">
          <Kruimel actief={!stellingId} onClick={naarVloer}>
            {huidigePlattegrond.naam}
          </Kruimel>
          {huidigeInhoud && (
            <>
              <ChevronRight aria-hidden="true" className="size-4 text-black-forest/40" />
              <Kruimel actief={!kant} onClick={eenKant ? undefined : () => setKantId(null)}>
                {stellingNaam(huidigeInhoud)}
              </Kruimel>
            </>
          )}
          {kant && !eenKant && (
            <>
              <ChevronRight aria-hidden="true" className="size-4 text-black-forest/40" />
              <Kruimel actief>{kant.naam}</Kruimel>
            </>
          )}
        </nav>
      )}

      {plattegrondId && !huidigePlattegrond && laden("Plattegrond laden")}

      {huidigePlattegrond && !stellingId && (
        <div>
          <p className="text-sm text-black-forest/70">
            {huidigePlattegrond.stellingen.length === 0
              ? "Op deze plattegrond staan nog geen stellingen."
              : "Tik op de stelling waar het product ligt."}
          </p>
          <Vloer
            plattegrond={huidigePlattegrond}
            magBeheren={false}
            bezig={false}
            pasRandAan={() => {}}
            kiesVlak={() => {}}
            kiesStelling={(s) => {
              setKantId(null);
              setStellingId(s.id);
            }}
          />
        </div>
      )}

      {stellingId && !huidigeInhoud && laden("Stelling laden")}

      {huidigeInhoud && !kant && <KantenKiezen inhoud={huidigeInhoud} kies={setKantId} />}

      {kant && (
        <div className="space-y-3 motion-safe:animate-inzoomen">
          <p className="text-sm text-black-forest/70">Tik op het vak waar het product ligt.</p>
          <KantWeergave
            kant={kant}
            toonNaam={false}
            kies={(vak, rij) =>
              kies({ id: vak.id, tekst: `${kant.naam}, rij ${rij}, vak ${vak.positie}` })
            }
          />
        </div>
      )}
    </div>
  );
}

function Kruimel({
  actief,
  onClick,
  children,
}: {
  actief: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  if (actief || !onClick) {
    return (
      <span aria-current={actief ? "step" : undefined} className="text-black-forest">
        {children}
      </span>
    );
  }
  return (
    <button type="button" onClick={onClick} className="text-olive-leaf hover:text-black-forest hover:underline">
      {children}
    </button>
  );
}

function KantenKiezen({ inhoud, kies }: { inhoud: StellingInhoud; kies: (id: string) => void }) {
  const staand = inhoud.hoogte >= inhoud.breedte;
  const labels = kantLabels(inhoud);

  return (
    <div className="space-y-3">
      <p className="text-sm text-black-forest/70">Aan welke kant ligt het?</p>
      <div
        className={`mx-auto flex overflow-hidden rounded-xl border-2 border-black-forest/50 motion-safe:animate-inzoomen ${
          staand ? "h-72 max-w-sm flex-row" : "max-w-md flex-col"
        }`}
      >
        {inhoud.kanten.map((k, i) => {
          const opmaak = k.status ? statusOpmaak[k.status] : null;
          const Icoon = opmaak?.icoon;
          return (
            <button
              key={k.id}
              type="button"
              onClick={() => kies(k.id)}
              className={`flex flex-1 flex-col items-center justify-center gap-1.5 p-4 text-center transition-[filter]
                          hover:brightness-95 ${opmaak?.vlak ?? leegVlak} ${staand ? "" : "min-h-32"} ${
                            i > 0 ? (staand ? "border-l-2 border-black-forest/30" : "border-t-2 border-black-forest/30") : ""
                          }`}
            >
              <span className="text-xs font-bold tracking-wide uppercase opacity-70">
                {k.kant === "LINKS" ? labels.links : labels.rechts}
              </span>
              <span className="text-lg leading-tight font-extrabold">{k.naam}</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold">
                {Icoon && <Icoon aria-hidden="true" className="size-3.5" />}
                {opmaak ? opmaak.label : "Leeg"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
