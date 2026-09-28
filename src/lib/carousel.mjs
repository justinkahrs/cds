/** Normalize a selection in a circular collection, including empty collections. */
export function wrapIndex(index, length) {
  return length > 0 ? ((index % length) + length) % length : 0;
}

/** Nearest signed distance, so the ends join into one continuous ring. */
export function circularOffset(index, selected, length) {
  if (!length) return 0;
  const offset = wrapIndex(index - selected, length);
  return offset > length / 2 ? offset - length : offset;
}

export function searchMatches(text, query) {
  return text.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
}

/** Multi-disc releases occupy their first listed slot; unassigned albums come last. */
export function slotOrder(slot) {
  const match = /^\s*(\d+)/.exec(slot || '');
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

export const CASE_WIDTH = 214;
export const CAROUSEL_RADIUS = 480;
export const CAROUSEL_STEP = Math.PI / 6;

/** Every case uses the same angular position, including between album stops. */
export function casePose(offset, count) {
  const step = Math.max(CAROUSEL_STEP, 2 * Math.PI / Math.max(count, 1));
  const angle = offset * step;
  return {
    x: Math.sin(angle) * CAROUSEL_RADIUS,
    z: (Math.cos(angle) - 1) * CAROUSEL_RADIUS,
    y: -Math.abs(offset) * 6 - 14 * Math.exp(-4 * offset * offset),
    angle: angle * 180 / Math.PI,
    brightness: Math.max(0.3, 1 - Math.abs(offset) * 0.15),
    opacity: Math.max(0, Math.min(1, (1.7 - Math.abs(angle)) / 0.3)),
  };
}

/** Enough forward travel for two visual turns, ending exactly on the chosen album. */
export function surpriseDistance(start, target, count) {
  if (count < 2) return 0;
  const distance = wrapIndex(target - start, count);
  return distance + Math.ceil(Math.max(0, 24 - distance) / count) * count;
}

/** Zero velocity at either end: wind up, spin, then brake into the selected slot. */
export function spinProgress(progress) {
  const t = Math.max(0, Math.min(1, progress));
  return t * t * t * (t * (t * 6 - 15) + 10);
}
