import { GraphNode } from "../../definitions/GraphNode";
import { Arrow } from "../../definitions/Arrow";

export function handleGraphNodeDoubleClick(
  graphNodes: GraphNode[],
  clickedNodeIndex: number,
  redrawCanvas: () => void
) {
  // Fordere den Benutzer auf, einen neuen Text einzugeben
  const newText = prompt('Bitte geben einen neuen Text ein:');

  if (newText !== null) {
    // Ersetze den Text des Elements
    graphNodes[clickedNodeIndex].text = newText;

    // Zeichne das Canvas neu, um die Änderungen anzuzeigen
    redrawCanvas();
  }
}

export function handleArrowDoubleClick(
  arrows: Arrow[],
  selectedArrowIndex: number,
  redrawCanvas: () => void
) {
  const selectedArrow = arrows[selectedArrowIndex];

  // Fordere den Benutzer auf, einen neuen Text für den Pfeil einzugeben
  const newText = prompt('Bitte gebe einen neuen Text für den Pfeil ein:');

  if (newText !== null) {
    // Ersetze den Text des Pfeils
    selectedArrow.text = newText;
    arrows.splice(selectedArrowIndex, 1);
    arrows.push(selectedArrow);

    redrawCanvas();
  }
}
