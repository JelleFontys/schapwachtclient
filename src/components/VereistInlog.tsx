import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useSessie } from "../auth/authContext";

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

  if (!gebruiker) return <Navigate to="/inloggen" replace state={{ vandaan: plek.pathname }} />;

  return <Outlet />;
}
