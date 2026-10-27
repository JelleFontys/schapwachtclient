import { Link } from "react-router-dom";
import type { ReactNode } from "react";

/** Het kader om de inlog- en registratiepagina. */
export function Kader({
  titel,
  uitleg,
  children,
  onder,
}: {
  titel: string;
  uitleg: string;
  children: ReactNode;
  onder: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-12">
      <Link to="/" className="text-sm font-semibold text-olive-leaf hover:text-black-forest">
        SchapWacht
      </Link>

      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">{titel}</h1>
      <p className="mt-2 leading-relaxed text-black-forest/70">{uitleg}</p>

      <div className="mt-8">{children}</div>

      <p className="mt-6 text-sm text-black-forest/70">{onder}</p>
    </main>
  );
}
