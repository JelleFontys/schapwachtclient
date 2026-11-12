import { useState } from "react";
import { PackagePlus, Trash2 } from "lucide-react";

import { Knop } from "../Knop";
import { Melding } from "../Melding";
import { Statusmerk } from "../Statusmerk";
import { PartijFormulier } from "./PartijFormulier";
import { Uitkomstkeuze } from "./Uitkomstkeuze";
import { meldingVan } from "../../data/api";
import { hoeLang, kortDatum } from "../../data/datum";
import { partijen } from "../../data/partijen";
import type { Uitkomst } from "../../data/partijen";
import type { InhoudVak } from "../../data/plattegronden";

type Props = {
  vak: InhoudVak;
  /** Na elke wijziging: de stelling opnieuw ophalen. */
  veranderd: () => Promise<void>;
};

/**
 * Eén vak: wat erin ligt, vroegste datum bovenaan, en wat je ermee kunt
 * doen. Product toevoegen (SW-26), afmelden (SW-28), alles in één keer
 * leegmelden (SW-29).
 */
export function VakVenster({ vak, veranderd }: Props) {
  const [afmelden, setAfmelden] = useState<string | null>(null);
  const [leeg, setLeeg] = useState(false);
  const [toevoegen, setToevoegen] = useState(vak.partijen.length === 0);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [gemeld, setGemeld] = useState<string | null>(null);

  async function doe(actie: () => Promise<unknown>, bericht: string) {
    setFout(null);
    setBezig(true);
    try {
      await actie();
      await veranderd();
      setGemeld(bericht);
      setAfmelden(null);
      setLeeg(false);
    } catch (probleem) {
      setFout(meldingVan(probleem));
    } finally {
      setBezig(false);
    }
  }

  const meld = (uitkomst: Uitkomst) => uitkomst.toLowerCase();

  return (
    <div className="space-y-5">
      {fout && <Melding tekst={fout} />}
      {gemeld && (
        <p role="status" className="rounded-xl bg-olive-leaf/10 px-3.5 py-2.5 text-sm font-semibold text-olive-leaf">
          {gemeld}
        </p>
      )}

      {vak.partijen.length === 0 ? (
        <p className="text-sm text-black-forest/70">Dit vak is leeg.</p>
      ) : (
        <ul className="divide-y divide-black-forest/10 rounded-xl border border-black-forest/10">
          {vak.partijen.map((partij) => (
            <li key={partij.id} className="space-y-2 px-3.5 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{partij.product.naam}</p>
                  <p className="text-sm text-black-forest/65">
                    <time dateTime={partij.houdbaarTot}>{kortDatum(partij.houdbaarTot)}</time> ·{" "}
                    {hoeLang(partij.houdbaarTot)}
                    {partij.aantal !== null && <> · <span data-getal>{partij.aantal}</span> stuks</>}
                  </p>
                </div>
                <Statusmerk status={partij.status} klein />
              </div>

              {afmelden === partij.id ? (
                <Uitkomstkeuze
                  bezig={bezig}
                  annuleer={() => setAfmelden(null)}
                  kies={(uitkomst) =>
                    void doe(
                      () => partijen.afmelden(partij.id, uitkomst),
                      `${partij.product.naam} afgemeld als ${meld(uitkomst)}.`,
                    )
                  }
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAfmelden(partij.id);
                    setLeeg(false);
                    setGemeld(null);
                  }}
                  className="text-sm font-semibold text-olive-leaf hover:text-black-forest"
                >
                  Afmelden
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {vak.partijen.length > 1 && (
        <div className="rounded-xl border border-black-forest/10 p-3.5">
          {leeg ? (
            <>
              <p className="mb-2 text-sm font-semibold">
                Alle {vak.partijen.length} partijen in dit vak afmelden als:
              </p>
              <Uitkomstkeuze
                bezig={bezig}
                annuleer={() => setLeeg(false)}
                kies={(uitkomst) =>
                  void doe(
                    () => partijen.leegmelden(vak.id, uitkomst),
                    `Vak leeggemeld: alles afgemeld als ${meld(uitkomst)}.`,
                  )
                }
              />
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setLeeg(true);
                setAfmelden(null);
                setGemeld(null);
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-black-forest/70 hover:text-copperwood"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Heel vak leegmelden
            </button>
          )}
        </div>
      )}

      {toevoegen ? (
        <div className="rounded-xl border border-black-forest/10 p-4">
          <p className="mb-3 text-sm font-bold">Product in dit vak zetten</p>
          <PartijFormulier
            bewaar={async ({ product, houdbaarTot, aantal }) => {
              await partijen.voegToe({ vakId: vak.id, productId: product.id, houdbaarTot, aantal });
              await veranderd();
              setGemeld(`${product.naam} toegevoegd.`);
              setToevoegen(false);
            }}
          />
        </div>
      ) : (
        <Knop soort="lijn" onClick={() => { setToevoegen(true); setGemeld(null); }}>
          <PackagePlus aria-hidden="true" className="size-4" />
          Product toevoegen
        </Knop>
      )}
    </div>
  );
}
