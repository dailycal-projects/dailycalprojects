import type { Building, Unit } from "./data";
import { strings } from "./strings";
import { fmt, pl } from "./text";

export const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export function tenureText(u: Pick<Unit, "tenure" | "before">): string {
  if (u.tenure === null) return strings.tenure.unknown;
  const y = Math.floor(u.tenure);
  if (u.before) return fmt(strings.tenure.orMore, { years: y });
  if (y < 1) return strings.tenure.new;
  return fmt(strings.tenure.years, { years: y });
}

/** Unit name as the registry has it; unnamed units fall back to their street address. */
export function unitName(b: Building, u: Unit): string {
  if (u.label) return u.label;
  if (b.uaddrs.length > 1) return b.uaddrs[u.ua];
  return strings.unit.noNumber;
}

/** "unit 204", or the address for unnamed units. */
export function unitTitle(b: Building, u: Unit): string {
  return u.label ? fmt(strings.unit.title, { label: u.label }) : unitName(b, u);
}

export function years(n: number): string {
  return pl(strings.years, Math.round(n));
}
