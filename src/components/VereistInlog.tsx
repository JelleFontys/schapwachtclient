import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useSessie } from "../auth/authContext";

/**
 * Schermt een stuk van de router af.
 *
 * Dit houdt alleen de pagina's weg: de echte afscherming zit in de API,
 * die bij elk verzoek het token controleert. Zou dit het enige zijn,
 * dan kon iemand de gegevens nog gewoon opvragen zonder de app te
 * gebruiken.
 */
export function VereistInlog() {
  const { gebruiker, bezig } = useSessie();
  const plek = useLocation();

  if (bezig) {
    return (
      <p className="flex min-h-dvh items-center justify-center gap-2 text-sm text-black-forest/60">
        <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        Even kijken of je al ingelogd bent
      </p>
    );
  }

  // `state` onthoudt waar je heen wilde, zodat je na het inloggen niet
  // altijd op dezelfde pagina belandt.
  if (!gebruiker) return <Navigate to="/inloggen" replace state={{ vandaan: plek.pathname }} />;

  return <Outlet />;
}
