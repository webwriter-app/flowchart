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

// Gibt die Koordinaten und Ankerpunkt eines Pfeils zurück 
export function getArrowInformation(ctx: CanvasRenderingContext2D, from: GraphNodeData, to: GraphNodeData) {
    
    let arrowInformation = {
      x: 0,
      y: 0,
      anchor: 0
    }; 

    const anchors = getAnchors(ctx, from);
  
    if (!from.connections) {
      console.log("Keine Verbindung gefunden.");
      return arrowInformation;
    }
  
    const connection = from.connections.find( x => x.connectedTo === to);
    if (connection) {
      arrowInformation.x = anchors[connection.anchor].x;
      arrowInformation.y = anchors[connection.anchor].y;
      arrowInformation.anchor = connection.anchor;
      return arrowInformation;
    }
  
    return arrowInformation;
}

// Sucht den nähstgelegenten Ankerpunkt und gibt den Index zurück 
export function getNearestCircle(ctx: CanvasRenderingContext2D, from: { x: number; y: number }, element: GraphNodeData) {
    const anchors = getAnchors(ctx, element);
  
    let minDistance = Infinity;
    let nearestCircleIndex = 0;
  
    anchors.forEach((position, index) => {
      const distance = Math.sqrt((position.x - from.x) ** 2 + (position.y - from.y) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCircleIndex = index;
      }
    });

    return nearestCircleIndex;
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

