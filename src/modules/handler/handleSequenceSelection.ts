import { GraphNode } from '../../definitions/GraphNode';
import { Arrow } from '../../definitions/Arrow';
import { findLastGraphNode } from '../helper/utilities';
import { findArrow } from '../helper/arrowHelper';
import { findLastIndex } from '../helper/utilities';

export function handleSequenceSelection(
    ctx: CanvasRenderingContext2D,
    selectedSequence: {
        id: string;
        order: number;
        type: string;
    }[],
    graphNodes: GraphNode[],
    arrows: Arrow[],
    x: number,
    y: number
) {
    const clickedNode = findLastGraphNode(ctx, graphNodes, x, y);
    const clickedArrow = findArrow(arrows, x, y);
    const clicked = clickedNode ?? clickedArrow;
    const sequenceType = clickedNode ? 'node' : 'arrow';

    if (!clicked) {
        return;
    }

    const clickedItem: GraphNode | Arrow = clicked;

    selectedSequence.push({
        id: clickedItem.id,
        order: selectedSequence.length + 1,
        type: sequenceType,
    });

    return;

    // Aufgehoben für eine spätere Verwendung.
    {

        const existingIndex = findLastIndex(
            selectedSequence,
            (item) => item.id === clickedItem.id && item.type === sequenceType
        );

        const lastIndex = selectedSequence.length - 1;
        const lastItemType = lastIndex >= 0 ? selectedSequence[lastIndex].type : null;
        const lastItemId = lastIndex >= 0 ? selectedSequence[lastIndex].id : null;

        if (selectedSequence.length === 0 || (lastItemType !== sequenceType && existingIndex !== -1)) {
            selectedSequence.push({
                id: clickedItem.id,
                order: selectedSequence.length + 1,
                type: sequenceType,
            });
        } else if (existingIndex === lastIndex) {
            selectedSequence.pop();
        } else {
            let lastItem: GraphNode | Arrow | undefined;
            if (lastItemType === 'node') {
                lastItem = graphNodes.find((node) => node.id === lastItemId);
            } else {
                lastItem = arrows.find((arrow) => arrow.id === lastItemId);
            }

            if (sequenceType === 'node' && isArrow(lastItem)) {
                const clickedNode = clickedItem as GraphNode;
                const connectedNode = findConnectedNode(lastItem as Arrow, clickedNode, graphNodes);
                if (connectedNode || existingIndex !== -1) {
                    selectedSequence.push({
                        id: clickedItem.id,
                        order: selectedSequence.length + 1,
                        type: sequenceType,
                    });
                }
            } else if (sequenceType === 'arrow' && isGraphNode(lastItem)) {
                const clickedArrow = clickedItem as Arrow;
                const connectedArrow = findConnectedArrow(lastItem as GraphNode, clickedArrow, arrows);
                if (connectedArrow || existingIndex !== -1) {
                    selectedSequence.push({
                        id: clickedItem.id,
                        order: selectedSequence.length + 1,
                        type: sequenceType,
                    });
                }
            }
        }
    }
}

function findConnectedArrow(node: GraphNode, clickedArrow: Arrow, arrows: Arrow[]): Arrow | null {
    for (const arrow of arrows) {
        if (arrow.from.id === node.id && arrow.id === clickedArrow.id) {
            return arrow;
        }
    }
    return null;
}

function findConnectedNode(arrow: Arrow, clickedNode: GraphNode, graphNodes: GraphNode[]): GraphNode | null {
    for (const node of graphNodes) {
        if (arrow.to.id === node.id && clickedNode.id === node.id) {
            return node;
        }
    }
    return null;
}

function isGraphNode(obj: GraphNode | Arrow | undefined): obj is GraphNode {
    return (obj as GraphNode)?.node !== undefined;
}

function isArrow(obj: GraphNode | Arrow | undefined): obj is Arrow {
    return (obj as Arrow)?.from !== undefined;
}
