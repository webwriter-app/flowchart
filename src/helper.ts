import { GraphNodeData } from "./definitions";

// --------------- Hilfsfunktionen ---------------

// Bestimmt die Maße des Knotens anhand der Textgrößen
export function measureTextSize(ctx: CanvasRenderingContext2D, text: string): { width: number; height: number } {
    const metrics = ctx.measureText(text);
    const width = Math.max(metrics.width + 20, 80);
    const height = Math.max(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 20, 60);
    return { width, height };
}

// Gibt die Anker Positionen einen Knotens in einem Array zurück
export function getAnchors(ctx: CanvasRenderingContext2D, element: GraphNodeData) {
    const anchors = [
        { x: element.x + measureTextSize(ctx, element.text).width / 2, y: element.y },
        { x: element.x + measureTextSize(ctx, element.text).width, y: element.y + measureTextSize(ctx, element.text).height / 2 },
        { x: element.x + measureTextSize(ctx, element.text).width / 2, y: element.y + measureTextSize(ctx, element.text).height },
        { x: element.x, y: element.y + measureTextSize(ctx, element.text).height / 2 },
    ];
    return anchors;
}

// Gibt das letzte gesuchte Element zurück, ansonsten undefined
export function findLast<T>(arr: T[], predicate: (element: T) => boolean): T | undefined {
    for (let i = arr.length - 1; i >= 0; i--) {
        const element = arr[i];
        if (predicate(element)) {
        return element;
        }
    }
    return undefined;
}

// Gibt den letzten gesuchten Index zurück, ansonsten -1
export function findLastIndex<T>(arr: T[], predicate: (element: T) => boolean): number {
    for (let i = arr.length - 1; i >= 0; i--) {
      const element = arr[i];
      if (predicate(element)) {
        return i;
      }
    }
    return -1;
  }

