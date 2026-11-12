import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";

type Props = {
  label: string;
  waarde: number;
  zet: (waarde: number) => void;
  min: number;
  max: number;
  klein?: boolean;
};

export function Teller({ label, waarde, zet, min, max, klein = false }: Props) {
  const id = useId();
  const [getypt, setGetypt] = useState<string | null>(null);

  const tekst = getypt ?? String(waarde);
  const ongeldig = getypt !== null && String(waarde) !== getypt;

  return (
    <div>
      <label
        htmlFor={id}
        className={klein ? "block text-xs font-semibold text-black-forest/70" : "block text-sm font-semibold"}
      >
        {label}
      </label>

      <div
        className={`mt-1 flex items-center rounded-xl border bg-white/60 ${
          ongeldig ? "border-copperwood" : "border-black-forest/15"
        }`}
      >
        <button
          type="button"
          onClick={() => zet(Math.max(min, waarde - 1))}
          disabled={waarde <= min}
          className="grid size-9 shrink-0 place-items-center rounded-l-xl text-black-forest/70
                     hover:text-black-forest disabled:opacity-30"
        >
          <Minus aria-hidden="true" className="size-4" />
          <span className="sr-only">{label}: minder</span>
        </button>

        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={tekst}
          data-getal
          onFocus={() => setGetypt(String(waarde))}
          onBlur={() => setGetypt(null)}
          onChange={(event) => {
            setGetypt(event.target.value);
            const getal = Number(event.target.value);
            if (event.target.value !== "" && Number.isInteger(getal) && getal >= min && getal <= max) {
              zet(getal);
            }
          }}
          className="w-full min-w-0 bg-transparent text-center font-semibold focus:outline-none
                     [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
                     [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={() => zet(Math.min(max, waarde + 1))}
          disabled={waarde >= max}
          className="grid size-9 shrink-0 place-items-center rounded-r-xl text-black-forest/70
                     hover:text-black-forest disabled:opacity-30"
        >
          <Plus aria-hidden="true" className="size-4" />
          <span className="sr-only">{label}: meer</span>
        </button>
      </div>
    </div>
  );
}
