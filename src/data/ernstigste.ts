import type { Status } from "./statussen";

const VOLGORDE: Status[] = ["RUIM", "AFPRIJZEN", "OVER"];

export function ernstigste(statussen: (Status | null | undefined)[]): Status | null {
  let uit: Status | null = null;
  for (const s of statussen) {
    if (s && (uit === null || VOLGORDE.indexOf(s) > VOLGORDE.indexOf(uit))) uit = s;
  }
  return uit;
}
