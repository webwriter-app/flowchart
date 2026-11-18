import type { WebwriterFlowchart } from '../../widgets/webwriter-flowchart';
import type { GraphNode } from '../../model/graph-node';
import type { Arrow } from '../../model/arrow';
import { anchorToward, firstInReadingOrder, nextInDirection, oppositeAnchor, type Direction } from '../../model/graph-nav';
import { nodeLabel } from '../../model/node-labels';
import { handleArrowCreation } from '../handler/mouse-up-handler';
import { getAnchors } from './anchor-helper';
import { measureTextSize } from './utilities';

const ARROW_KEYS: Record<string, Direction> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
};

/** Distance a node moves per Alt+arrow, and per Alt+Shift+arrow (world units). */
const MOVE_STEP = 10;
const MOVE_STEP_LARGE = 50;

/** Distance the canvas pans per Shift+arrow (screen px). */
const PAN_STEP = 60;

/**
 * @internal Keyboard input of the flowchart canvas. The canvas is one tab stop; inside it
 * the arrow keys walk from node to node, Enter acts on the focused node (adds it to the
 * path being selected, or edits its caption), `a` walks along its arrows, `c` connects it
 * to another node, Alt+arrows move it, Shift+arrows pan and `+`/`-` zoom.
 */
export class CanvasKeyboard {
    constructor(private host: WebwriterFlowchart) {}

    /** @internal The node the keyboard works on; drawn with a focus ring while the canvas has focus. */
    focusNode?: GraphNode;

    /** @internal Whether the canvas has keyboard focus. */
    active = false;

    /** @internal The node a connection is being drawn from, while `c` mode is on. */
    private connectFrom?: GraphNode;

    private get canEdit(): boolean {
        return this.host.allowStudentEdit || this.host.isEditable();
    }

    private get canPan(): boolean {
        return this.host.allowStudentPan || this.host.isEditable();
    }

    /** @internal The focus ring is only drawn for a node that still exists. */
    get ringNode(): GraphNode | undefined {
        return this.active && this.focusNode && this.host.graphNodes.includes(this.focusNode) ? this.focusNode : undefined;
    }

    private centerOf = (node: GraphNode) => {
        const size = measureTextSize(this.host.ctx, node.text);
        return { x: node.x + size.width / 2, y: node.y + size.height / 2 };
    };

    handleFocus = () => {
        this.active = true;
        this.host.view.redrawCanvas();
    };

    handleBlur = () => {
        this.active = false;
        this.endConnect();
        this.host.view.redrawCanvas();
    };

    handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey || event.metaKey || !this.host.ctx) return;
        const direction = ARROW_KEYS[event.key];
        let handled = false;
        if (direction) {
            handled = event.altKey ? this.moveNode(direction, event.shiftKey ? MOVE_STEP_LARGE : MOVE_STEP)
                : event.shiftKey ? this.pan(direction)
                : this.navigate(direction);
        } else if (event.key === 'Enter' || event.key === ' ') {
            handled = this.activate();
        } else if (event.key === 'a' && !event.altKey) {
            handled = this.walkArrows();
        } else if (event.key === 'c' && !event.altKey) {
            handled = this.startConnect();
        } else if (event.key === 'Escape') {
            handled = this.escape();
        } else if (event.key === '0') {
            handled = this.canPan;
            if (handled) this.host.view.fitToContent();
        } else if (event.key === '+' || event.key === '=') {
            handled = this.zoom(10);
        } else if (event.key === '-' || event.key === '_') {
            handled = this.zoom(-10);
        }
        if (handled) event.preventDefault();
    };

    private announce(text: string) {
        this.host.announcement = text;
    }

    private describe(node: GraphNode): string {
        const kind = nodeLabel(node.node, (text) => this.host.msg(text));
        const text = node.text.trim();
        return text && text !== kind ? `${kind}: ${text}` : kind;
    }

    /** Make a node the one the keyboard works on. Authors also get it selected, as a click would. */
    private focusOn(node: GraphNode) {
        const host = this.host;
        this.focusNode = node;
        if (this.canEdit && !this.connectFrom) {
            host.selectedNode = node;
            host.selectedNodes = [];
            host.pointer.updateAnchorListeners();
        }
        host.selectedArrow = undefined;
        this.reveal(node);
        this.announce(this.describe(node));
        host.view.redrawCanvas();
    }

    /** Pan the canvas so that the node lies inside the visible area. */
    private reveal(node: GraphNode) {
        const host = this.host;
        const scale = host.zoomLevel / 100;
        const size = measureTextSize(host.ctx, node.text);
        const palette = host.shadowRoot?.querySelector<HTMLElement>('.flowchart-menu:not(.collapsed)');
        const margin = 24;
        const width = host.canvas.clientWidth;
        const height = host.canvas.clientHeight - (palette?.offsetHeight ?? 0);
        const left = (node.x + host.canvasOffsetX) * scale;
        const right = (node.x + size.width + host.canvasOffsetX) * scale;
        const top = (node.y + host.canvasOffsetY) * scale;
        const bottom = (node.y + size.height + host.canvasOffsetY) * scale;
        if (right > width - margin) host.canvasOffsetX -= (right - (width - margin)) / scale;
        if (left < margin) host.canvasOffsetX += (margin - left) / scale;
        if (bottom > height - margin) host.canvasOffsetY -= (bottom - (height - margin)) / scale;
        if (top < margin) host.canvasOffsetY += (margin - top) / scale;
    }

    private navigate(direction: Direction): boolean {
        const host = this.host;
        const candidates = this.connectFrom ? host.graphNodes.filter((node) => node !== this.connectFrom && node.node !== 'text') : host.graphNodes;
        const current = this.focusNode && host.graphNodes.includes(this.focusNode) ? this.focusNode : undefined;
        if (!candidates.length) return this.pan(direction);
        const next = current ? nextInDirection(candidates, current, direction, this.centerOf) : firstInReadingOrder(candidates, this.centerOf);
        if (!next) return true;
        this.focusOn(next);
        if (this.connectFrom) this.aimConnection(next);
        return true;
    }

    private pan(direction: Direction): boolean {
        if (!this.canPan) return false;
        const host = this.host;
        const step = PAN_STEP / (host.zoomLevel / 100);
        if (direction === 'left') host.canvasOffsetX += step;
        if (direction === 'right') host.canvasOffsetX -= step;
        if (direction === 'up') host.canvasOffsetY += step;
        if (direction === 'down') host.canvasOffsetY -= step;
        host.view.redrawCanvas();
        return true;
    }

    private zoom(delta: number): boolean {
        if (!this.canPan) return false;
        const { canvas, zoomLevel } = this.host;
        this.host.view.zoomAtPoint(canvas.clientWidth / 2, canvas.clientHeight / 2, zoomLevel + delta);
        return true;
    }

    private moveNode(direction: Direction, step: number): boolean {
        const host = this.host;
        const node = this.focusNode;
        if (!this.canEdit || !node || !host.graphNodes.includes(node) || this.connectFrom) return false;
        const group = host.selectedNodes.length > 1 && host.selectedNodes.includes(node) ? host.selectedNodes : [node];
        for (const moved of group) {
            if (direction === 'left') moved.x -= step;
            if (direction === 'right') moved.x += step;
            if (direction === 'up') moved.y -= step;
            if (direction === 'down') moved.y += step;
        }
        host.graphNodes = [...host.graphNodes];
        this.reveal(node);
        host.view.redrawCanvas();
        return true;
    }

    private activate(): boolean {
        const host = this.host;
        if (this.connectFrom) return this.finishConnect();
        const node = this.focusNode && host.graphNodes.includes(this.focusNode) ? this.focusNode : undefined;
        const arrow = host.selectedArrow && host.arrows.includes(host.selectedArrow) ? host.selectedArrow : undefined;
        if (host.isSelectingSequence) {
            const item = arrow ?? node;
            if (!item) return false;
            host.selectedSequence.push({ id: item.id, order: host.selectedSequence.length + 1, type: arrow ? 'arrow' : 'node' });
            this.announce(`${host.selectedSequence.length}: ${arrow ? this.describeArrow(arrow) : this.describe(item as GraphNode)}`);
            host.view.redrawCanvas();
            return true;
        }
        if (!this.canEdit) return false;
        if (arrow) {
            host.prompt.show('arrow', host.arrows.indexOf(arrow));
            return true;
        }
        if (node && node.node !== 'connector') {
            host.prompt.show('node', host.graphNodes.indexOf(node));
            return true;
        }
        return false;
    }

    private describeArrow(arrow: Arrow): string {
        const label = arrow.text?.trim();
        return `${arrow.from.text.trim()} → ${arrow.to.text.trim()}${label ? ` (${label})` : ''}`;
    }

    /** `a`: select the arrows of the focused node one after the other; after the last one the node is current again. */
    private walkArrows(): boolean {
        const host = this.host;
        const node = this.focusNode;
        if (!node || !host.graphNodes.includes(node) || this.connectFrom) return false;
        const arrows = host.arrows.filter((arrow) => arrow.from === node || arrow.to === node);
        if (!arrows.length) return false;
        const index = host.selectedArrow ? arrows.indexOf(host.selectedArrow) : -1;
        const next = arrows[index + 1];
        host.selectedArrow = next;
        host.selectedNode = next ? undefined : this.canEdit ? node : undefined;
        host.selectedNodes = [];
        this.announce(next ? this.describeArrow(next) : this.describe(node));
        host.view.redrawCanvas();
        return true;
    }

    /** `c`: start a connection from the focused node; the arrow keys then pick its target and Enter creates it. */
    private startConnect(): boolean {
        const host = this.host;
        const node = this.focusNode;
        if (!this.canEdit || host.isSelectingSequence || this.connectFrom || !node || node.node === 'text' || !host.graphNodes.includes(node)) return false;
        const targets = host.graphNodes.filter((candidate) => candidate !== node && candidate.node !== 'text');
        if (!targets.length) return false;
        const origin = this.centerOf(node);
        const nearest = targets.reduce((best, candidate) => {
            const a = this.centerOf(candidate);
            const b = this.centerOf(best);
            return Math.hypot(a.x - origin.x, a.y - origin.y) < Math.hypot(b.x - origin.x, b.y - origin.y) ? candidate : best;
        });
        this.connectFrom = node;
        host.selectedNode = node;
        host.selectedArrow = undefined;
        host.pointer.isDrawingArrow = true;
        this.focusNode = nearest;
        this.aimConnection(nearest);
        this.reveal(nearest);
        this.announce(this.describe(nearest));
        host.view.redrawCanvas();
        return true;
    }

    /** Point the dashed arrow at a target node. */
    private aimConnection(target: GraphNode) {
        const source = this.connectFrom;
        if (!source) return;
        const anchor = anchorToward(this.centerOf(source), this.centerOf(target));
        this.host.pointer.arrowStart = { node: source, anchor };
        this.host.pointer.tempArrowEnd = this.centerOf(target);
        this.host.view.redrawCanvas();
    }

    private finishConnect(): boolean {
        const host = this.host;
        const source = this.connectFrom;
        const target = this.focusNode;
        const start = host.pointer.arrowStart;
        if (!source || !target || !start) return this.escape();
        // The arrow ends at the side of the target that faces the source; the point lies just inside that side.
        const facing = oppositeAnchor(start.anchor);
        const edge = getAnchors(host.ctx, target)[facing];
        const center = this.centerOf(target);
        const length = Math.hypot(center.x - edge.x, center.y - edge.y) || 1;
        const x = edge.x + ((center.x - edge.x) / length) * 2;
        const y = edge.y + ((center.y - edge.y) / length) * 2;
        const before = host.arrows.length;
        host.arrows = handleArrowCreation(host.ctx, x, y, start, host.graphNodes, host.arrows).arrows;
        host.arrows = [...host.arrows];
        this.endConnect();
        host.graphNodes = [...host.graphNodes];
        host.selectedNode = target;
        host.pointer.updateAnchorListeners();
        if (host.arrows.length > before) this.announce(`${source.text.trim()} → ${target.text.trim()}`);
        host.view.redrawCanvas();
        return true;
    }

    private endConnect() {
        if (!this.connectFrom) return;
        this.connectFrom = undefined;
        const pointer = this.host.pointer;
        pointer.isDrawingArrow = false;
        pointer.arrowStart = undefined;
        pointer.tempArrowEnd = undefined;
    }

    private escape(): boolean {
        const host = this.host;
        if (this.connectFrom) {
            const source = this.connectFrom;
            this.endConnect();
            this.focusOn(source);
            return true;
        }
        if (!host.selectedNode && !host.selectedArrow && !host.selectedNodes.length) return false;
        host.selectedNode = undefined;
        host.selectedArrow = undefined;
        host.selectedNodes = [];
        host.view.redrawCanvas();
        return true;
    }
}
