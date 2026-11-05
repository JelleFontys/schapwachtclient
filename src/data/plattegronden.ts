import { haalOp, verstuur, wijzig } from "./api";

/** Zelfde grenzen als de server (kern/raster.js). */
export const MAX_RIJEN = 26;
export const MAX_KOLOMMEN = 30;

export type Vak = {
  id: string;
  rij: number;
  kolom: number;
  /** "A1", "C4": de plek in het raster, los van de naam. */
  positie: string;
  naam: string | null;
};

export type PlattegrondKort = { id: string; naam: string; rijen: number; kolommen: number };
export type Plattegrond = PlattegrondKort & { vakken: Vak[] };
export type Afmetingen = { naam: string; rijen: number; kolommen: number };

export const rijLetter = (rij: number) => String.fromCharCode(64 + rij);

export const kort = ({ id, naam, rijen, kolommen }: PlattegrondKort): PlattegrondKort => ({
  id,
  naam,
  rijen,
  kolommen,
});

const pad = (id: string) => `/api/plattegronden/${encodeURIComponent(id)}`;

export const plattegronden = {
  lijst: () => haalOp<PlattegrondKort[]>("/api/plattegronden"),
  haal: (id: string) => haalOp<Plattegrond>(pad(id)),
  maak: (gegevens: Afmetingen) => verstuur<Plattegrond>("/api/plattegronden", gegevens),
  wijzig: (id: string, gegevens: Partial<Afmetingen>) => wijzig<Plattegrond>(pad(id), gegevens),
  hernoemVak: (id: string, naam: string) =>
    wijzig<Vak>(`/api/vakken/${encodeURIComponent(id)}`, { naam }),
};
