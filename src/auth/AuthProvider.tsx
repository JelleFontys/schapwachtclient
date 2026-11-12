import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { ApiFout, haalOp, verstuur } from "../data/api";
import { bewaarToken, leesToken, wisToken } from "../data/sessie";
import { SessieContext } from "./authContext";
import type { Gebruiker, NieuwAccount } from "./authContext";

type Antwoord = { gebruiker: Gebruiker; token: string };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [gebruiker, setGebruiker] = useState<Gebruiker | null>(null);
  const [bezig, setBezig] = useState(() => leesToken() !== null);

  useEffect(() => {
    if (!leesToken()) return;

    let afgebroken = false;

    haalOp<{ gebruiker: Gebruiker }>("/api/auth/ik")
      .then((antwoord) => {
        if (!afgebroken) setGebruiker(antwoord.gebruiker);
      })
      .catch((fout: unknown) => {
        if (fout instanceof ApiFout && fout.status === 401) wisToken();
      })
      .finally(() => {
        if (!afgebroken) setBezig(false);
      });

    return () => {
      afgebroken = true;
    };
  }, []);

  const neemAan = useCallback((antwoord: Antwoord) => {
    bewaarToken(antwoord.token);
    setGebruiker(antwoord.gebruiker);
  }, []);

  const logIn = useCallback(
    async (email: string, wachtwoord: string) => {
      neemAan(await verstuur<Antwoord>("/api/auth/inloggen", { email, wachtwoord }));
    },
    [neemAan],
  );

  const registreer = useCallback(
    async (account: NieuwAccount) => {
      neemAan(await verstuur<Antwoord>("/api/auth/registreer", account));
    },
    [neemAan],
  );

  const logUit = useCallback(async () => {
    try {
      await verstuur("/api/auth/uitloggen");
    } catch {
      // server niet bereikbaar: lokaal toch uitloggen
    }
    wisToken();
    setGebruiker(null);
  }, []);

  const ververs = useCallback(async () => {
    const antwoord = await haalOp<{ gebruiker: Gebruiker }>("/api/auth/ik");
    setGebruiker(antwoord.gebruiker);
  }, []);

  const waarde = useMemo(
    () => ({ gebruiker, bezig, logIn, registreer, logUit, ververs }),
    [gebruiker, bezig, logIn, registreer, logUit, ververs],
  );

  return <SessieContext.Provider value={waarde}>{children}</SessieContext.Provider>;
}
