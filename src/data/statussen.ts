import { CircleAlert, PackageCheck, TicketPercent } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** De drie statussen die een schapvak kan hebben. */
export type Status = "ruim" | "afprijzen" | "over";

type Opmaak = {
  label: string;
  uitleg: string;
  icoon: LucideIcon;
  /**
   * Kleur én vorm verschillen: alleen een lijn, een zachte vulling, of
   * een vol vlak. Clay en copper liggen qua kleurtoon dicht bij elkaar,
   * dus zonder dat verschil in vorm zijn "bijna afprijzen" en "over de
   * datum" niet uit elkaar te houden zonder kleurwaarneming.
   */
  klassen: string;
};

export const statusOpmaak: Record<Status, Opmaak> = {
  ruim: {
    label: "Ruim houdbaar",
    uitleg: "Niets te doen",
    icoon: PackageCheck,
    klassen: "border-olive-leaf/40 text-olive-leaf",
  },
  afprijzen: {
    label: "Bijna afprijzen",
    uitleg: "Binnenkort stickeren",
    icoon: TicketPercent,
    klassen: "border-sunlit-clay bg-sunlit-clay/20 text-copperwood",
  },
  over: {
    label: "Over de datum",
    uitleg: "Vandaag uit het schap",
    icoon: CircleAlert,
    klassen: "border-copperwood bg-copperwood text-cornsilk",
  },
};

export const alleStatussen: Status[] = ["ruim", "afprijzen", "over"];
