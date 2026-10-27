import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Store, UserPlus } from "lucide-react";

import { Kader } from "../components/Kader";
import { Knop } from "../components/Knop";
import { Melding } from "../components/Melding";
import { Veld } from "../components/Veld";
import { useSessie } from "../auth/authContext";

/**
 * Een account hoort altijd bij een winkel. Daarom is de eerste keuze
 * op deze pagina niet een veld maar een richting: begin je een nieuwe
 * winkel, of sluit je je aan bij een bestaande? Dat bepaalt ook je rol,
 * en dat staat er daarom bij.
 */
type Keuze = "nieuw" | "aansluiten";

export default function Registreren() {
  const { gebruiker, bezig: sessieBezig, registreer } = useSessie();
  const navigeer = useNavigate();

  const [keuze, setKeuze] = useState<Keuze>("nieuw");
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [winkelnaam, setWinkelnaam] = useState("");
  const [code, setCode] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  if (!sessieBezig && gebruiker) return <Navigate to="/winkel" replace />;

  async function verstuurFormulier(event: React.FormEvent) {
    event.preventDefault();
    setFout(null);
    setBezig(true);

    try {
      await registreer({
        naam,
        email,
        wachtwoord,
        ...(keuze === "nieuw" ? { winkelnaam } : { uitnodigingscode: code }),
      });
      navigeer("/winkel", { replace: true });
    } catch (probleem) {
      setFout(probleem instanceof Error ? probleem.message : "Registreren is niet gelukt.");
    } finally {
      setBezig(false);
    }
  }

  return (
    <Kader
      titel="Account aanmaken"
      uitleg="Begin een nieuwe winkel, of sluit je aan bij de winkel van een collega."
      onder={
        <>
          Heb je al een account?{" "}
          <Link to="/inloggen" className="font-semibold text-olive-leaf hover:text-black-forest">
            Log in
          </Link>
          .
        </>
      }
    >
      <form onSubmit={verstuurFormulier} className="space-y-4" noValidate>
        {fout && <Melding tekst={fout} />}

        <fieldset>
          <legend className="text-sm font-semibold">Hoe sluit je aan?</legend>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <KeuzeKnop
              actief={keuze === "nieuw"}
              kies={() => setKeuze("nieuw")}
              icoon={Store}
              titel="Nieuwe winkel"
              uitleg="Je wordt leidinggevende"
            />
            <KeuzeKnop
              actief={keuze === "aansluiten"}
              kies={() => setKeuze("aansluiten")}
              icoon={UserPlus}
              titel="Aansluiten"
              uitleg="Je wordt medewerker"
            />
          </div>
        </fieldset>

        {keuze === "nieuw" ? (
          <Veld
            label="Naam van de winkel"
            waarde={winkelnaam}
            zet={setWinkelnaam}
            placeholder="Parkshop De Vlinderhoeve"
          />
        ) : (
          <Veld
            label="Uitnodigingscode"
            waarde={code}
            zet={setCode}
            uitleg="Deze code krijg je van de leidinggevende van je winkel."
            placeholder="ABCD-2345"
          />
        )}

        <Veld label="Jouw naam" waarde={naam} zet={setNaam} autoComplete="name" />
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
          autoComplete="new-password"
          uitleg="Minstens 8 tekens, met een letter en een cijfer."
        />

        <Knop type="submit" bezig={bezig}>
          Account aanmaken
        </Knop>
      </form>
    </Kader>
  );
}

function KeuzeKnop({
  actief,
  kies,
  icoon: Icoon,
  titel,
  uitleg,
}: {
  actief: boolean;
  kies: () => void;
  icoon: typeof Store;
  titel: string;
  uitleg: string;
}) {
  return (
    <button
      type="button"
      onClick={kies}
      // aria-pressed: hiermee hoort een schermlezer welke van de twee
      // aan staat. Een dikkere rand alleen is niet genoeg.
      aria-pressed={actief}
      className={`rounded-xl border px-3.5 py-3 text-left transition-colors ${
        actief
          ? "border-olive-leaf bg-olive-leaf/10"
          : "border-black-forest/15 hover:border-black-forest/35"
      }`}
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <Icoon aria-hidden="true" className="size-4 shrink-0" />
        {titel}
      </span>
      <span className="mt-0.5 block text-xs text-black-forest/60">{uitleg}</span>
    </button>
  );
}
