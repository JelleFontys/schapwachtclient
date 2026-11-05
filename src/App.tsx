import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import { VereistInlog } from "./components/VereistInlog";
import Inloggen from "./pages/Inloggen";
import Plattegrond from "./pages/Plattegrond";
import Registreren from "./pages/Registreren";
import Winkel from "./pages/Winkel";

/**
 * Er is geen startpagina meer.
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
            <Route path="/winkel" element={<Winkel />} />

            {/* Onbekend pad: terug naar het begin, dat verwijst verder. */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
