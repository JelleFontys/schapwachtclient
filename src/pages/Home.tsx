import { Link } from "react-router-dom";

import { ApiStatus } from "../components/ApiStatus";
import { Statusmerk } from "../components/Statusmerk";
import { alleStatussen, statusOpmaak } from "../data/statussen";
import { useSessie } from "../auth/authContext";

export default function Home() {
  const { gebruiker } = useSessie();

  return (
    <main className="mx-auto max-w-lg px-5 py-12 sm:py-20">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">SchapWacht</h1>
      <p className="mt-3 text-lg leading-relaxed text-black-forest/75">
        Leg bij het vullen één keer de houdbaarheidsdatum vast. De app zegt daarna
        elke ochtend welke vakken aandacht nodig hebben.
      </p>

      <nav className="mt-8 flex flex-wrap gap-3">
        {gebruiker ? (
          <Link
            to="/winkel"
            className="rounded-xl bg-olive-leaf px-4 py-2.5 text-sm font-semibold
                       text-cornsilk transition-colors hover:bg-black-forest"
          >
            Naar je winkel
          </Link>
        ) : (
          <>
            <Link
              to="/inloggen"
              className="rounded-xl bg-olive-leaf px-4 py-2.5 text-sm font-semibold
                         text-cornsilk transition-colors hover:bg-black-forest"
            >
              Inloggen
            </Link>
            <Link
              to="/registreren"
              className="rounded-xl border border-black-forest/20 px-4 py-2.5 text-sm
                         font-semibold transition-colors hover:border-olive-leaf
                         hover:text-olive-leaf"
            >
              Account aanmaken
            </Link>
          </>
        )}
      </nav>

      <section className="mt-12" aria-labelledby="statussen">
        <h2 id="statussen" className="text-sm font-bold text-black-forest/60">
          Wat een vak kan zijn
        </h2>

        <ul className="mt-4 space-y-3">
          {alleStatussen.map((status) => (
            <li key={status} className="flex items-center justify-between gap-4">
              <Statusmerk status={status} />
              <span className="text-right text-sm text-black-forest/70">
                {statusOpmaak[status].uitleg}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-12 border-t border-black-forest/10 pt-5">
        <ApiStatus />
      </footer>
    </main>
  );
}
