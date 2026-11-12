import { haalOp, verstuur, verwijder, wijzig } from "./api";
import type { Partij } from "./partijen";
import type { Status } from "./statussen";

export const MAX_RIJEN_PER_KANT = 12;
export const MAX_VAKKEN_PER_RIJ = 30;
export const MAX_DIKTE = 2;

export type Vlak = { x: number; y: number; breedte: number; hoogte: number };

export type Kant = {
  naam: string;
  rijen: number[];
  status?: Status | null;
};

export type Stelling = Vlak & { id: string; links: Kant | null; rechts: Kant | null };
export type StellingInvoer = { links: Kant | null; rechts: Kant | null };

export type PlattegrondKort = { id: string; naam: string; rijen: number; kolommen: number };
export type Plattegrond = PlattegrondKort & { stellingen: Stelling[] };

export type Rand = "boven" | "onder" | "links" | "rechts";

export type InhoudVak = { id: string; positie: number; status: Status | null; partijen: Partij[] };
export type InhoudKant = {
  id: string;
  kant: "LINKS" | "RECHTS";
  naam: string;
  status: Status | null;
  rijen: { nummer: number; vakken: InhoudVak[] }[];
};
export type StellingInhoud = Stelling & {
  plattegrondId: string;
  plattegrond: string;
  kanten: InhoudKant[];
};

export type Geraakt = { plek: string; product: string };
export type RandActie = "erbij" | "eraf";

export const kort = ({ id, naam, rijen, kolommen }: PlattegrondKort): PlattegrondKort => ({
  id,
  naam,
  rijen,
  kolommen,
});

export function dikte(vlak: Pick<Vlak, "breedte" | "hoogte">) {
  return Math.min(vlak.breedte, vlak.hoogte);
}

export function kantLabels(vlak: Pick<Vlak, "breedte" | "hoogte">): {
  links: string;
  rechts: string | null;
} {
  if (dikte(vlak) === 1) return { links: "Stelling", rechts: null };
  return vlak.hoogte >= vlak.breedte
    ? { links: "Linkerkant", rechts: "Rechterkant" }
    : { links: "Bovenkant", rechts: "Onderkant" };
}

export function waaromNiet(vlak: Vlak, stellingen: Vlak[]) {
  if (stellingen.some((s) => overlappen(vlak, s))) {
    return {
      kort: "Bezet",
      lang: "Een stelling mag niet over een andere heen. Kies opnieuw.",
    };
  }
  if (dikte(vlak) > MAX_DIKTE) {
    return {
      kort: `Max. ${MAX_DIKTE} dik`,
      lang: `Een stelling mag maximaal ${MAX_DIKTE} hokjes dik zijn. Kies opnieuw.`,
    };
  }
  return null;
}

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
  inhoud: (id: string) => haalOp<StellingInhoud>(`${stellingPad(id)}/inhoud`),
  wijzig: (id: string, invoer: StellingInvoer, losmaken = false) =>
    wijzig<Stelling>(stellingPad(id), { ...invoer, losmaken }),
  verwijder: (id: string, losmaken = false) =>
    verwijder(`${stellingPad(id)}${losmaken ? "?losmaken=ja" : ""}`),
};
