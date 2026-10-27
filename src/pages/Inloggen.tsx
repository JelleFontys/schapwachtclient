import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { Kader } from "../components/Kader";
import { Knop } from "../components/Knop";
import { Melding } from "../components/Melding";
import { Veld } from "../components/Veld";
import { useSessie } from "../auth/authContext";

export default function Inloggen() {
  const { gebruiker, bezig: sessieBezig, logIn } = useSessie();
  const navigeer = useNavigate();

  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  if (!sessieBezig && gebruiker) return <Navigate to="/winkel" replace />;

  async function verstuurFormulier(event: React.FormEvent) {
    event.preventDefault();
    setFout(null);
    setBezig(true);

    try {
      await logIn(email, wachtwoord);
      navigeer("/winkel", { replace: true });
    } catch (probleem) {
      setFout(probleem instanceof Error ? probleem.message : "Inloggen is niet gelukt.");
    } finally {
      setBezig(false);
    }
  }

  return (
    <Kader
      titel="Inloggen"
      uitleg="Log in om de werklijst van je winkel te zien."
      onder={
        <>
          Nog geen account?{" "}
          <Link to="/registreren" className="font-semibold text-olive-leaf hover:text-black-forest">
            Registreer je
          </Link>
          .
        </>
      }
    >
      <form onSubmit={verstuurFormulier} className="space-y-4" noValidate>
        {fout && <Melding tekst={fout} />}

        <Veld
          label="E-mailadres"
          type="email"
          waarde={email}
          zet={setEmail}
          autoComplete="email"
          placeholder="jij@voorbeeld.nl"
        />
        <Veld
          label="Wachtwoord"
          type="password"
          waarde={wachtwoord}
          zet={setWachtwoord}
          autoComplete="current-password"
        />

        <Knop type="submit" bezig={bezig}>
          Inloggen
        </Knop>
      </form>
    </Kader>
  );
}
