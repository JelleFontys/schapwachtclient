import { Balk } from "../components/Balk";

/**
 * De plattegrond met de schapvakken.
 *
 * Nog leeg: het raster, de vakken en de statuskleuren komen in sprint 2
 * (SW-19 tot en met SW-24). Deze pagina bestaat nu al omdat het de
 * plek is waar je na het inloggen terechtkomt.
 */
export default function Plattegrond() {
  return (
    <>
      <Balk />

      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">Plattegrond</h1>
      </main>
    </>
  );
}
