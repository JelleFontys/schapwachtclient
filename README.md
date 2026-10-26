# schapwachtclient

De webapp van SchapWacht. Winkelmedewerkers leggen bij het vullen de
houdbaarheidsdatum vast en zien elke ochtend welke vakken aandacht nodig
hebben. Bedoeld voor gebruik op een telefoon, met één hand.

De API staat in een eigen repo: `schapwachtserver`.

## Techniek

| Onderdeel | Keuze |
|---|---|
| Framework | React 19 met TypeScript |
| Bundelaar | Vite |
| Routing | React Router |
| Opmaak | Tailwind CSS 4 |
| Lettertype | Montserrat, lokaal via `@fontsource-variable` |
| Iconen | lucide-react |

## Opbouw

```
src/
  components/   losse onderdelen die op meerdere pagina's terugkomen
  pages/        één bestand per pagina
  data/         statussen, API-aanroepen
  App.tsx       routes
  main.tsx      startpunt
  index.css     Tailwind-thema met het palet
public/         bestanden die ongewijzigd meegaan
```

## Starten

```bash
npm install
npm run dev     # http://localhost:5173
```

Zorg dat de API op poort 3000 draait. De ontwikkelserver stuurt `/api`
daarheen door, zodat de browser alles als dezelfde herkomst ziet en CORS
niet meespeelt.

## Commando's

| Commando | Wat het doet |
|---|---|
| `npm run dev` | Start de app met hot reload |
| `npm run build` | Controleert types en bouwt naar `dist/` |
| `npm run lint` | Controleert de code met ESLint |
| `npm run typecheck` | Controleert alleen de types |

## Vormgeving

Het palet zit als thema in `src/index.css`:

| Kleur | Hex | Waarvoor |
|---|---|---|
| Cornsilk | `#fefae0` | Achtergrond |
| Black forest | `#283618` | Tekst en donkere vlakken |
| Olive leaf | `#606c38` | Primair, en status "ruim houdbaar" |
| Sunlit clay | `#dda15e` | Status "bijna afprijzen" |
| Copperwood | `#bc6c25` | Status "over de datum" |

De drie statussen verschillen niet alleen in kleur maar ook in vorm:
alleen een lijn, een zachte vulling, of een vol vlak. Clay en copper
liggen qua kleurtoon dicht bij elkaar, dus zonder dat verschil zijn ze
niet uit elkaar te houden zonder kleurwaarneming. Daar komt per status
een icoon en een tekst bij.

## Uitrollen (Dokploy)

`.github/workflows/publish.yml` bouwt bij elke push naar `main` en zet
het resultaat uit `dist/` op de branch **`build`**.

In Dokploy koppel je deze repo als **Static** applicatie op de branch
`build`. Er is dan geen buildstap in Dokploy nodig: de bestanden staan er
al klaar.

Het API-adres staat in de workflow als `VITE_API_URL`. Vite bakt dat in
tijdens het bouwen, dus wil je het veranderen, pas het daar aan en push
opnieuw.

Domein: `schapclient.web4ever.nl`.
