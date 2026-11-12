import { haalOp, verstuur, wijzig } from "./api";
import type { Plek, Product } from "./producten";
import type { Status } from "./statussen";

export type Partij = {
  id: string;
  product: Product;
  houdbaarTot: string;
  aantal: number | null;
  status: Status;
  /** null = zonder plek; ontbreekt als de partij al bij een vak getoond wordt. */
  plek?: Plek | null;
};

export type Uitkomst = "GESTICKERD" | "UITVERKOCHT" | "WEGGEGOOID";

/** De drie manieren waarop een partij van de werklijst verdwijnt (SW-28). */
export const uitkomsten: { waarde: Uitkomst; label: string; uitleg: string }[] = [
  { waarde: "GESTICKERD", label: "Gestickerd", uitleg: "afgeprijsd, ligt nog in het schap" },
  { waarde: "UITVERKOCHT", label: "Uitverkocht", uitleg: "niets meer van deze datum" },
  { waarde: "WEGGEGOOID", label: "Weggegooid", uitleg: "uit het schap en weg" },
];

export type PartijInvoer = {
  vakId: string;
  productId: string;
  houdbaarTot: string;
  aantal: number | null;
};

const pad = (id: string) => `/api/partijen/${encodeURIComponent(id)}`;

export const partijen = {
  voegToe: (invoer: PartijInvoer) => verstuur<Partij>("/api/partijen", invoer),
  afmelden: (id: string, uitkomst: Uitkomst) => verstuur(`${pad(id)}/afmelden`, { uitkomst }),
  plaats: (id: string, vakId: string) => wijzig<Partij>(pad(id), { vakId }),
  leegmelden: (vakId: string, uitkomst: Uitkomst) =>
    verstuur<{ afgemeld: number }>(`/api/vakken/${encodeURIComponent(vakId)}/leegmelden`, {
      uitkomst,
    }),
  werklijst: () => haalOp<{ vandaag: string; partijen: Partij[] }>("/api/werklijst"),
};
