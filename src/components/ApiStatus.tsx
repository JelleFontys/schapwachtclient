import { useEffect, useState } from "react";
import { Check, Loader2, Unplug } from "lucide-react";

import { haalOp } from "../data/api";

type Verbinding = "laden" | "ok" | "fout";

const tekst: Record<Verbinding, string> = {
  laden: "Verbinding controleren",
  ok: "Verbonden met de API",
  fout: "Geen verbinding met de API",
};

/** Laat zien of de API en de database bereikbaar zijn. */
export function ApiStatus() {
  const [verbinding, setVerbinding] = useState<Verbinding>("laden");
  const [database, setDatabase] = useState<string | null>(null);

  useEffect(() => {
    const controle = new AbortController();

    haalOp<{ database?: string }>("/api/health", { signal: controle.signal })
      .then((gegevens) => {
        setDatabase(gegevens.database ?? null);
        setVerbinding("ok");
      })
      .catch((fout: unknown) => {
        if (fout instanceof Error && fout.name === "AbortError") return;
        setVerbinding("fout");
      });

    return () => controle.abort();
  }, []);

  const Icoon = verbinding === "ok" ? Check : verbinding === "fout" ? Unplug : Loader2;

  return (
    <p className="flex items-center gap-2 text-sm text-black-forest/70">
      <Icoon
        aria-hidden="true"
        className={`size-4 shrink-0 ${verbinding === "laden" ? "animate-spin" : ""}`}
      />
      {tekst[verbinding]}
      {database !== null && (
        <span className="text-black-forest/50">· database {database}</span>
      )}
    </p>
  );
}
