const SLEUTEL = "schapwacht-token";

export function leesToken(): string | null {
  try {
    return localStorage.getItem(SLEUTEL);
  } catch {
    return null;
  }
}

export function bewaarToken(token: string) {
  try {
    localStorage.setItem(SLEUTEL, token);
  } catch {
    // opslag geblokkeerd, geen probleem
  }
}

export function wisToken() {
  try {
    localStorage.removeItem(SLEUTEL);
  } catch {
    // opslag geblokkeerd, geen probleem
  }
}
