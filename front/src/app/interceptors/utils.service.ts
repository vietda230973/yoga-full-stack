import { DateTime } from "luxon";

export function normalizeToYmdLuxon(value: string | Date, zone = "Europe/Paris"): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const dt = value instanceof Date
    ? DateTime.fromJSDate(value, { zone })
    : DateTime.fromISO(value, { zone }); // interprète les ISO sans offset dans `zone`
  if (!dt.isValid) throw new RangeError(`Date invalide : ${String(value)}`);
  return dt.toFormat("yyyy-MM-dd");
}
