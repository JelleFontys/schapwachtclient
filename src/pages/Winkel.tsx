import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Copy, Users } from "lucide-react";

import { ApiStatus } from "../components/ApiStatus";
import { Balk } from "../components/Balk";
import { Melding } from "../components/Melding";
import { haalOp, meldingVan } from "../data/api";
import { team } from "../data/team";
import type { Lid } from "../data/team";
import { useSessie } from "../auth/authContext";
import type { Rol } from "../auth/authContext";

type Winkelgegevens = { id: string; naam: string; uitnodigingscode?: string };

export default function Winkel() {
  const { gebruiker, ververs } = useSessie();

  const [winkel, setWinkel] = useState<Winkelgegevens | null>(null);
  const [medewerkers, setMedewerkers] = useState<Lid[]>([]);
  const [rolFout, setRolFout] = useState<string | null>(null);
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
      team
        .lijst()
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
    <>
      <Balk />

      <main className="mx-auto max-w-5xl px-5 pt-6 pb-28 sm:py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {winkel?.naam ?? "Je winkel"}
        </h1>
        <p className="mt-1 text-sm text-black-forest/70">
          {gebruiker?.naam} · {isLeiding ? "leidinggevende" : "medewerker"}
        </p>

        {fout && (
          <div className="mt-6">
            <Melding tekst={fout} />
          </div>
        )}

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
            <p className="mt-1 text-sm text-black-forest/65">
              Een leidinggevende richt de plattegrond in en stelt de afprijsregels in. Een
              medewerker zet producten in vakken en meldt ze af.
            </p>
            {rolFout && <div className="mt-3"><Melding tekst={rolFout} /></div>}

            <ul className="mt-4 divide-y divide-black-forest/10">
              {medewerkers.map((medewerker) => (
                <li key={medewerker.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <span className="block font-semibold">
                      {medewerker.naam}
                      {medewerker.id === gebruiker?.id && <span className="font-normal text-black-forest/50"> (jij)</span>}
                    </span>
                    <span className="block truncate text-xs text-black-forest/55">{medewerker.email}</span>
                  </span>
                  <label className="shrink-0 text-sm">
                    <span className="sr-only">Rol van {medewerker.naam}</span>
                    <select
                      value={medewerker.rol}
                      onChange={async (e) => {
                        setRolFout(null);
                        try {
                          const nieuw = await team.wijzigRol(medewerker.id, e.target.value as Rol);
                          setMedewerkers((oud) => oud.map((m) => (m.id === nieuw.id ? nieuw : m)));
                          // Je eigen rol veranderd: dan ook de rest van de app bijwerken.
                          if (nieuw.id === gebruiker?.id) await ververs();
                        } catch (p) {
                          setRolFout(meldingVan(p));
                        }
                      }}
                      className="rounded-lg border border-black-forest/15 bg-white/60 px-2 py-1.5 font-semibold"
                    >
                      <option value="MEDEWERKER">Medewerker</option>
                      <option value="LEIDINGGEVENDE">Leidinggevende</option>
                    </select>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}

        {isLeiding && (
          <Link
            to="/overzicht"
            className="mt-10 flex items-center gap-3 rounded-2xl border border-black-forest/10 bg-white/50 p-4 hover:border-olive-leaf"
          >
            <BarChart3 aria-hidden="true" className="size-5 text-olive-leaf" />
            <span>
              <span className="block font-semibold">Overzicht weggegooid</span>
              <span className="block text-sm text-black-forest/65">Wat er per productgroep is weggegooid</span>
            </span>
          </Link>
        )}

        <footer className="mt-10 border-t border-black-forest/10 pt-5">
          <ApiStatus />
        </footer>
      </main>
    </>
  );
}
