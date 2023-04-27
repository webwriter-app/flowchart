import { Arrow } from "../../domain/Arrow";
import { GraphNode } from "../../domain/GraphNode";
import { v4 as uuidv4 } from 'uuid';

// Erzeuge die Verbindungen anhand der gegebenen Knoten 
export function createArrowsFromGraphNodes(arrows: Arrow[], graphNodes: GraphNode[]): Arrow[] {
   arrows = [];

   graphNodes.forEach((fromElement) => {
      if (fromElement.connections) {
         fromElement.connections.forEach((connection) => {
            const toElement = graphNodes.find((element) => element.id === connection.connectedToId);

            if (toElement && connection.direction === 'to') {
               arrows.push({
                  id: uuidv4(),
                  from: fromElement,
                  to: toElement,
                  points: [], // Initialisiere points als leeres Array, wird später in drawArrow aktualisiert
                  text: connection.text,
                  isSelected: false,
               });
            }
         });
      }
   });

   return arrows;
}

// Update die ID der Knoten von Preset, damit bei mehrmaligen Erzeugen von Presets, alle Knoten eine eindeutige ID besitzen
export function updatePresetIds(preset: GraphNode[]): GraphNode[] {
   // Erstelle eine Zuordnung zwischen alten und neuen IDs
   const idMap = new Map<string, string>();
   preset.forEach((element) => {
      idMap.set(element.id, uuidv4());
   });

   // Aktualisiere die IDs der Elemente und ihrer Verbindungen
   const updatedPreset = preset.map((element) => {
      const newElement = { ...element, id: idMap.get(element.id) };

      if (newElement.connections) {
         newElement.connections = newElement.connections.map((connection) => {
            return { ...connection, connectedToId: idMap.get(connection.connectedToId) };
         });
      }

      return newElement;
   });

   return updatedPreset;
}