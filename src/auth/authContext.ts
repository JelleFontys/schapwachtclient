import { createContext, useContext } from "react";

export type Rol = "MEDEWERKER" | "LEIDINGGEVENDE";

export type Gebruiker = {
  id: string;
  naam: string;
  email: string;
  rol: Rol;
  winkelId: string;
};

export type NieuwAccount = {
  naam: string;
  email: string;
  wachtwoord: string;
  /** Precies één van deze twee: een nieuwe winkel, of aansluiten. */
  winkelnaam?: string;
  uitnodigingscode?: string;
};

export type Sessie = {
  gebruiker: Gebruiker | null;
  /** Waar bij het opstarten: dan is nog niet bekend of je ingelogd bent. */
  bezig: boolean;
  logIn: (email: string, wachtwoord: string) => Promise<void>;
  registreer: (account: NieuwAccount) => Promise<void>;
  logUit: () => Promise<void>;
};

export const SessieContext = createContext<Sessie | null>(null);

export function useSessie(): Sessie {
  const sessie = useContext(SessieContext);

  if (!sessie) {
    throw new Error("useSessie kan alleen binnen <AuthProvider> gebruikt worden.");
  }

  return sessie;
}
