import { ApiStatus } from "../components/ApiStatus";
import { Statusmerk } from "../components/Statusmerk";
import { alleStatussen, statusOpmaak } from "../data/statussen";

export default function Home() {
  return (
    <main className="mx-auto max-w-lg px-5 py-12 sm:py-20">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">SchapWacht</h1>
      <p className="mt-3 text-lg leading-relaxed text-black-forest/75">
        Leg bij het vullen één keer de houdbaarheidsdatum vast. De app zegt daarna
        elke ochtend welke vakken aandacht nodig hebben.
      </p>

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
