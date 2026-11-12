import { useEffect, useId, useState } from "react";

import { meldingVan } from "../../data/api";
import { plattegronden, stellingen, stellingNaam } from "../../data/plattegronden";
import type { Plattegrond, PlattegrondKort, StellingInhoud } from "../../data/plattegronden";

type Props = {
  kies: (vak: { id: string; tekst: string } | null) => void;
};

export function PlekKiezer({ kies }: Props) {
  const ids = { p: useId(), s: useId(), k: useId(), r: useId(), v: useId() };

  const [lijst, setLijst] = useState<PlattegrondKort[]>([]);
  const [plattegrondId, setPlattegrondId] = useState("");
  const [plattegrond, setPlattegrond] = useState<Plattegrond | null>(null);
  const [stellingId, setStellingId] = useState("");
  const [inhoud, setInhoud] = useState<StellingInhoud | null>(null);
  const [kant, setKant] = useState("");
  const [rij, setRij] = useState("");
  const [vakId, setVakId] = useState("");
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    plattegronden
      .lijst()
      .then(setLijst)
      .catch((p: unknown) => setFout(meldingVan(p)));
  }, []);

  useEffect(() => {
    if (!plattegrondId) return;
    let weg = false;
    plattegronden
      .haal(plattegrondId)
      .then((p) => !weg && setPlattegrond(p))
      .catch((p: unknown) => !weg && setFout(meldingVan(p)));
    return () => {
      weg = true;
    };
  }, [plattegrondId]);

  useEffect(() => {
    if (!stellingId) return;
    let weg = false;
    stellingen
      .inhoud(stellingId)
      .then((s) => !weg && setInhoud(s))
      .catch((p: unknown) => !weg && setFout(meldingVan(p)));
    return () => {
      weg = true;
    };
  }, [stellingId]);

  const huidigePlattegrond = plattegrond?.id === plattegrondId ? plattegrond : null;
  const huidigeInhoud = inhoud?.id === stellingId ? inhoud : null;
  const gekozenKant = huidigeInhoud?.kanten.find((k) => k.id === kant) ?? null;
  const gekozenRij = gekozenKant?.rijen.find((r) => String(r.nummer) === rij) ?? null;

  function zetVak(id: string) {
    setVakId(id);
    const vak = gekozenRij?.vakken.find((v) => v.id === id);
    kies(
      vak && gekozenKant
        ? { id: vak.id, tekst: `${gekozenKant.naam}, rij ${gekozenRij?.nummer}, vak ${vak.positie}` }
        : null,
    );
  }

  const keuze = "mt-1 w-full rounded-xl border border-black-forest/15 bg-white/60 px-3 py-2 focus:border-olive-leaf focus:outline-none disabled:opacity-50";

  return (
    <div className="space-y-3">
      {fout && <p className="text-sm text-copperwood">{fout}</p>}

      <div>
        <label htmlFor={ids.p} className="text-sm font-semibold">Plattegrond</label>
        <select
          id={ids.p}
          className={keuze}
          value={plattegrondId}
          onChange={(e) => {
            setPlattegrondId(e.target.value);
            setStellingId("");
            setKant("");
            setRij("");
            zetVakLeeg();
          }}
        >
          <option value="">Kies…</option>
          {lijst.map((p) => (
            <option key={p.id} value={p.id}>{p.naam}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={ids.s} className="text-sm font-semibold">Stelling</label>
        <select
          id={ids.s}
          className={keuze}
          value={stellingId}
          disabled={!huidigePlattegrond}
          onChange={(e) => {
            setStellingId(e.target.value);
            setKant("");
            setRij("");
            zetVakLeeg();
          }}
        >
          <option value="">Kies…</option>
          {huidigePlattegrond?.stellingen.map((s) => (
            <option key={s.id} value={s.id}>{stellingNaam(s)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label htmlFor={ids.k} className="text-sm font-semibold">Kant</label>
          <select
            id={ids.k}
            className={keuze}
            value={kant}
            disabled={!huidigeInhoud}
            onChange={(e) => {
              setKant(e.target.value);
              setRij("");
              zetVakLeeg();
            }}
          >
            <option value="">Kies…</option>
            {huidigeInhoud?.kanten.map((k) => (
              <option key={k.id} value={k.id}>{k.naam}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.r} className="text-sm font-semibold">Rij</label>
          <select
            id={ids.r}
            className={keuze}
            value={rij}
            disabled={!gekozenKant}
            onChange={(e) => {
              setRij(e.target.value);
              zetVakLeeg();
            }}
          >
            <option value="">…</option>
            {gekozenKant?.rijen.map((r) => (
              <option key={r.nummer} value={r.nummer}>{r.nummer}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.v} className="text-sm font-semibold">Vak</label>
          <select
            id={ids.v}
            className={keuze}
            value={vakId}
            disabled={!gekozenRij}
            onChange={(e) => zetVak(e.target.value)}
          >
            <option value="">…</option>
            {gekozenRij?.vakken.map((v) => (
              <option key={v.id} value={v.id}>{v.positie}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  function zetVakLeeg() {
    setVakId("");
    kies(null);
  }
}
