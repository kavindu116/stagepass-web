export function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString("en-US")}`;
}

/** Read a single string from Next.js searchParams values. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** "C7,C8" -> ["C7", "C8"] (trimmed, de-duplicated, max 6). */
export function parseSeatIds(value: string | undefined): string[] {
  if (!value) return [];
  return Array.from(
    new Set(
      value
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean),
    ),
  ).slice(0, 6);
}
