/**
 * Alle verzoeken aan de API lopen hierlangs.
 *
 * Lokaal is VITE_API_URL leeg en blijft het pad relatief; de
 * ontwikkelserver stuurt /api dan door naar de Express-server, zodat de
 * browser alles als dezelfde herkomst ziet. In productie staan client en
 * API op verschillende subdomeinen en wordt het volledige adres gebruikt.
 */
import { leesToken } from "./sessie";

const basisUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export function apiUrl(pad: string) {
  return `${basisUrl}${pad}`;
}

/**
 * Fout met de status erbij, zodat een pagina kan zien of iemand niet
 * meer ingelogd is (401) of dat de invoer niet klopte (400).
 */
export class ApiFout extends Error {
  readonly status: number;

  constructor(status: number, bericht: string) {
    super(bericht);
    this.name = "ApiFout";
    this.status = status;
  }
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

  // Een foutmelding van de server staat in het veld `fout`. Komt er
  // geen JSON terug (een 502 van de proxy bijvoorbeeld), dan maken we
  // er zelf een leesbare melding van.
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
    throw new ApiFout(response.status, melding);
  }

  return inhoud as T;
}

export const haalOp = <T>(pad: string, opties: RequestInit = {}) =>
  stuur<T>(pad, { method: "GET", ...opties });

export const verstuur = <T>(pad: string, gegevens?: unknown, opties: RequestInit = {}) =>
  stuur<T>(pad, {
    method: "POST",
    ...(gegevens === undefined ? {} : { body: JSON.stringify(gegevens) }),
    ...opties,
  });
