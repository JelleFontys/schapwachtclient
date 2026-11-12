import { CircleAlert } from "lucide-react";

export function Melding({ tekst }: { tekst: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-copperwood bg-copperwood/10
                 px-3.5 py-3 text-sm text-copperwood"
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {tekst}
    </p>
  );
}
