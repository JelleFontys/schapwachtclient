import { leesToken } from "./sessie";

const basisUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export function apiUrl(pad: string) {
  return `${basisUrl}${pad}`;
}

export class ApiFout extends Error {
  readonly status: number;
  readonly gegevens: Record<string, unknown>;

  constructor(status: number, bericht: string, gegevens: Record<string, unknown> = {}) {
    super(bericht);
    this.name = "ApiFout";
    this.status = status;
    this.gegevens = gegevens;
  }
}

export function meldingVan(fout: unknown, standaard = "Er ging iets mis.") {
  return fout instanceof Error && fout.message ? fout.message : standaard;
}

async function stuur<T>(pad: string, opties: RequestInit): Promise<T> {
  const token = leesToken();

  const response = await fetch(apiUrl(pad), {
    ...opties,
    headers: {
      ...(opties.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opties.headers,
    },
  });

  if (response.status === 204) return undefined as T;

  let inhoud: unknown;
  try {
    inhoud = await response.json();
  } catch {
    inhoud = null;
  }

  if (!response.ok) {
    const melding =
      (inhoud as { fout?: string } | null)?.fout ??
      `De server gaf status ${response.status}.`;
    throw new ApiFout(
      response.status,
      melding,
      (inhoud as Record<string, unknown> | null) ?? {},
    );
  }

  return inhoud as T;
}

export const haalOp = <T>(pad: string, opties: RequestInit = {}) =>
  stuur<T>(pad, { method: "GET", ...opties });

export const verwijder = <T = void>(pad: string, opties: RequestInit = {}) =>
  stuur<T>(pad, { method: "DELETE", ...opties });

export const wijzig = <T>(pad: string, gegevens: unknown, opties: RequestInit = {}) =>
  stuur<T>(pad, { method: "PATCH", body: JSON.stringify(gegevens), ...opties });

export const verstuur = <T>(pad: string, gegevens?: unknown, opties: RequestInit = {}) =>
  stuur<T>(pad, {
    method: "POST",
    ...(gegevens === undefined ? {} : { body: JSON.stringify(gegevens) }),
    ...opties,
  });
