import { haalOp, verstuur, verwijder, wijzig } from "./api";
import type { Status } from "./statussen";

export type Productgroep = {
  id: string;
  naam: string;
  afprijsDagen: number;
  aantalProducten?: number;
};

export type Product = {
  id: string;
  naam: string;
  barcode: string | null;
  productgroep: { id: string; naam: string } | null;
  afprijsDagen: number;
};

export type ProductInvoer = { naam: string; barcode: string; productgroepId: string | null };

export type Plek = {
  vakId: string;
  plattegrondId: string;
  plattegrond: string;
  stellingId: string;
  kant: string;
  rij: number;
  vak: number;
  tekst: string;
};

export type Gescand = {
  barcode: string;
  product: Product | null;
  plekken: (Plek & { houdbaarTot: string; status: Status })[];
};

const pad = (id: string) => `/api/producten/${encodeURIComponent(id)}`;
const groepPad = (id: string) => `/api/productgroepen/${encodeURIComponent(id)}`;

export const producten = {
  lijst: (zoek = "") =>
    haalOp<Product[]>(`/api/producten${zoek ? `?zoek=${encodeURIComponent(zoek)}` : ""}`),
  maak: (invoer: ProductInvoer) => verstuur<Product>("/api/producten", invoer),
  wijzig: (id: string, invoer: Partial<ProductInvoer>) => wijzig<Product>(pad(id), invoer),
  verwijder: (id: string) => verwijder(pad(id)),
  opBarcode: (code: string) =>
    haalOp<Gescand>(`/api/producten/barcode/${encodeURIComponent(code)}`),
};

export const productgroepen = {
  lijst: () =>
    haalOp<{ standaardAfprijsDagen: number; groepen: Productgroep[] }>("/api/productgroepen"),
  maak: (naam: string, afprijsDagen: number) =>
    verstuur<Productgroep>("/api/productgroepen", { naam, afprijsDagen }),
  wijzig: (id: string, invoer: { naam?: string; afprijsDagen?: number }) =>
    wijzig<Productgroep>(groepPad(id), invoer),
  verwijder: (id: string) => verwijder(groepPad(id)),
};
