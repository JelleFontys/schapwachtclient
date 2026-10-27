/**
 * Het inlogtoken bewaren.
 *
 * In localStorage, zodat je ingelogd blijft als je de pagina herlaadt
 * of de tab sluit. Dat is niet de veiligste plek: JavaScript op de
 * pagina kan erbij, dus bij een XSS-lek ligt het token open. Veiliger
 * is een cookie met HttpOnly, want daar komt JavaScript niet bij.
 *
 * Dat kan hier niet zonder omweg: de client staat op schapclient en de
 * API op schapserv, dus een cookie van de API is voor de client een
 * cookie van een ander domein. Browsers blokkeren die steeds vaker.
 * Daarom nu localStorage, met het token acht uur geldig in plaats van
 * maanden. Het staat in mijn beslislog als punt om opnieuw te bekijken
 * als beide op hetzelfde domein komen te staan.
 */
const SLEUTEL = "schapwacht-token";

export function leesToken(): string | null {
  try {
    return localStorage.getItem(SLEUTEL);
  } catch {
    // Privémodus of geblokkeerde opslag: dan blijf je niet ingelogd,
    // maar de app moet wel blijven werken.
    return null;
  }
}

export function bewaarToken(token: string) {
  try {
    localStorage.setItem(SLEUTEL, token);
  } catch {
    // Niets te doen: hierboven staat waarom dit mag mislukken.
  }
}

export function wisToken() {
  try {
    localStorage.removeItem(SLEUTEL);
  } catch {
    // idem
  }
}
