import type { WebwriterFlowchart } from '../../widgets/webwriter-flowchart';
import { toWorld, zoomAround } from '../../model/geometry';
import { reconnectArrows } from '../../model/preset-helper';
import { applyGraphFont, measureTextSize } from './utilities';
import { drawGraphNode, drawNodeAnchors } from '../drawer/draw-graph-node';
import { drawArrow, drawTempArrow, generateArrowPoints, drawArrowAnchor } from '../drawer/draw-arrow';
import { drawSelectionField } from '../drawer/draw-selection-field';

/**
 * @internal Canvas view of the flowchart: drawing, zoom, pan offset, size, fullscreen and
 * the height handle. It serves the widget that owns the canvas element.
 */
export class CanvasView {
    constructor(private host: WebwriterFlowchart) {}

    /** @internal Set while the chart is drawn for paper: the whole chart, fitted, without grid and selection. */
    print?: { scale: number; x: number; y: number };

    /** @internal Base grid spacing (world units). */
    gridSize: number = 50;

    /** @internal Background grid dot radius (world units). */
    dotSize: number = 1.5;


    /**
     * Full render pipeline:
     * - Clears the canvas and applies the current zoom transform,
     * - Draws the background grid (dots) honoring pan offsets,
     * - Translates by pan offsets and reconnects arrows,
     * - Recomputes arrow point geometry and draws arrows/nodes,
     * - Draws anchors for the selected node/arrow,
     * - Draws a temporary arrow while dragging, and a selection rectangle if active.
     *
     * @returns {void}
     */
    redrawCanvas() {
        const { ctx, canvas, graphSettings: settings } = this.host;
        const print = this.print;
        const selectedSequence = print ? [] : this.host.selectedSequence;
        const selectedNodes = print ? [] : this.host.selectedNodes;
        const dpi = window.devicePixelRatio || 1;
        // Clear the canvas, taking the zoom factor into account
        const scaleFactor = this.host.zoomLevel / 100;
        ctx.resetTransform();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (print) {
            ctx.scale(print.scale, print.scale);
            ctx.translate(print.x, print.y);
        } else {
            ctx.scale(scaleFactor * dpi, scaleFactor * dpi);

            // Draw the grid
            const gridSize = this.gridSize;         // base spacing between grid points (unscaled)
            const dotSize = this.dotSize;           // radius of each dot (unscaled)
            const width = canvas.width / scaleFactor / dpi;
            const height = canvas.height / scaleFactor / dpi;

            ctx.fillStyle = this.accent(1, '#104e8b');

            // Draw dots in grid: one path and one fill for all of them
            ctx.beginPath();
            for (let x = this.host.canvasOffsetX % gridSize; x < width; x += gridSize) {
                for (let y = this.host.canvasOffsetY % gridSize; y < height; y += gridSize) {
                    ctx.moveTo(x + dotSize, y);
                    ctx.arc(x, y, dotSize, 0, 2 * Math.PI);
                }
            }
            ctx.fill();
            ctx.beginPath();

            ctx.translate(this.host.canvasOffsetX, this.host.canvasOffsetY)
        }

        applyGraphFont(ctx, settings);

        reconnectArrows(this.host.arrows, this.host.graphNodes);

        // Draw all connections
        this.host.arrows.forEach((arrow) => {
            const isSelected = !print && arrow === this.host.selectedArrow;
            arrow.points = generateArrowPoints(ctx, arrow);
            drawArrow(ctx, arrow, settings, isSelected, selectedSequence);
        });

        // Draw all nodes
        this.host.graphNodes?.forEach((element) => {
            drawGraphNode(ctx, element, settings, selectedNodes, selectedSequence);
        });

        if (print) {
            return;
        }

        // The node the keyboard works on
        const ring = this.host.keyboard.ringNode;
        if (ring) {
            const size = measureTextSize(ctx, ring.text);
            ctx.save();
            ctx.strokeStyle = this.accent(1, '#104e8b');
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 5]);
            ctx.strokeRect(ring.x - 8, ring.y - 8, size.width + 16, size.height + 16);
            ctx.restore();
        }

        // Draw the anchor points of the selected element, if any
        if (this.host.selectedNode) {
            drawNodeAnchors(ctx, this.host.selectedNode, this.host.pointer.hoveredAnchor);
        }

        // Draw the anchor points of the arrow if it is selected
        this.host.arrows.forEach((arrow) => {
            const isSelected = arrow === this.host.selectedArrow;
            if (isSelected) {
                drawArrowAnchor(ctx, arrow, this.host.pointer.isArrowAnchorHovered, settings);
            }
        });

        // Draw a temporary connection while dragging between two elements, if any
        if (this.host.pointer.isDrawingArrow && this.host.pointer.arrowStart && this.host.pointer.tempArrowEnd) {
            drawTempArrow(ctx, this.host.pointer.arrowStart, this.host.pointer.tempArrowEnd);
        }

        if (this.host.pointer.selectionRectangle) {
            drawSelectionField(ctx, this.host.pointer.selectionRectangle);
        }
    }

    /** @internal The box around all nodes and arrows in world units, or undefined for an empty chart. */
    contentBounds(): { minX: number; minY: number; maxX: number; maxY: number } | undefined {
        const { ctx, canvas, graphNodes, arrows } = this.host;
        if (!canvas || !ctx || !graphNodes.length) return undefined;
        applyGraphFont(ctx, this.host.graphSettings);
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const node of graphNodes) {
            const size = measureTextSize(ctx, node.text);
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            maxX = Math.max(maxX, node.x + size.width);
            maxY = Math.max(maxY, node.y + size.height);
        }
        for (const arrow of arrows) {
            const points = arrow.points ?? [];
            for (const point of points) {
                minX = Math.min(minX, point.x);
                minY = Math.min(minY, point.y);
                maxX = Math.max(maxX, point.x);
                maxY = Math.max(maxY, point.y);
            }
            // The caption sits centred on the middle segment, as in addArrowText
            const at = Math.floor(points.length / 2 - 0.5);
            if (arrow.text && points[at] && points[at + 1]) {
                const x = (points[at].x + points[at + 1].x) / 2;
                const y = (points[at].y + points[at + 1].y) / 2;
                const half = ctx.measureText(arrow.text).width / 2 + 5;
                minX = Math.min(minX, x - half);
                maxX = Math.max(maxX, x + half);
                minY = Math.min(minY, y - 10);
                maxY = Math.max(maxY, y + 8);
            }
        }
        return { minX, minY, maxX, maxY };
    }

    /** @internal Zoom and pan so that the whole chart is in view, as large as fits up to 100%. */
    fitToContent() {
        const bounds = this.contentBounds();
        if (!bounds) return;
        const margin = 30;
        const palette = this.host.shadowRoot?.querySelector<HTMLElement>('.flowchart-menu:not(.collapsed)');
        const width = this.host.canvas.clientWidth;
        // The buttons in the top corner cover the first 48px.
        const top = 48;
        const height = this.host.canvas.clientHeight - top - (palette?.offsetHeight ?? 0);
        const contentWidth = bounds.maxX - bounds.minX + 2 * margin;
        const contentHeight = bounds.maxY - bounds.minY + 2 * margin;
        const zoom = Math.max(50, Math.min(100, Math.floor((Math.min(width / contentWidth, height / contentHeight) * 100) / 10) * 10));
        const scale = zoom / 100;
        this.host.zoomLevel = zoom;
        this.host.canvasOffsetX = (width / scale - contentWidth) / 2 + margin - bounds.minX;
        this.host.canvasOffsetY = (height / scale - contentHeight) / 2 + margin - bounds.minY + top / scale;
        this.applyZoom();
    }

    /** @internal In reading mode, fit the chart when none of it lies in view, as on a narrow container for a chart authored on a wide one. */
    fitIfHidden() {
        const bounds = this.contentBounds();
        if (!bounds || this.host.isEditable() || this.host.fullscreen) return;
        const scale = this.host.zoomLevel / 100;
        const left = -this.host.canvasOffsetX;
        const top = -this.host.canvasOffsetY;
        const right = left + this.host.canvas.clientWidth / scale;
        const bottom = top + this.host.canvas.clientHeight / scale;
        if (bounds.maxX < left || bounds.minX > right || bounds.maxY < top || bounds.minY > bottom) this.fitToContent();
    }

    /** @internal Apply changed options to the running canvas. */
    applyOptionChanges(changed: Map<PropertyKey, unknown>) {
        if (!this.host.canvas || !this.host.ctx) return;
        if (changed.has('zoomLevel')) {
            this.applyZoom();
        } else if (changed.has('font') || changed.has('fontSize') || changed.has('theme')) {
            this.redrawCanvas();
        }
    }

    /** @internal Keep the canvas `touch-action` in sync with interactivity. */
    updateTouchAction() {
        const { canvas, allowStudentEdit, allowStudentPan } = this.host;
        if (!canvas) return;
        canvas.style.touchAction = allowStudentEdit || allowStudentPan || this.host.isEditable() ? 'none' : 'auto';
    }

    /** @internal Accent color `n` of the document's theme, or `fallback` without a theme. */
    accent(n: number, fallback: string): string {
        return getComputedStyle(this.host).getPropertyValue(`--ww-theme-accent-${n}`).trim() || fallback;
    }

    /** @internal Print scale: CSS pixels on paper per world unit, and the sharpness of the bitmap. */
    private static readonly PRINT_SCALE = 1.25;
    private static readonly PRINT_SHARPNESS = 2;

    /**
     * @internal Before printing: size the canvas to the whole chart and draw it fitted, since the
     * screen view shows an arbitrary window onto the chart. Returns false when there is nothing to print.
     */
    beginPrint = (): boolean => {
        const bounds = this.contentBounds();
        if (!bounds) return false;
        const { canvas } = this.host;
        const margin = 30;
        const { minX, minY, maxX, maxY } = bounds;
        const width = maxX - minX + 2 * margin;
        const height = maxY - minY + 2 * margin;
        const scale = CanvasView.PRINT_SCALE * CanvasView.PRINT_SHARPNESS;
        canvas.width = Math.ceil(width * scale);
        canvas.height = Math.ceil(height * scale);
        canvas.style.width = `${width * CanvasView.PRINT_SCALE}px`;
        this.print = { scale, x: margin - minX, y: margin - minY };
        this.redrawCanvas();
        return true;
    };

    /** @internal After printing: back to the screen view. */
    endPrint = () => {
        if (!this.print) return;
        this.print = undefined;
        this.syncLayout();
    };

    /** @internal Recompute canvas dimensions and trigger redraw. */
    updateCanvasSize = () => {
        const dpi = window.devicePixelRatio || 1;
        this.host.canvas.width = this.host.clientWidth * dpi;
        this.host.canvas.height = this.host.currentHeight * dpi;

        const workspace = this.host.shadowRoot?.querySelector('.workspace') as HTMLElement;
        workspace.style.setProperty('--widget-height', `${this.host.currentHeight}px`);

        this.redrawCanvas();
    };

    /** @internal Apply the current zoom level (50–200%) and redraw. */
    applyZoom() {
        const dpi = window.devicePixelRatio || 1;
        const scaleFactor = this.host.zoomLevel / 100;
        this.host.ctx.resetTransform();
        this.host.ctx.scale(scaleFactor * dpi, scaleFactor * dpi);
        this.redrawCanvas();
    }


    /**
     * Converts a mouse event to world coordinates, accounting for zoom and pan.
     * @param {MouseEvent} event
     * @param {boolean} [withoutPan=false] - If true, ignore current pan offsets.
     * @returns {{x:number,y:number}}
     */
    getMouseCoordinates(event: MouseEvent, withoutPan?: boolean) {
        return this.getCanvasCoordinates(event.clientX, event.clientY, withoutPan);
    }

    /**
     * Converts a viewport position to world coordinates, accounting for zoom and pan.
     *
     * @param {number} clientX - Viewport X position.
     * @param {number} clientY - Viewport Y position.
     * @param {boolean} withoutPan - If true, ignore current pan offsets.
     * @returns {{x:number,y:number}}
     * @internal
     */
    getCanvasCoordinates(clientX: number, clientY: number, withoutPan?: boolean) {
        const rect = this.host.canvas.getBoundingClientRect();
        const offset = withoutPan ? undefined : { x: this.host.canvasOffsetX, y: this.host.canvasOffsetY };
        return toWorld({ x: clientX, y: clientY }, { x: rect.left, y: rect.top }, this.host.zoomLevel, offset);
    }

    /**
     * Update canvas offset CSS variables when the workspace scrolls.
     * Keeps pointer-to-world mapping consistent during scrolling.
     *
     * @returns {void}
     */
    handleScroll = () => {
        this.updateCanvasOffset();
    }

    /**
     * Cancel native drags starting inside the workspace.
     *
     * @param {DragEvent} event
     * @returns {void}
     * @internal
     */
    handleWorkspaceDragStart = (event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Zoom the canvas around the mouse pointer when panning is allowed or in edit mode.
     * Prevents default wheel behavior, clamps zoom to [50, 200], and adjusts pan offsets
     * so the world point under the cursor remains stable across zoom steps.
     *
     * Requires the widget to be focused (`:focus-within`) to activate.
     *
     * @param {WheelEvent} event
     * @returns {void}
     */
    handleWheel = (event: WheelEvent) => {
        if ((this.host.allowStudentPan || this.host.isEditable()) && this.host.matches(':focus-within')) {
            event.preventDefault();
    
            // Get pointer position relative to canvas (screen space)
            const rect = this.host.canvas.getBoundingClientRect();
            const delta = event.deltaY < 0 ? 10 : -10;
            this.zoomAtPoint(event.clientX - rect.left, event.clientY - rect.top, this.host.zoomLevel + delta);
        }
    }

    /**
     * Zoom to a target level while keeping the world point under a given screen position stable.
     * Shared by mouse-wheel zoom and two-finger pinch zoom. Clamps the zoom to [50, 200].
     *
     * @param {number} screenX - X position within the canvas (px, relative to its top-left).
     * @param {number} screenY - Y position within the canvas (px, relative to its top-left).
     * @param {number} targetZoom - Desired zoom percentage (clamped to [50, 200]).
     * @returns {void}
     * @internal
     */
    zoomAtPoint(screenX: number, screenY: number, targetZoom: number) {
        const { zoom, offset } = zoomAround(
            { x: screenX, y: screenY },
            targetZoom,
            this.host.zoomLevel,
            { x: this.host.canvasOffsetX, y: this.host.canvasOffsetY }
        );
        this.host.zoomLevel = zoom;
        this.host.canvasOffsetX = offset.x;
        this.host.canvasOffsetY = offset.y;
        this.applyZoom();
    }

    /** @internal Sync CSS offset variables to the canvas bounding rect. */
    updateCanvasOffset() {
        const offsetX = this.host.canvas.getBoundingClientRect().left;
        const offsetY = this.host.canvas.getBoundingClientRect().top;
        this.host.canvas.style.setProperty('--offset-x', `${offsetX}px`);
        this.host.canvas.style.setProperty('--offset-y', `${offsetY}px`);
    }


    /** @internal Smallest height the resize handle can drag the widget down to. */
    static readonly MIN_HEIGHT = 400;

    /** @internal Pointer position and widget height when the resize drag started. */
    resizeStartY = 0;
    resizeStartHeight = 0;

    /**
     * @internal Begin a height drag. The pointer is captured so the drag keeps tracking
     * once it leaves the handle, and `preventDefault` keeps the surrounding editor from
     * turning the press into a text selection.
     */
    handleYResizeStart = (event: PointerEvent) => {
        if (event.button !== 0) return;

        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        event.preventDefault();

        this.host.resizing = true;
        this.resizeStartY = event.clientY;
        this.resizeStartHeight = this.host.currentHeight;
    }

    /** @internal Resize live while dragging. */
    handleYResizeMove = (event: PointerEvent) => {
        if (!this.host.resizing) return;

        const height = Math.max(
            CanvasView.MIN_HEIGHT,
            this.resizeStartHeight + (event.clientY - this.resizeStartY)
        );

        if (height === this.host.currentHeight) return;

        this.host.currentHeight = height;
        this.updateCanvasSize();
    }

    /**
     * @internal Finish a height drag. `height` is only written here, not on every move:
     * it is a reflected property, so each write lands in the document the widget sits in.
     */
    handleYResizeEnd = (event: PointerEvent) => {
        if (!this.host.resizing) return;

        const handle = event.currentTarget as HTMLElement;
        if (handle.hasPointerCapture(event.pointerId)) {
            handle.releasePointerCapture(event.pointerId);
        }

        this.host.resizing = false;
        this.host.height = this.host.currentHeight;
    }

    /** @internal Toggle fullscreen. The resulting layout change is picked up by `syncLayout`. */
    toggleFullscreen = () => {
        if (this.isFullscreen) {
            this.host.ownerDocument.exitFullscreen();
        } else {
            this.host.requestFullscreen({ navigationUI: 'hide' });
        }
    }

    /** @internal Whether this widget is the fullscreen element. */
    get isFullscreen(): boolean {
        return this.host.ownerDocument.fullscreenElement === this.host;
    }

    /** @internal Update canvas with the current fullscreen state and height. */
    syncLayout = () => {
        if (!this.host.canvas || this.print) return;

        const fullscreen = this.isFullscreen;

        if (fullscreen !== this.host.fullscreen) {
            this.host.fullscreen = fullscreen;
        }

        // While the handle is being dragged, `currentHeight` is the live value and
        // `height` still holds the last persisted one — adopting it here would snap the
        // widget back on the first pointermove, since resizing makes this observer fire.
        if (!this.host.resizing) {
            this.host.currentHeight = fullscreen ? this.host.clientHeight : this.host.height;
        }

        this.host.canvas.style.width = '100%';
        this.host.canvas.style.height = '';
        this.updateCanvasSize();
        this.fitIfHidden();
    };
}
