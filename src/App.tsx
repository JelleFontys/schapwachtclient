import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import { VereistInlog } from "./components/VereistInlog";
import Home from "./pages/Home";
import Inloggen from "./pages/Inloggen";
import Registreren from "./pages/Registreren";
import Winkel from "./pages/Winkel";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inloggen" element={<Inloggen />} />
          <Route path="/registreren" element={<Registreren />} />

          {/* Alles hieronder is alleen te zien als je ingelogd bent. */}
          <Route element={<VereistInlog />}>
            <Route path="/winkel" element={<Winkel />} />
          </Route>

          {/* Onbekend pad: voorlopig terug naar de startpagina. */}
          <Route path="*" element={<Home />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
