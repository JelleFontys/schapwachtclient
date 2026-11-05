import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  sluit: () => void;
  titel: string;
  children: ReactNode;
};

/**
 * Een venster boven de pagina.
 *
 * Gebouwd op het <dialog>-element van de browser zelf. Dat houdt de
 * focus binnen het venster, sluit met Escape en maakt de rest van de
 * pagina onbereikbaar zolang het open is. Dat zelf nabouwen kost veel
 * code en gaat bijna altijd ergens mis voor iemand met een
 * toetsenbord of schermlezer.
 */
export function Venster({ open, sluit, titel, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titelId = useId();

  useEffect(() => {
    const venster = ref.current;
    if (!venster) return;

    if (open && !venster.open) venster.showModal();
    if (!open && venster.open) venster.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titelId}
      onClose={sluit}
      // Klik op de donkere achtergrond: dan is het doel het venster
      // zelf en niet iets erin.
      onClick={(event) => {
        if (event.target === ref.current) sluit();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-cornsilk p-0 text-black-forest
                 shadow-xl backdrop:bg-black-forest/40"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titelId} className="text-xl font-extrabold tracking-tight">
            {titel}
          </h2>
          <button
            type="button"
            onClick={sluit}
            className="-m-1.5 rounded-lg p-1.5 text-black-forest/60 hover:text-black-forest"
          >
            <X aria-hidden="true" className="size-5" />
            <span className="sr-only">Sluiten</span>
          </button>
        </div>

        {/* Alleen tonen als het open is, zodat een formulier elke keer
            met verse waarden begint. */}
        {open && <div className="mt-5">{children}</div>}
      </div>
    </dialog>
  );
}
