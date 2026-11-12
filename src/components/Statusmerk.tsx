import { statusOpmaak } from "../data/statussen";
import type { Status } from "../data/statussen";

export function Statusmerk({ status, klein = false }: { status: Status; klein?: boolean }) {
  const { label, kort, icoon: Icoon, klassen } = statusOpmaak[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border font-semibold ${klassen} ${
        klein ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <Icoon aria-hidden="true" className={klein ? "size-3.5" : "size-4"} />
      {klein ? kort : label}
    </span>
  );
}
