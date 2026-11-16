import { haalOp, wijzig } from "./api";
import type { Rol } from "../auth/authContext";

export type Lid = { id: string; naam: string; email: string; rol: Rol };

export type Overzicht = {
  van: string;
  tot: string;
  totaal: { partijen: number; stuks: number; zonderAantal: number };
  groepen: {
    productgroep: { id: string; naam: string } | null;
    partijen: number;
    stuks: number;
    zonderAantal: number;
    producten: { naam: string; partijen: number }[];
  }[];
};

export const team = {
  lijst: () => haalOp<Lid[]>("/api/winkel/medewerkers"),
  wijzigRol: (id: string, rol: Rol) =>
    wijzig<Lid>(`/api/winkel/medewerkers/${encodeURIComponent(id)}`, { rol }),
};

export type Advies = "NIET_VERKOCHT" | "AFPRIJZEN_HELPT_NIET" | "EERDER_AFPRIJZEN";

export type LetOp = {
  product: {
    id: string;
    naam: string;
    productgroep: { id: string; naam: string; afprijsDagen: number } | null;
  };
  weggegooid: number;
  uitverkocht: number;
  gestickerd: number;
  stuksWeggegooid: number;
  aandeel: number;
  advies: Advies;
};

export const overzicht = {
  aandacht: (van: string, tot: string) =>
    haalOp<{ van: string; tot: string; producten: LetOp[] }>(
      `/api/overzicht/aandacht?van=${encodeURIComponent(van)}&tot=${encodeURIComponent(tot)}`,
    ),
  weggegooid: (van: string, tot: string) =>
    haalOp<Overzicht>(
      `/api/overzicht/weggegooid?van=${encodeURIComponent(van)}&tot=${encodeURIComponent(tot)}`,
    ),
};
