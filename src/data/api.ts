/**
 * Alle verzoeken aan de API lopen hierlangs.
 *
 * Lokaal is VITE_API_URL leeg en blijft het pad relatief; de
 * ontwikkelserver stuurt /api dan door naar de Express-server, zodat de
 * browser alles als dezelfde herkomst ziet. In productie staan client en
 * API op verschillende subdomeinen en wordt het volledige adres gebruikt.
 */
const basisUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export function apiUrl(pad: string) {
  return `${basisUrl}${pad}`;
}

export async function haalOp<T>(pad: string, opties?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(pad), { credentials: "include", ...opties });

  if (!response.ok) {
    throw new Error(`API gaf status ${response.status} voor ${pad}`);
  }

  return response.json() as Promise<T>;
}
