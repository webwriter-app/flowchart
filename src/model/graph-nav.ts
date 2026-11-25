export type Direction = 'up' | 'down' | 'left' | 'right';

interface Point {
   x: number;
   y: number;
}

/** First item in reading order: top to bottom, then left to right. */
export function firstInReadingOrder<T>(items: T[], centerOf: (item: T) => Point): T | undefined {
   let best: T | undefined;
   let bestCenter: Point | undefined;
   for (const item of items) {
      const center = centerOf(item);
      if (!bestCenter || center.y < bestCenter.y - 10 || (Math.abs(center.y - bestCenter.y) <= 10 && center.x < bestCenter.x)) {
         best = item;
         bestCenter = center;
      }
   }
   return best;
}

/**
 * The item nearest to `from` in a direction. An item counts as lying in that direction when
 * its centre is further along the direction than across it, and the one with the smallest
 * distance along plus twice the offset across wins. Returns undefined when nothing lies that way.
 */
export function nextInDirection<T>(items: T[], from: T, direction: Direction, centerOf: (item: T) => Point): T | undefined {
   const origin = centerOf(from);
   let best: T | undefined;
   let bestScore = Infinity;
   for (const item of items) {
      if (item === from) continue;
      const center = centerOf(item);
      const dx = center.x - origin.x;
      const dy = center.y - origin.y;
      const along = direction === 'right' ? dx : direction === 'left' ? -dx : direction === 'down' ? dy : -dy;
      const across = direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx);
      if (along <= 0 || across > along) continue;
      const score = along + 2 * across;
      if (score < bestScore) {
         bestScore = score;
         best = item;
      }
   }
   return best;
}

/** The anchor of a node that faces a target: 0 top, 1 right, 2 bottom, 3 left. */
export function anchorToward(from: Point, to: Point): number {
   const dx = to.x - from.x;
   const dy = to.y - from.y;
   if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 1 : 3;
   return dy >= 0 ? 2 : 0;
}

/** The anchor on the opposite side. */
export const oppositeAnchor = (anchor: number) => (anchor + 2) % 4;
