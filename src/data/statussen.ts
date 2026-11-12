import { CircleAlert, PackageCheck, TicketPercent } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * De drie statussen, zoals de server ze berekent (kern/status.js).
 * De client rekent nooit zelf een status uit: dan kan de kleur op de
 * telefoon afwijken van wat de server vindt.
 */
export type Status = "RUIM" | "AFPRIJZEN" | "OVER";

type Opmaak = {
  label: string;
  kort: string;
  uitleg: string;
  icoon: LucideIcon;
  /**
   * Kleur én vorm verschillen: alleen een lijn, een zachte vulling, of
   * een vol vlak. Clay en copper liggen qua kleurtoon dicht bij elkaar,
   * dus zonder dat verschil in vorm zijn "bijna afprijzen" en "over de
   * datum" niet uit elkaar te houden zonder kleurwaarneming.
   */
  klassen: string;
  /** Voor een vlak (vak, stellingkant): zelfde regel, groter oppervlak. */
  vlak: string;
};

export const statusOpmaak: Record<Status, Opmaak> = {
  RUIM: {
    label: "Ruim houdbaar",
    kort: "Ruim",
    uitleg: "Niets te doen",
    icoon: PackageCheck,
    klassen: "border-olive-leaf/40 text-olive-leaf",
    vlak: "border-olive-leaf/60 bg-olive-leaf/10 text-black-forest",
  },
  AFPRIJZEN: {
    label: "Bijna afprijzen",
    kort: "Afprijzen",
    uitleg: "Binnen de afprijsregel: stickeren",
    icoon: TicketPercent,
    klassen: "border-sunlit-clay bg-sunlit-clay/20 text-copperwood",
    vlak: "border-sunlit-clay bg-sunlit-clay/35 text-black-forest",
  },
  OVER: {
    label: "Over de datum",
    kort: "Over",
    uitleg: "Uit het schap halen",
    icoon: CircleAlert,
    klassen: "border-copperwood bg-copperwood text-cornsilk",
    vlak: "border-copperwood bg-copperwood text-cornsilk",
  },
};

export const alleStatussen: Status[] = ["RUIM", "AFPRIJZEN", "OVER"];

/** Een leeg vak of een lege kant: geen status, geen kleur. */
export const leegVlak = "border-black-forest/15 bg-white/50 text-black-forest";
