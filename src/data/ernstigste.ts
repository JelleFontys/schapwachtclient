import type { Status } from "./statussen";

const VOLGORDE: Status[] = ["RUIM", "AFPRIJZEN", "OVER"];

/**
 * De ernstigste status uit een lijst, of null als er niets is. Alleen
 * om twee statussen die de server al berekende samen te vatten (de
 * kanten van een stelling); een status zelf uitrekenen doet de client
 * nooit.
 */
export function ernstigste(statussen: (Status | null | undefined)[]): Status | null {
  let uit: Status | null = null;
  for (const s of statussen) {
    if (s && (uit === null || VOLGORDE.indexOf(s) > VOLGORDE.indexOf(uit))) uit = s;
  }
  return uit;
}
