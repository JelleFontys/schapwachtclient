import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { ApiFout, haalOp, verstuur } from "../data/api";
import { bewaarToken, leesToken, wisToken } from "../data/sessie";
import { SessieContext } from "./authContext";
import type { Gebruiker, NieuwAccount } from "./authContext";

type Antwoord = { gebruiker: Gebruiker; token: string };

/**
 * Houdt bij wie er ingelogd is.
 *
 * Bij het opstarten staat er misschien nog een token in localStorage.
 * Of dat nog geldig is, weet alleen de server: daarom vraagt deze
 * provider eerst /api/auth/ik op. Tot dat antwoord binnen is staat
 * `bezig` op waar, zodat de app niet even een inlogpagina laat zien aan
 * iemand die al ingelogd is.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [gebruiker, setGebruiker] = useState<Gebruiker | null>(null);
  // Alleen wachten als er iets te controleren is. Zonder token weten we
  // meteen dat niemand ingelogd is, en dan hoeft de app niet eerst een
  // laadscherm te laten zien.
  const [bezig, setBezig] = useState(() => leesToken() !== null);

  useEffect(() => {
    if (!leesToken()) return;

    let afgebroken = false;

    haalOp<{ gebruiker: Gebruiker }>("/api/auth/ik")
      .then((antwoord) => {
        if (!afgebroken) setGebruiker(antwoord.gebruiker);
      })
      .catch((fout: unknown) => {
        // Alleen bij 401 het token weggooien. Bij een API die even
        // onbereikbaar is, is het token nog prima en mag je niet
        // ongemerkt uitgelogd worden.
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
      // Mislukt dat, dan maakt het niet uit: het token weggooien is
      // wat uitloggen hier betekent.
    }
    wisToken();
    setGebruiker(null);
  }, []);

  const waarde = useMemo(
    () => ({ gebruiker, bezig, logIn, registreer, logUit }),
    [gebruiker, bezig, logIn, registreer, logUit],
  );

  return <SessieContext.Provider value={waarde}>{children}</SessieContext.Provider>;
}
