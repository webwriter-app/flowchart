import { LitElementWw, computed, signal } from '@webwriter/lit';
import { jsonData } from '@webwriter/lit/data';
import { localizer } from '@webwriter/lit/localize';
import { Permissions } from '@webwriter/lit/permissions';
import { Settings } from '@webwriter/lit/settings';
import { Shortcuts } from '@webwriter/lit/shortcuts';
import { html, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { MsgFn } from "@lit/localize";

import { GraphNode } from '../model/graph-node';
import { Arrow } from '../model/arrow';
import { ItemList, type SequenceStep } from '../model/item-list';
import { sequencesMatch, type NodeType } from '../model/graph-edit';
import { createArrowsFromGraphNodes, reconnectArrows } from '../model/preset-helper';

import { addNodeInView, removeSelection } from '../components/canvas/node-edit';
import { CanvasPointer } from '../components/canvas/canvas-pointer';
import { CanvasKeyboard } from '../components/canvas/canvas-keyboard';
import { CanvasView } from '../components/canvas/canvas-view';
import { renderActionMenu, renderNodePalette, renderResizeHandle } from '../components/ui/toolbar';
import { renderDialogs, renderPrintView } from '../components/ui/dialogs';
import { exportImage, exportList, exportMermaid, exportPng, importList, importMermaid } from '../components/exchange';
import { TextPrompt } from '../components/ui/text-prompt';
import { papWidgetStyles } from '../components/flowchart.styles';

import "@shoelace-style/shoelace/dist/themes/light.css";

import SlAlert from "@shoelace-style/shoelace/dist/components/alert/alert.component.js";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import SlDetails from "@shoelace-style/shoelace/dist/components/details/details.component.js";
import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.component.js";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.component.js";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input.component.js";
import SlMenu from "@shoelace-style/shoelace/dist/components/menu/menu.component.js";
import SlMenuItem from "@shoelace-style/shoelace/dist/components/menu-item/menu-item.component.js";
import SlTextarea from "@shoelace-style/shoelace/dist/components/textarea/textarea.component.js";
import SlTooltip from "@shoelace-style/shoelace/dist/components/tooltip/tooltip.component.js";

import { sourceLocale, targetLocales } from "../../localization/generated/locale-codes.js";

/** What a drawer text reads from the widget: its catalog. */
type DrawerTexts = { msg: MsgFn };

/**
 * @summary Create programming flowcharts with interactive tasks. Use standardized Elements such as loops and Branchings.
 *
 * @tag webwriter-flowchart
 * @tagname webwriter-flowchart
 *
 * @slot data - Direct application/json block stores flowchart nodes, tasks, and hints.
 *
 * Keyboard: the canvas is one tab stop. Arrow keys move between nodes; Enter adds the node to the path being selected, or edits its caption; `a` walks along the arrows of the node (Enter edits the arrow's caption); `c` starts a connection, the arrow keys pick the target and Enter creates it; Alt+arrows move the node (Alt+Shift for large steps); Shift+arrows pan; `+` and `-` zoom; `0` fits the chart; Escape cancels or clears the selection; Delete removes the selection.
 * Touch: tap selects, drag moves, a long press opens the node menu, a double tap edits a caption, two fingers pan and zoom.
 * Print: the whole chart is printed fitted to the page, without grid, controls and selection, followed by the task list. A chart without nodes prints a short note.
 * Files and conversions: a Mermaid flowchart (`.mmd`) is imported and exported (lossy: positions, tasks, hints and colors are not part of Mermaid; on import the nodes are laid out in layers, subgraphs are refused, a second arrow between two nodes and arrows from a node to itself are dropped, and a recorded path of a task is cleared); the chart is exported as a PNG picture (`image/png`) or as an `img` element with a PNG data URL; an `ol` or `ul` becomes a chain of process steps between a start and an end, and the chart becomes an `ol` of its captions in reading order (branches and loops are flattened).
 * @signal {boolean} pathCorrect - True while the path last checked against a task was correct; false after a wrong path or when path selection ends.
 * @signal {string} selected - Caption of the selected node, or an empty string.
 * @attr {number} height - Canvas height in pixels. Default 400.
 * @attr {number} zoom-level - Zoom percentage in the range [50, 200]. Default 100.
 * @attr {number} canvas-offset-x - Horizontal pan offset in world units.
 * @attr {number} canvas-offset-y - Vertical pan offset in world units.
 * @attr {boolean} disable-student-edit - Disables student editing (adding, dragging, deleting).
 * @attr {boolean} disable-student-pan - Disables student panning and zoom interaction.
 * @attr {string} font - Font family used for node labels, spaces written as underscores. Default "Courier_New".
 * @attr {number} font-size - Font size used for node labels. Default 16.
 * @attr {string} theme - Color theme; one of "standard" | "pastel" | "mono" | "s/w". Default "standard".
 *
 * @prop {GraphNode[]} graphNodes - Current list of graph nodes (programmatic API).
 * @prop {Arrow[]} arrows - Current list of arrows between nodes (programmatic API).
 * @prop {ItemList[]} taskList - Tasks shown in the task menu.
 * @prop {ItemList[]} helpList - Hints shown in the help menu.
 * @prop {number} zoomLevel - Current zoom percentage (50–200).
 * @prop {number} canvasOffsetX - Horizontal pan offset (world units).
 * @prop {number} canvasOffsetY - Vertical pan offset (world units).
 * @prop {string} font - Font family used for labels, spaces written as underscores.
 * @prop {number} fontSize - Font size used for labels.
 * @prop {string} theme - Color theme name.
 * @prop {boolean} fullscreen - Whether the widget is currently in fullscreen mode.
 * @prop {string} solutionMessage - Message shown in the solution prompt.
 * @prop {boolean} showSolution - Whether the solution prompt is visible.
 *
 * @part canvas - The drawing surface with the chart.
 * @part workspace - The area that holds the canvas and the overlay controls.
 *
 * @cssprop --ww-text-color - Text color of the controls and dialogs. Defaults to the inherited color.
 * @cssprop --ww-font-family - Font of the controls and dialogs. Defaults to the inherited font.
 * @cssprop --ww-theme-accent-1 - Color of the canvas grid, the keyboard focus ring and the focus outline. Defaults to #104e8b.
 * @cssprop --offset-x - Internal canvas left offset (managed by the widget).
 * @cssprop --offset-y - Internal canvas top offset (managed by the widget).
 * @cssprop --widget-height - Workspace height in pixels.
 */
@customElement('webwriter-flowchart')
export class WebwriterFlowchart extends Settings(LitElementWw, {
    /** Zoom level in percent [50–200]. */
    zoomLevel: { type: Number, default: 100, min: 50, max: 200, step: 10, attribute: 'zoomlevel', label: (widget: DrawerTexts) => ({ _: widget.msg('Zoom') }) },
    /** Disables interactive editing (adding/dragging/deleting). */
    disableStudentEdit: { type: Boolean, attribute: 'disablestudentedit', label: (widget: DrawerTexts) => ({ _: widget.msg('Disable student editing') }) },
    /** Disables panning/zooming interactions. */
    disableStudentPan: { type: Boolean, attribute: 'disablestudentpan', label: (widget: DrawerTexts) => ({ _: widget.msg('Disable student panning') }) },
    /** Font family for node labels, multi-word families are underscored (see `fontFamily`). */
    font: { type: 'select', default: 'Courier_New', attribute: 'font', label: (widget: DrawerTexts) => ({ _: widget.msg('Font') }), options: [
        { value: 'Arial', label: (widget: DrawerTexts) => ({ _: widget.msg('Arial') }) },
        { value: 'Courier_New', label: (widget: DrawerTexts) => ({ _: widget.msg('Courier New') }) },
        { value: 'Times_New_Roman', label: (widget: DrawerTexts) => ({ _: widget.msg('Times New Roman') }) },
        { value: 'Verdana', label: (widget: DrawerTexts) => ({ _: widget.msg('Verdana') }) },
    ] },
    /** Font size for node labels. */
    fontSize: { type: Number, default: 16, min: 8, max: 40, step: 1, attribute: 'fontsize', label: (widget: DrawerTexts) => ({ _: widget.msg('Font size') }) },
    /** Color theme name. */
    theme: { type: 'select', default: 'standard', attribute: 'theme', label: (widget: DrawerTexts) => ({ _: widget.msg('Theme') }), options: [
        { value: 'standard', label: (widget: DrawerTexts) => ({ _: widget.msg('Standard') }) },
        { value: 'pastel', label: (widget: DrawerTexts) => ({ _: widget.msg('Pastel') }) },
        { value: 'mono', label: (widget: DrawerTexts) => ({ _: widget.msg('Mono') }) },
        { value: 's/w', label: (widget: DrawerTexts) => ({ _: widget.msg('Black/White') }) },
    ] },
} as const) {
    static actions = {
        deleteSelection: { label: { _: 'Delete' }, shortcut: ['Delete', 'Backspace'], hidden: true },
        fitToView: { label: (widget: DrawerTexts) => widget.msg('Fit to view') },
        clearAll: {
            label: (widget: DrawerTexts) => widget.msg('Clear chart'),
            intent: 'danger' as const,
            confirm: (widget: DrawerTexts) => widget.msg('Are you sure, that you want to delete everything?'),
        },
    };

    static convertFrom = { '.mmd': importMermaid, ol: importList, ul: importList };
    static convertTo = { '.mmd': exportMermaid, 'image/png': exportPng, img: exportImage, ol: exportList };

    /** @internal Component style (provided by papWidgetStyles). */
    static styles = papWidgetStyles;

    /** @internal Scoped child elements used by the widget. */
    static scopedElements = {
        'sl-alert': SlAlert,
        'sl-button': SlButton,
        'sl-details': SlDetails,
        'sl-dialog': SlDialog,
        'sl-icon': SlIcon,
        'sl-icon-button': SlIconButton,
        'sl-input': SlInput,
        'sl-menu': SlMenu,
        'sl-menu-item': SlMenuItem,
        'sl-textarea': SlTextarea,
        'sl-tooltip': SlTooltip
    };

    /** @internal Focus delegation for better keyboard support. */
    static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

    // The widget's catalogs. The drawer labels above are asked again by Settings when the language changes.
    localize = localizer(this, { sourceLocale, targetLocales, drawer: true, load: (locale) => import(`../../localization/generated/${locale}.ts`) });
    readonly msg = this.localize.msg;

    /** @internal Edit-mode answer of the Permissions module. */
    #permissions = new Permissions(this);

    /** @internal Runs `deleteSelection` for its declared keys. */
    #shortcuts = new Shortcuts(this);

    /** @internal The JSON data block: nodes, tasks and hints. Rewritten whenever one of them changes. */
    #data = jsonData(this, {
        defaults: { graphNodes: [] as GraphNode[], taskList: [] as ItemList[], helpList: [] as ItemList[] },
        changed: (value) => this.adoptData(value),
    });

    /**
     * List of graph nodes comprising the flowchart.
     * Reflected as the 'graph-nodes' attribute (expects JSON when set externally).
     */
    @property({ type: Array, attribute: false }) accessor graphNodes: GraphNode[] = [];

    /** @internal Backs the published signals. */
    readonly #pathCorrect = signal(false);
    readonly #selected = signal('');

    /** Values other widgets can read through `#id[name]`. */
    readonly signals = {
        pathCorrect: computed(() => this.#pathCorrect.get()),
        selected: computed(() => this.#selected.get()),
    };

    /** @internal Currently selected/focused node. */
    @property({ type: Object }) accessor selectedNode: GraphNode | undefined = undefined;

    /** List of arrows connecting nodes. */
    @property({ type: Array }) accessor arrows: Arrow[] = [];

    /** @internal Currently selected/focused arrow. */
    @property({ type: Object }) accessor selectedArrow: Arrow | undefined = undefined;

    /** Get the current nodes. */
    getGraphNodes = () => this.graphNodes;

    /** Get the current arrows. */
    getArrows = () => this.arrows;

    /** Tasks visible in the task menu. */
    @property({ type: Array, attribute: false }) accessor taskList: ItemList[] = [];

    /** Hints visible in the help menu. */
    @property({ type: Array, attribute: false }) accessor helpList: ItemList[] = [];

    /** @internal Take over a data block that changed from outside (load, remote update, undo). */
    private adoptData(data: { graphNodes: GraphNode[]; taskList: ItemList[]; helpList: ItemList[] }) {
        if (JSON.stringify(data.graphNodes) !== JSON.stringify(this.graphNodes)) this.graphNodes = structuredClone(data.graphNodes);
        if (JSON.stringify(data.taskList) !== JSON.stringify(this.taskList)) this.taskList = structuredClone(data.taskList);
        if (JSON.stringify(data.helpList) !== JSON.stringify(this.helpList)) this.helpList = structuredClone(data.helpList);
        this.arrows = createArrowsFromGraphNodes(this.arrows, this.graphNodes);
        reconnectArrows(this.arrows, this.graphNodes);
        if (this.canvas && this.ctx) this.view.redrawCanvas();
    }

    /** Canvas height (px). */
    @property({ type: Number, reflect: true, attribute: true }) accessor height: number = 400;

    /** @internal Runtime canvas height; tracks drag-resize/fullscreen. */
    @property({ type: Number }) accessor currentHeight: number = this.height;

    /** @internal Rendering settings handed to the drawers; derived from the options so that changing one takes effect on the next redraw. */
    get graphSettings(): { font: string; fontSize: number; theme: string } {
        return { font: this.fontFamily, fontSize: Number(this.fontSize), theme: this.theme };
    }

    /** @internal CSS font family for the selected `font` option. */
    private get fontFamily(): string {
        return this.font.replace(/_/g, ' ');
    }

    /** Horizontal pan offset (world units). */
    @property({ type: Number, reflect: true, attribute: true }) accessor canvasOffsetX: number = 0;

    /** Vertical pan offset (world units). */
    @property({ type: Number, reflect: true, attribute: true }) accessor canvasOffsetY: number = 0;

    /** Whether students may add, drag and delete elements. */
    get allowStudentEdit(): boolean {
        return !this.disableStudentEdit;
    }

    /** Whether students may pan and zoom the canvas. */
    get allowStudentPan(): boolean {
        return !this.disableStudentPan;
    }

    /** Whether the widget is in fullscreen mode. */
    @property({ type: Boolean }) accessor fullscreen = false;

    /** @internal Text prompt for node and arrow captions. */
    readonly prompt = new TextPrompt(this);

    /** @internal Edit-mode answer of the previous update, to notice entering edit mode. */
    #wasEditing = false;

    /** @internal Drawing, zoom, size and fullscreen of the canvas. */
    readonly view = new CanvasView(this);

    /** @internal Keyboard input on the canvas. */
    readonly keyboard = new CanvasKeyboard(this);

    /** @internal Screen reader announcement for the node the keyboard moved to. */
    @state() accessor announcement = '';

    /** @internal Mouse, touch and pen input on the canvas. */
    readonly pointer = new CanvasPointer(this);

    /** @internal Keeps the canvas in sync with the host box (fullscreen, window resize). */
    private resizeObserver = new ResizeObserver(() => this.view.syncLayout());

    /** @internal Canvas element reference. */
    canvas!: HTMLCanvasElement;

    /** @internal 2D drawing context for the canvas. */
    ctx!: CanvasRenderingContext2D;

    /** @internal Canvas panning (grab) state. */
    @state() accessor isGrabbing = false;

    /** @internal Path selection mode (for solution checking). */
    private _isSelectingSequence = false;

    /** @internal Currently selected path sequence. */
    selectedSequence: SequenceStep[] = [];

    /** Get the currently selected path sequence. */
    getSelectedSequence = () => this.selectedSequence;

    /** Whether path-selection mode is active.
     * @returns {boolean} */
    get isSelectingSequence() {
        return this._isSelectingSequence;
    }

    /** Set path-selection mode.
     * @param {boolean} value */
    set isSelectingSequence(value: boolean) {
        const oldValue = this._isSelectingSequence;
        this._isSelectingSequence = value;
        if (oldValue !== value) {
            this.requestUpdate();
        }
    }

    /** @internal Which of the mutually exclusive side panels is open. */
    @state() accessor openMenu: 'task' | 'help' | null = null;

    /** @internal Whether the node palette at the bottom is expanded. */
    @state() accessor flowMenuOpen = true;

    /** @internal Whether the height handle is being dragged, drives its highlight. */
    @state() accessor resizing = false;

    /** @internal Widget-relative position of the context menu, or null when closed. */
    @state() accessor contextMenuAt: { x: number; y: number } | null = null;

    /**
     * @internal Index of the task whose path is currently being recorded, or null.
     * Drives the "Cancel"/"Save path" buttons that used to be toggled via `style.display`.
     */
    @state() accessor sequenceEditIndex: number | null = null;

    /** @internal Node/arrow whose caption is being edited, or null when the dialog is closed. */
    @state() accessor textPrompt: { type: 'node' | 'arrow'; index: number; value: string } | null = null;

    /** @internal Whether the "delete everything" confirmation is open. */
    @state() accessor confirmOpen = false;

    /** @internal Whether the last checked path was correct; picks the solution alert's variant. */
    @state() accessor solutionCorrect = false;

    /** Message to show in the solution prompt. */
    @property({ type: String }) accessor solutionMessage: string = '';

    /** Whether to show the solution prompt. */
    @property({ type: Boolean }) accessor showSolution: boolean = false;

    /** @internal Multi-select of nodes (drag box). */
    @property({ type: Array }) accessor selectedNodes: GraphNode[] = [];

    /**
     * Returns whether the widget is currently in an editable state
     * based on the `contenteditable` attribute.
     * @returns {boolean}
     */
    public isEditable(): boolean {
        return this.#permissions.editing;
    }

    /** @internal Lit lifecycle: canvas setup, zoom/apply, initial redraw. */
    firstUpdated() {
        this.canvas = this.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
		const dpi = window.devicePixelRatio || 1;
        this.canvas.width = this.clientWidth * dpi;
        this.canvas.height = this.currentHeight * dpi;
        const workspace = this.shadowRoot?.querySelector('.workspace') as HTMLElement;
        workspace.style.setProperty('--widget-height', `${this.currentHeight}px`);

        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.view.updateCanvasOffset(); // Update the offset

        this.arrows = createArrowsFromGraphNodes(this.arrows, this.graphNodes);

        this.view.applyZoom();
        this.view.redrawCanvas();
        this.view.updateTouchAction();

        if(this.allowStudentPan && !this.allowStudentEdit && !this.isEditable()){
            this.isGrabbing = true
        }
    }

    /** @internal Removes the print listeners on `window`. */
    #printListeners?: AbortController;

    /** @internal Lifecycle: wire global listeners and custom events. */
    connectedCallback() {
        super.connectedCallback();

        this.#printListeners = new AbortController();
        const { signal } = this.#printListeners;
        window.addEventListener('beforeprint', this.view.beginPrint, { signal });
        window.addEventListener('afterprint', this.view.endPrint, { signal });

        this.resizeObserver.observe(this);
        this.addEventListener('fullscreenchange', this.view.syncLayout);
        this.addEventListener('startSelectSequence', this.selectSequence);
    }

    /** @internal Lifecycle: teardown listeners. */
    disconnectedCallback() {
        this.#printListeners?.abort();
        this.view.endPrint();
        this.pointer.cancelLongPress();
        this.resizeObserver.disconnect();
        this.removeEventListener('fullscreenchange', this.view.syncLayout);
        this.removeEventListener('startSelectSequence', this.selectSequence);
        super.disconnectedCallback();
    }

    /** @internal Lit lifecycle: auto-delete empty items on entering edit mode. */
    updated(changedProperties: PropertyValues<this>) {
        const dataChanged = (['graphNodes', 'taskList', 'helpList'] as const).some((name) => changedProperties.has(name));
        if (dataChanged) {
            // Copies, because the canvas edits the nodes in place and the data block must not follow before this write.
            this.#data.set({ graphNodes: structuredClone(this.graphNodes), taskList: structuredClone(this.taskList), helpList: structuredClone(this.helpList) });
        }
        const editing = this.isEditable();
        const enteredEditMode = editing && !this.#wasEditing;
        this.#wasEditing = editing;
        if (enteredEditMode) {
            this.taskList = this.taskList.filter((task) => task.titel?.trim() || task.content?.trim());
            this.helpList = this.helpList.filter((help) => help.titel?.trim() || help.content?.trim());
        }
        if (changedProperties.has('selectedNode')) this.#selected.set(this.selectedNode?.text.trim() ?? '');
        this.view.updateTouchAction();
        this.view.applyOptionChanges(changedProperties);
    }

    /**
     * Toggle path-selection mode for solution checking.
     * When turning off the mode, clears the current selected sequence, ends a running
     * task recording and drops any selected node/arrow/rectangle, then triggers a redraw.
     *
     * @returns {void}
     */
    selectSequence() {
        this.isSelectingSequence = !this.isSelectingSequence;

        if (!this.isSelectingSequence) {
            this.selectedSequence = [];
            this.#pathCorrect.set(false);
            // Without the selection mode no task can record.
            this.sequenceEditIndex = null;
        }

        // Deselect all selected graph elements
        this.selectedNode = undefined;
        this.selectedArrow = undefined;
        this.pointer.selectionRectangle = undefined;

        this.view.redrawCanvas();
    }

    /** Compare the selected path with the task's recorded one and show the verdict. */
    checkSolution(task: ItemList) {
        if (sequencesMatch(this.selectedSequence, task.sequence)) {
            this.showSolutionWithMessage(this.msg('The selected path is correct!'), true);
        } else {
            this.showSolutionWithMessage(this.msg('Unfortunately, the selected path is wrong!'));
        }
    }

    /** @internal Show or hide one of the overlay menus and move focus to the host. */
    toggleMenu(menu: 'task' | 'flow' | 'context' | 'preset' | 'help') {
        switch (menu) {
            case 'flow':
                this.flowMenuOpen = !this.flowMenuOpen;
                break;
            case 'context':
                this.contextMenuAt = null;
                break;
            case 'task':
            case 'help':
                // The side panels are mutually exclusive, so opening one closes the others.
                this.openMenu = this.openMenu === menu ? null : menu;
                break;
            case 'preset':
                // Preset menu is not built yet; nothing to toggle.
                break;
        }
        this.focus();
    }

    /** Programmatically set the selected path sequence. */
    setSelectedSequence = (sequence: SequenceStep[]) => {
        this.selectedSequence = sequence;
    };

    /** Append a new task with default title and content to the task list. */
    addTask() {
        this.taskList = [...this.taskList, { titel: this.msg('Title'), content: this.msg('Task') }];
    }

    /** Append a new hint with default title and content to the help list. */
    addHelp() {
        this.helpList = [...this.helpList, { titel: this.msg('Title'), content: this.msg('Hint') }];
    }

    /** @internal The path check is offered while a path is being selected, a task has one recorded and the author is not editing. */
    get showSolutionMenu(): boolean {
        return this.isSelectingSequence && this.taskList.some((task) => task.sequence?.length) && !this.isEditable();
    }

    /** @internal Toggle canvas panning ("grab") mode and clear the node selection. */
    grabCanvas = () => {
        this.isGrabbing = !this.isGrabbing;
        this.selectedNode = undefined;
    }

    /** @internal Cyclic index used by `addGraphNode()` to stagger the placement of quickly inserted nodes. */
    private addGraphNodeIndex = 0;

    /**
     * Adds a new graph node of the given type at the current viewport center.
     * The node is appended to `graphNodes` and the canvas is redrawn.
     * @param {'start'|'end'|'op'|'decision'|'connector'|'i/o'|'sub'|'text'} node - Node type.
     * @param {string} text - Initial text label for the node.
     * @returns {void}
     */
    addGraphNode(node: NodeType, text: string) {
        addNodeInView(this, node, text, this.addGraphNodeIndex);
        this.addGraphNodeIndex = (this.addGraphNodeIndex + 1) % 3;
    }

    /** Zoom and pan so that the whole chart is in view. */
    fitToView() {
        this.view.fitToContent();
    }

    /** @internal Clear all nodes and arrows and reset the selection. */
    clearAll() {
        this.graphNodes = [];
        this.selectedNode = undefined;
        this.arrows = [];
        this.pointer.arrowStart = undefined;
        this.view.redrawCanvas();
    }

    /** @internal Delete selected node(s) or arrow; maintain connections; redraw. */
    deleteSelectedObject() {
        removeSelection(this);
        this.toggleMenu('context');
        this.view.redrawCanvas();
    }

    /**
     * Removes the selected node(s) or arrow. Runs from Delete and Backspace while focus is in the widget (not in a text field or dialog).
     * With nothing selected it declines the key, which then goes on to the page.
     */
    deleteSelection() {
        if (this.textPrompt || this.confirmOpen) return;
        if (!this.selectedNodes?.length && !this.selectedNode && !this.selectedArrow) return false;
        this.deleteSelectedObject();
    }

    /** @internal Keep `openMenu` in sync when a panel is dismissed via Escape or the overlay. */
    handleMenuHide = (event: Event) => {
        if (event.target === event.currentTarget) {
            this.openMenu = null;
        }
    };

    /** @internal Show solution overlay with a message. */
    showSolutionWithMessage(message: string, correct = false) {
        this.solutionMessage = message;
        this.solutionCorrect = correct;
        this.#pathCorrect.set(correct);
        this.showSolution = true;
    }

    /** @internal Close the solution overlay. */
    closeSolution = () => {
        this.showSolution = false;
    };

    render() {
        return html`
            <div class="workspace" part="workspace" @scroll="${this.view.handleScroll}" @dragstart="${this.view.handleWorkspaceDragStart}">
                <canvas
                    part="canvas"
                    tabindex="0"
                    role="application"
                    aria-label="${this.msg('Flowchart')}"
                    aria-describedby="canvas-help"
                    @keydown="${this.keyboard.handleKeyDown}"
                    @focus="${this.keyboard.handleFocus}"
                    @blur="${this.keyboard.handleBlur}"
                    @pointerdown="${this.pointer.handlePointerDown}"
                    @pointerup="${this.pointer.handlePointerUp}"
                    @pointermove="${this.pointer.handlePointerMove}"
                    @pointercancel="${this.pointer.handlePointerCancel}"
                    @dblclick="${this.pointer.handleNativeDoubleClick}"
                    @click="${this.pointer.handleNativeClick}"
                    @contextmenu="${this.pointer.handleContextMenu}"
                    @wheel="${this.view.handleWheel}"
                ></canvas>
                <p id="canvas-help" class="visually-hidden">${this.msg('Arrow keys select a node. Enter edits it or adds it to the path. A selects its arrows, C connects it to another node, Alt and arrow keys move it, Shift and arrow keys pan, plus and minus zoom, 0 fits the chart.')}</p>
                <div class="visually-hidden" role="status" aria-live="polite">${this.announcement}</div>
                ${renderActionMenu(this)}
                ${renderNodePalette(this)}
                ${renderDialogs(this)}
            </div>
            ${renderResizeHandle(this)}
            ${renderPrintView(this)}
        `;
    }
}
