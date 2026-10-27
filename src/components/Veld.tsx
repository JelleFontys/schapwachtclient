import { useId } from "react";

type Props = {
  label: string;
  type?: string;
  waarde: string;
  zet: (waarde: string) => void;
  uitleg?: string;
  autoComplete?: string;
  vereist?: boolean;
  placeholder?: string;
};

/**
 * Invoerveld met een label dat er echt aan vastzit. Het id komt uit
 * useId, zodat twee velden met hetzelfde label elkaar niet in de weg
 * zitten en een schermlezer altijd het juiste label voorleest.
 */
export function Veld({
  label,
  type = "text",
  waarde,
  zet,
  uitleg,
  autoComplete,
  vereist = true,
  placeholder,
}: Props) {
  const id = useId();
  const uitlegId = `${id}-uitleg`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>

      {uitleg && (
        <p id={uitlegId} className="mt-1 text-sm text-black-forest/60">
          {uitleg}
        </p>
      )}

      <input
        id={id}
        type={type}
        value={waarde}
        onChange={(event) => zet(event.target.value)}
        required={vereist}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-describedby={uitleg ? uitlegId : undefined}
        className="mt-2 w-full rounded-xl border border-black-forest/15 bg-white/60 px-3.5 py-2.5
                   text-black-forest placeholder:text-black-forest/35
                   focus:border-olive-leaf focus:bg-white focus:outline-none"
      />
    </div>
  );
}
