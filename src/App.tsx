import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import { VereistInlog } from "./components/VereistInlog";
import Inloggen from "./pages/Inloggen";
import Overzicht from "./pages/Overzicht";
import Plattegrond from "./pages/Plattegrond";
import Producten from "./pages/Producten";
import Registreren from "./pages/Registreren";
import Stelling from "./pages/Stelling";
import Werklijst from "./pages/Werklijst";
import Winkel from "./pages/Winkel";

/**
 * De scanner wordt pas geladen als iemand hem opent. De bibliotheek die
 * streepjescodes herkent is groter dan de hele rest van de app, en wie
 * alleen de werklijst bekijkt hoeft die niet te downloaden.
 */
const Scannen = lazy(() => import("./pages/Scannen"));

/**
 * Er is geen startpagina.
 *
 * "/" zit achter VereistInlog en stuurt door naar de plattegrond. Ben
 * je niet ingelogd, dan onderschept VereistInlog dat en kom je op de
 * inlogpagina uit. Zo staat de regel op één plek in plaats van dat
 * elke pagina zelf moet nadenken over wie er binnen mag.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/inloggen" element={<Inloggen />} />
          <Route path="/registreren" element={<Registreren />} />

          <Route element={<VereistInlog />}>
            <Route path="/" element={<Navigate to="/plattegrond" replace />} />
            <Route path="/plattegrond" element={<Plattegrond />} />
            <Route path="/plattegrond/:id" element={<Plattegrond />} />
            <Route path="/stelling/:id" element={<Stelling />} />
            <Route path="/werklijst" element={<Werklijst />} />
            <Route
              path="/scannen"
              element={
                <Suspense fallback={<p className="p-8 text-sm text-black-forest/60">Scanner laden…</p>}>
                  <Scannen />
                </Suspense>
              }
            />
            <Route path="/producten" element={<Producten />} />
            <Route path="/overzicht" element={<Overzicht />} />
            <Route path="/winkel" element={<Winkel />} />

            {/* Onbekend pad: terug naar het begin, dat verwijst verder. */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
