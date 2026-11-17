export interface Point {
   x: number;
   y: number;
}

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;

const clampZoom = (zoom: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(zoom)));

/**
 * Viewport position to world coordinates: relative to the canvas, divided by the zoom and,
 * unless `offset` is left out, shifted by the pan offset.
 */
export function toWorld(client: Point, canvasOrigin: Point, zoom: number, offset?: Point): Point {
   const scale = zoom / 100;
   const x = (client.x - canvasOrigin.x) / scale;
   const y = (client.y - canvasOrigin.y) / scale;
   return offset ? { x: x - offset.x, y: y - offset.y } : { x, y };
}

/**
 * Zoom to `targetZoom` while the world point under the screen position `screen`
 * (relative to the canvas) stays where it is. Returns the clamped zoom and the new pan offset.
 */
export function zoomAround(screen: Point, targetZoom: number, zoom: number, offset: Point): { zoom: number; offset: Point } {
   const before = { x: screen.x / (zoom / 100) - offset.x, y: screen.y / (zoom / 100) - offset.y };
   const nextZoom = clampZoom(targetZoom);
   const nextScale = nextZoom / 100;
   return { zoom: nextZoom, offset: { x: screen.x / nextScale - before.x, y: screen.y / nextScale - before.y } };
}

export const distanceBetween = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export const midpointOf = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
