import { haalOp, verstuur, verwijder, wijzig } from "./api";

/** Zelfde grenzen als de server (kern/raster.js en kern/stelling.js). */
export const MAX_RIJEN_PER_KANT = 12;
export const MAX_VAKKEN_PER_RIJ = 30;

/** Een rechthoek op de vloer. x en y zijn de linkerbovenhoek, vanaf 1. */
export type Vlak = { x: number; y: number; breedte: number; hoogte: number };

/**
 * Eén kant van een stelling. `rijen` heeft per rij (plank) het aantal
 * producten dat ernaast past: [6, 6, 4] is drie rijen. Rij 1 is de
 * bovenste.
 */
export type Kant = { naam: string; rijen: number[] };

export type Stelling = Vlak & { id: string; links: Kant | null; rechts: Kant | null };
export type StellingInvoer = { links: Kant | null; rechts: Kant | null };

export type PlattegrondKort = { id: string; naam: string; rijen: number; kolommen: number };
export type Plattegrond = PlattegrondKort & { stellingen: Stelling[] };

export type Rand = "boven" | "onder" | "links" | "rechts";
export type RandActie = "erbij" | "eraf";

export const kort = ({ id, naam, rijen, kolommen }: PlattegrondKort): PlattegrondKort => ({
  id,
  naam,
  rijen,
  kolommen,
});

/**
 * Hoe de kanten heten. Bij een staande stelling (hoger dan breed) is dat
 * links en rechts, bij een liggende boven en onder. Zelfde regel als de
 * server, zodat een foutmelding dezelfde woorden gebruikt als het
 * formulier.
 */
export function kantLabels(vlak: Pick<Vlak, "breedte" | "hoogte">) {
  return vlak.hoogte >= vlak.breedte
    ? { links: "Linkerkant", rechts: "Rechterkant" }
    : { links: "Bovenkant", rechts: "Onderkant" };
}

/** Twee aangetikte hoeken, in welke volgorde ook, als rechthoek. */
export function tussen(a: { x: number; y: number }, b: { x: number; y: number }): Vlak {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    breedte: Math.abs(a.x - b.x) + 1,
    hoogte: Math.abs(a.y - b.y) + 1,
  };
}

export function overlappen(a: Vlak, b: Vlak) {
  return a.x < b.x + b.breedte && b.x < a.x + a.breedte && a.y < b.y + b.hoogte && b.y < a.y + a.hoogte;
}

export function raaktRand(vlak: Vlak, rand: Rand, plattegrond: PlattegrondKort) {
  if (rand === "boven") return vlak.y === 1;
  if (rand === "onder") return vlak.y + vlak.hoogte - 1 === plattegrond.rijen;
  if (rand === "links") return vlak.x === 1;
  return vlak.x + vlak.breedte - 1 === plattegrond.kolommen;
}

/** De namen van de kanten, voor een label of een melding. */
export function stellingNaam(stelling: Pick<Stelling, "links" | "rechts">) {
  return [stelling.links?.naam, stelling.rechts?.naam].filter(Boolean).join(" / ");
}

const pad = (id: string) => `/api/plattegronden/${encodeURIComponent(id)}`;
const stellingPad = (id: string) => `/api/stellingen/${encodeURIComponent(id)}`;

export const plattegronden = {
  lijst: () => haalOp<PlattegrondKort[]>("/api/plattegronden"),
  haal: (id: string) => haalOp<Plattegrond>(pad(id)),
  maak: (naam: string) => verstuur<Plattegrond>("/api/plattegronden", { naam }),
  hernoem: (id: string, naam: string) => wijzig<Plattegrond>(pad(id), { naam }),
  rand: (id: string, rand: Rand, actie: RandActie) =>
    verstuur<Plattegrond>(`${pad(id)}/rand`, { rand, actie }),
};

export const stellingen = {
  maak: (plattegrondId: string, vlak: Vlak, invoer: StellingInvoer) =>
    verstuur<Stelling>(`${pad(plattegrondId)}/stellingen`, { ...vlak, ...invoer }),
  wijzig: (id: string, invoer: StellingInvoer) => wijzig<Stelling>(stellingPad(id), invoer),
  verwijder: (id: string) => verwijder(stellingPad(id)),
};
