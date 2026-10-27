import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  bezig?: boolean;
  type?: "button" | "submit";
  soort?: "vol" | "lijn";
  onClick?: () => void;
};

const stijlen = {
  vol: "bg-olive-leaf text-cornsilk hover:bg-black-forest",
  lijn: "border border-black-forest/20 text-black-forest hover:border-olive-leaf hover:text-olive-leaf",
} as const;

export function Knop({ children, bezig = false, type = "button", soort = "vol", onClick }: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={bezig}
      // aria-busy: een schermlezer meldt dan dat er iets loopt. Alleen
      // een draaiend icoontje zegt daar niets.
      aria-busy={bezig}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5
                  text-sm font-semibold transition-colors disabled:opacity-60 ${stijlen[soort]}`}
    >
      {bezig && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
