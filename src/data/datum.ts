/**
 * Datums tonen. Alles is "jjjj-mm-dd" zonder tijd, zoals de server het
 * stuurt; rekenen gebeurt in UTC zodat zomer- en wintertijd geen dag
 * laten verspringen.
 */

const TIJDZONE = "Europe/Amsterdam";

/** Vandaag in Nederland, als "jjjj-mm-dd". De werklijst krijgt dit van de server. */
export function vandaag() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIJDZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function alsUtc(datum: string) {
  const [j, m, d] = datum.split("-").map(Number);
  return Date.UTC(j, m - 1, d);
}

export function dagenTussen(van: string, tot: string) {
  return Math.round((alsUtc(tot) - alsUtc(van)) / 86_400_000);
}

export function verschuif(datum: string, dagen: number) {
  return new Date(alsUtc(datum) + dagen * 86_400_000).toISOString().slice(0, 10);
}

const kortNotatie = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const langNotatie = new Intl.DateTimeFormat("nl-NL", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "12 nov." */
export const kortDatum = (datum: string) => kortNotatie.format(alsUtc(datum));
/** "do 12 november 2026" */
export const langDatum = (datum: string) => langNotatie.format(alsUtc(datum));

/** "vandaag", "nog 3 dagen", "2 dagen over de datum". */
export function hoeLang(houdbaarTot: string, opDatum = vandaag()) {
  const dagen = dagenTussen(opDatum, houdbaarTot);
  if (dagen === 0) return "t/m vandaag";
  if (dagen === 1) return "t/m morgen";
  if (dagen > 1) return `nog ${dagen} dagen`;
  if (dagen === -1) return "1 dag over de datum";
  return `${-dagen} dagen over de datum`;
}
