import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Onbekend pad: voorlopig terug naar de startpagina. */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
