import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  sluit: () => void;
  titel: string;
  onder?: string;
  breed?: boolean;
  children: ReactNode;
};

export function Venster({ open, sluit, titel, onder, breed = false, children }: Props) {
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
      onClick={(event) => {
        if (event.target === ref.current) sluit();
      }}
      className={`m-auto w-[calc(100%-2rem)] rounded-2xl bg-cornsilk p-0 text-black-forest shadow-xl
                  backdrop:bg-black-forest/40 ${breed ? "max-w-2xl" : "max-w-md"}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titelId} className="text-xl font-extrabold tracking-tight">
              {titel}
            </h2>
            {onder && <p className="mt-0.5 text-sm text-black-forest/60">{onder}</p>}
          </div>
          <button
            type="button"
            onClick={sluit}
            className="-m-1.5 rounded-lg p-1.5 text-black-forest/60 hover:text-black-forest"
          >
            <X aria-hidden="true" className="size-5" />
            <span className="sr-only">Sluiten</span>
          </button>
        </div>

        {open && <div className="mt-5">{children}</div>}
      </div>
    </dialog>
  );
}
