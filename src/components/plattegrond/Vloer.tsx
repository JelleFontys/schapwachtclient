import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Minus, Plus } from "lucide-react";

import {
  kantLabels,
  overlappen,
  raaktRand,
  stellingNaam,
  tussen,
} from "../../data/plattegronden";
import type { Plattegrond, Rand, RandActie, Stelling, Vlak } from "../../data/plattegronden";

type Punt = { x: number; y: number };

type Props = {
  plattegrond: Plattegrond;
  magBeheren: boolean;
  /** Loopt er een verzoek voor een rand? Dan even niet nog een keer. */
  bezig: boolean;
  pasRandAan: (rand: Rand, actie: RandActie) => void;
  kiesVlak: (vlak: Vlak) => void;
  kiesStelling: (stelling: Stelling) => void;
};

/**
 * De vloer van bovenaf: een raster van hokjes met de stellingen erop,
 * en aan elke kant een plusje om het raster groter te maken.
 *
 * Een stelling zet je neer door twee hoeken aan te tikken. Niet slepen:
 * slepen botst op een telefoon met scrollen, en met een toetsenbord kun
 * je niet slepen. Twee keer tikken werkt met muis, vinger en toetsenbord
 * hetzelfde.
 */
export function Vloer({ plattegrond, magBeheren, bezig, pasRandAan, kiesVlak, kiesStelling }: Props) {
  const raster = useRef<HTMLDivElement>(null);
  const [anker, setAnker] = useState<Punt | null>(null);
  const [wijst, setWijst] = useState<Punt | null>(null);
  const [actief, setActief] = useState<Punt>({ x: 1, y: 1 });
  const [melding, setMelding] = useState<{ tekst: string; fout: boolean } | null>(null);

  const { rijen, kolommen, stellingen } = plattegrond;

  const bezet = new Set<string>();
  for (const s of stellingen) {
    for (let y = s.y; y < s.y + s.hoogte; y++) {
      for (let x = s.x; x < s.x + s.breedte; x++) bezet.add(`${x}:${y}`);
    }
  }
  const vrij = (p: Punt) =>
    p.x >= 1 && p.y >= 1 && p.x <= kolommen && p.y <= rijen && !bezet.has(`${p.x}:${p.y}`);

  // Welk hokje met Tab bereikbaar is. Is het actieve hokje net bezet
  // geraakt door een nieuwe stelling, dan het eerste vrije.
  const tabHokje = vrij(actief) ? actief : eersteVrije(rijen, kolommen, vrij);

  const voorbeeld = anker && wijst ? tussen(anker, wijst) : null;
  const botst = voorbeeld ? stellingen.some((s) => overlappen(voorbeeld, s)) : false;

  function tik(punt: Punt) {
    if (!anker) {
      setAnker(punt);
      setMelding({ tekst: "Hoek gekozen. Tik nu op de andere hoek van de stelling.", fout: false });
      return;
    }

    const vlak = tussen(anker, punt);
    setAnker(null);

    if (stellingen.some((s) => overlappen(vlak, s))) {
      setMelding({ tekst: "Een stelling mag niet over een andere heen. Kies opnieuw.", fout: true });
      return;
    }

    setMelding(null);
    kiesVlak(vlak);
  }

  function stop() {
    setAnker(null);
    setMelding(null);
  }

  /** Pijltjestoetsen: naar het volgende vrije hokje in die richting. */
  function toets(event: KeyboardEvent, punt: Punt) {
    const richting = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[
      event.key
    ];
    if (event.key === "Escape") {
      stop();
      return;
    }
    if (!richting) return;

    event.preventDefault();
    let volgende = { x: punt.x + richting[0], y: punt.y + richting[1] };
    while (volgende.x >= 1 && volgende.y >= 1 && volgende.x <= kolommen && volgende.y <= rijen) {
      if (vrij(volgende)) {
        setActief(volgende);
        raster.current
          ?.querySelector<HTMLElement>(`[data-hokje="${volgende.x}:${volgende.y}"]`)
          ?.focus();
        return;
      }
      volgende = { x: volgende.x + richting[0], y: volgende.y + richting[1] };
    }
  }

  const randKnoppen = (rand: Rand) =>
    magBeheren && (
      <RandKnoppen
        rand={rand}
        bezig={bezig}
        kanEraf={
          (rand === "boven" || rand === "onder" ? rijen : kolommen) > 1 &&
          !stellingen.some((s) => raaktRand(s, rand, plattegrond))
        }
        pasAan={(actie) => pasRandAan(rand, actie)}
      />
    );

  const hokjes = [];
  for (let y = 1; y <= rijen; y++) {
    for (let x = 1; x <= kolommen; x++) {
      if (bezet.has(`${x}:${y}`)) continue;
      const isAnker = anker?.x === x && anker?.y === y;
      const plek = { gridColumn: x, gridRow: y };

      hokjes.push(
        magBeheren ? (
          <button
            key={`${x}:${y}`}
            type="button"
            data-hokje={`${x}:${y}`}
            style={plek}
            tabIndex={tabHokje?.x === x && tabHokje?.y === y ? 0 : -1}
            aria-label={`Rij ${y}, kolom ${x}${isAnker ? ", gekozen als hoek" : ""}`}
            aria-pressed={isAnker}
            onClick={() => tik({ x, y })}
            onKeyDown={(event) => toets(event, { x, y })}
            onFocus={() => {
              setActief({ x, y });
              setWijst({ x, y });
            }}
            onPointerEnter={() => setWijst({ x, y })}
            className={`bg-cornsilk transition-colors hover:bg-olive-leaf/15 focus-visible:relative
                        focus-visible:z-30 ${isAnker ? "bg-olive-leaf/40" : ""}`}
          />
        ) : (
          <div key={`${x}:${y}`} style={plek} className="bg-cornsilk" />
        ),
      );
    }
  }

  return (
    <div>
      {/* `relative` is nodig: zonder gepositioneerde ouder ontsnapt de
          verborgen tekst voor schermlezers aan dit scrollkader, en dan
          wordt op een telefoon de hele pagina te breed. */}
      <div className="relative -mx-5 overflow-x-auto px-5 pb-2">
        <div
          className="mx-auto grid w-max grid-cols-[auto_auto_auto] items-center gap-1.5
                     [--cel:1.625rem] sm:[--cel:2rem]"
        >
          <span />
          <div className="flex justify-center">{randKnoppen("boven")}</div>
          <span />

          <div className="flex items-center">{randKnoppen("links")}</div>

          <div
            ref={raster}
            role="group"
            aria-label={`Plattegrond ${plattegrond.naam}, ${kolommen} hokjes breed en ${rijen} hoog`}
            onPointerLeave={() => setWijst(null)}
            className="grid gap-px rounded-md border border-black-forest/15 bg-black-forest/15"
            style={{
              gridTemplateColumns: `repeat(${kolommen}, var(--cel))`,
              gridTemplateRows: `repeat(${rijen}, var(--cel))`,
            }}
          >
            {hokjes}

            {stellingen.map((stelling) => (
              <StellingBlok key={stelling.id} stelling={stelling} kies={kiesStelling} />
            ))}

            {voorbeeld && (
              <div
                aria-hidden="true"
                style={{
                  gridColumn: `${voorbeeld.x} / span ${voorbeeld.breedte}`,
                  gridRow: `${voorbeeld.y} / span ${voorbeeld.hoogte}`,
                }}
                className={`pointer-events-none z-20 rounded-sm border-2 border-dashed ${
                  botst
                    ? "border-copperwood bg-copperwood/20"
                    : "border-olive-leaf bg-olive-leaf/20"
                }`}
              />
            )}
          </div>

          <div className="flex items-center">{randKnoppen("rechts")}</div>

          <span />
          <div className="flex justify-center">{randKnoppen("onder")}</div>
          <span />
        </div>
      </div>

      <p
        aria-live="polite"
        className={`mt-3 min-h-5 text-sm ${melding?.fout ? "text-copperwood" : "text-black-forest/70"}`}
      >
        {melding?.tekst}
        {anker && (
          <button
            type="button"
            onClick={stop}
            className="ml-2 font-semibold text-olive-leaf underline-offset-2 hover:underline"
          >
            Stoppen
          </button>
        )}
      </p>
    </div>
  );
}

function eersteVrije(rijen: number, kolommen: number, vrij: (p: Punt) => boolean) {
  for (let y = 1; y <= rijen; y++) {
    for (let x = 1; x <= kolommen; x++) if (vrij({ x, y })) return { x, y };
  }
  return null;
}

function RandKnoppen({
  rand,
  bezig,
  kanEraf,
  pasAan,
}: {
  rand: Rand;
  bezig: boolean;
  kanEraf: boolean;
  pasAan: (actie: RandActie) => void;
}) {
  const staand = rand === "links" || rand === "rechts";
  const wat = staand ? "kolom" : "rij";
  const kant = { boven: "bovenkant", onder: "onderkant", links: "linkerkant", rechts: "rechterkant" }[rand];

  return (
    <div className={`flex items-center gap-1 ${staand ? "flex-col" : "flex-row"}`}>
      <button
        type="button"
        onClick={() => pasAan("erbij")}
        disabled={bezig}
        title={`Een ${wat} erbij aan de ${kant}`}
        className="grid size-7 place-items-center rounded-full border border-olive-leaf
                   bg-cornsilk text-olive-leaf transition-colors hover:bg-olive-leaf
                   hover:text-cornsilk disabled:opacity-50 sm:size-8"
      >
        <Plus aria-hidden="true" className="size-4" />
        <span className="sr-only">
          {wat === "rij" ? "Rij" : "Kolom"} erbij aan de {kant}
        </span>
      </button>
      <button
        type="button"
        onClick={() => pasAan("eraf")}
        disabled={bezig || !kanEraf}
        title={
          kanEraf
            ? `Een ${wat} eraf aan de ${kant}`
            : `Kan niet: er staat een stelling tegen deze rand`
        }
        className="grid size-6 place-items-center rounded-full text-black-forest/50
                   transition-colors hover:bg-black-forest/10 hover:text-black-forest
                   disabled:pointer-events-none disabled:opacity-30"
      >
        <Minus aria-hidden="true" className="size-3.5" />
        <span className="sr-only">
          {wat === "rij" ? "Rij" : "Kolom"} eraf aan de {kant}
        </span>
      </button>
    </div>
  );
}

function StellingBlok({ stelling, kies }: { stelling: Stelling; kies: (s: Stelling) => void }) {
  const staand = stelling.hoogte >= stelling.breedte;
  const labels = kantLabels(stelling);
  const kanten = [
    stelling.links && { label: labels.links, naam: stelling.links.naam },
    stelling.rechts && { label: labels.rechts, naam: stelling.rechts.naam },
  ].filter((k): k is { label: string; naam: string } => Boolean(k));

  return (
    <button
      type="button"
      onClick={() => kies(stelling)}
      title={stellingNaam(stelling)}
      style={{
        gridColumn: `${stelling.x} / span ${stelling.breedte}`,
        gridRow: `${stelling.y} / span ${stelling.hoogte}`,
      }}
      className={`z-10 flex overflow-hidden rounded-sm border-2 border-olive-leaf bg-olive-leaf/15
                  text-black-forest transition-colors hover:bg-olive-leaf/30
                  ${staand ? "flex-row" : "flex-col"}`}
    >
      <span className="sr-only">Stelling: </span>
      {kanten.map((kant, i) => (
        <span
          key={kant.label}
          className={`flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden
                      ${i > 0 ? (staand ? "border-l border-olive-leaf/60" : "border-t border-olive-leaf/60") : ""}`}
        >
          <span
            className={`truncate px-0.5 text-[10px] font-semibold leading-tight sm:text-xs
                        ${staand ? "[writing-mode:vertical-rl]" : ""}`}
          >
            {kant.naam}
            {i < kanten.length - 1 && <span className="sr-only"> en </span>}
          </span>
        </span>
      ))}
    </button>
  );
}
