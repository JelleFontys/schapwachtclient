import { useEffect, useState } from "react";
import { Copy, LogOut, Users } from "lucide-react";

import { ApiStatus } from "../components/ApiStatus";
import { Knop } from "../components/Knop";
import { Melding } from "../components/Melding";
import { haalOp } from "../data/api";
import { useSessie } from "../auth/authContext";

type Winkelgegevens = { id: string; naam: string; uitnodigingscode?: string };
type Medewerker = { id: string; naam: string; email: string; rol: string };

export default function Winkel() {
  const { gebruiker, logUit } = useSessie();

  const [winkel, setWinkel] = useState<Winkelgegevens | null>(null);
  const [medewerkers, setMedewerkers] = useState<Medewerker[]>([]);
  const [fout, setFout] = useState<string | null>(null);
  const [gekopieerd, setGekopieerd] = useState(false);

  const isLeiding = gebruiker?.rol === "LEIDINGGEVENDE";

  useEffect(() => {
    let afgebroken = false;

    haalOp<Winkelgegevens>("/api/winkel")
      .then((gegevens) => {
        if (!afgebroken) setWinkel(gegevens);
      })
      .catch((probleem: unknown) => {
        if (!afgebroken) {
          setFout(probleem instanceof Error ? probleem.message : "Ophalen is niet gelukt.");
        }
      });

    // De medewerkerslijst is alleen voor de leidinggevende. De API
    // weigert hem anders ook, dus hier niet eens vragen.
    if (isLeiding) {
      haalOp<Medewerker[]>("/api/winkel/medewerkers")
        .then((lijst) => {
          if (!afgebroken) setMedewerkers(lijst);
        })
        .catch(() => {
          // Niet erg genoeg voor een melding over de hele pagina.
        });
    }

    return () => {
      afgebroken = true;
    };
  }, [isLeiding]);

  async function kopieerCode() {
    if (!winkel?.uitnodigingscode) return;

    try {
      await navigator.clipboard.writeText(winkel.uitnodigingscode);
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2000);
    } catch {
      // Zonder toestemming voor het klembord kan de code altijd nog
      // met de hand overgetypt worden; hij staat op het scherm.
    }
  }

  return (
    <main className="mx-auto max-w-lg px-5 py-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {winkel?.naam ?? "Je winkel"}
          </h1>
          <p className="mt-1 text-sm text-black-forest/70">
            {gebruiker?.naam} · {isLeiding ? "leidinggevende" : "medewerker"}
          </p>
        </div>

        <div className="w-auto shrink-0">
          <Knop soort="lijn" onClick={() => void logUit()}>
            <LogOut aria-hidden="true" className="size-4" />
            Uitloggen
          </Knop>
        </div>
      </header>

      {fout && <div className="mt-6">{<Melding tekst={fout} />}</div>}

      {isLeiding && winkel?.uitnodigingscode && (
        <section className="mt-10 rounded-2xl border border-black-forest/10 bg-cornsilk-diep p-5">
          <h2 className="text-sm font-bold text-black-forest/60">Uitnodigingscode</h2>
          <p className="mt-2 text-sm leading-relaxed text-black-forest/75">
            Geef deze code aan je collega&apos;s. Wie hem heeft kan een account aanmaken
            dat bij deze winkel hoort, dus deel hem niet breder dan nodig.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <code data-getal className="text-xl font-bold tracking-widest">
              {winkel.uitnodigingscode}
            </code>
            <button
              type="button"
              onClick={() => void kopieerCode()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-black-forest/20
                         px-2.5 py-1.5 text-xs font-semibold hover:border-olive-leaf
                         hover:text-olive-leaf"
            >
              <Copy aria-hidden="true" className="size-3.5" />
              {gekopieerd ? "Gekopieerd" : "Kopieer"}
            </button>
          </div>
        </section>
      )}

      {isLeiding && medewerkers.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-sm font-bold text-black-forest/60">
            <Users aria-hidden="true" className="size-4" />
            Wie er bij deze winkel horen
          </h2>

          <ul className="mt-4 divide-y divide-black-forest/10">
            {medewerkers.map((medewerker) => (
              <li key={medewerker.id} className="flex items-baseline justify-between gap-4 py-3">
                <span className="font-semibold">{medewerker.naam}</span>
                <span className="text-right text-sm text-black-forest/60">
                  {medewerker.rol === "LEIDINGGEVENDE" ? "leidinggevende" : "medewerker"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10 rounded-2xl border border-dashed border-black-forest/20 p-5">
        <h2 className="text-sm font-bold text-black-forest/60">Nog te bouwen</h2>
        <p className="mt-2 text-sm leading-relaxed text-black-forest/75">
          De plattegrond met de schapvakken komt in sprint 2, de producten en
          houdbaarheidsdatums in sprint 3.
        </p>
      </section>

      <footer className="mt-10 border-t border-black-forest/10 pt-5">
        <ApiStatus />
      </footer>
    </main>
  );
}
