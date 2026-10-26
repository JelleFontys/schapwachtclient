import { statusOpmaak } from "../data/statussen";
import type { Status } from "../data/statussen";

/** Toont de status van een schapvak als een merkje met icoon en tekst. */
export function Statusmerk({ status }: { status: Status }) {
  const { label, icoon: Icoon, klassen } = statusOpmaak[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${klassen}`}
    >
      <Icoon aria-hidden="true" className="size-4 shrink-0" />
      {label}
    </span>
  );
}
