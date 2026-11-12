import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Camera as CameraIcoon, CameraOff } from "lucide-react";

import { Knop } from "../Knop";

/**
 * Alleen de soorten streepjescodes die op levensmiddelen staan. Hoe
 * minder soorten de lezer probeert, hoe sneller hij er een vindt.
 */
const SOORTEN = [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E];

function uitleg(fout: unknown) {
  const naam = fout instanceof Error ? fout.name : "";
  if (naam === "NotAllowedError") return "De camera mag niet aan. Geef toestemming in je browser, of typ de barcode hieronder.";
  if (naam === "NotFoundError" || naam === "OverconstrainedError") return "Geen camera gevonden. Typ de barcode hieronder.";
  if (!window.isSecureContext) return "De camera werkt alleen via https. Typ de barcode hieronder.";
  return "De camera start niet. Typ de barcode hieronder.";
}

/**
 * De camera met barcodeherkenning (SW-36). Stopt na de eerste barcode,
 * zodat één product niet tien keer gescand wordt.
 *
 * De camera gaat pas aan na een tik op de knop. Dan weet je waarom de
 * browser om toestemming vraagt, en Safari op de iPhone wil dat ook.
 */
export function Camera({ gevonden }: { gevonden: (code: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [aan, setAan] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    if (!aan || !video.current) return;

    let controls: IScannerControls | null = null;
    let klaar = false;
    const lezer = new BrowserMultiFormatReader(new Map([[DecodeHintType.POSSIBLE_FORMATS, SOORTEN]]));

    lezer
      .decodeFromConstraints(
        { audio: false, video: { facingMode: { ideal: "environment" } } },
        video.current,
        (resultaat, _fout, ctl) => {
          if (resultaat && !klaar) {
            klaar = true;
            ctl.stop();
            setAan(false);
            gevonden(resultaat.getText());
          }
        },
      )
      .then((c) => {
        controls = c;
        if (klaar) c.stop();
      })
      .catch((probleem: unknown) => {
        setFout(uitleg(probleem));
        setAan(false);
      });

    return () => {
      klaar = true;
      controls?.stop();
    };
  }, [aan, gevonden]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black-forest">
        <video
          ref={video}
          muted
          playsInline
          aria-label="Camerabeeld"
          className={`size-full object-cover ${aan ? "" : "hidden"}`}
        />
        {aan ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 bg-sunlit-clay/80" />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-cornsilk/80">
            <div>
              <CameraOff aria-hidden="true" className="mx-auto size-8" />
              <p className="mt-2 text-sm">Camera staat uit</p>
            </div>
          </div>
        )}
      </div>

      {fout && <p role="alert" className="text-sm font-semibold text-copperwood">{fout}</p>}

      {aan ? (
        <Knop soort="lijn" onClick={() => setAan(false)}>
          <CameraOff aria-hidden="true" className="size-4" />
          Camera uit
        </Knop>
      ) : (
        <Knop
          onClick={() => {
            setFout(null);
            setAan(true);
          }}
        >
          <CameraIcoon aria-hidden="true" className="size-4" />
          Camera aanzetten
        </Knop>
      )}
    </div>
  );
}
