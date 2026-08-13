export function normalizeChain(chain: string | string[] | undefined | null): string[] {
  if (!chain) return [];
  if (Array.isArray(chain)) return chain;
  if (typeof chain === "string") {
    try {
      const parsed = JSON.parse(chain);
      return Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
    } catch {
      return chain
        .split(/\s*[,\n]\s*/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}
