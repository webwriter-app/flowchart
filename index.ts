import { LitElementWw } from '@webwriter/lit';
import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { v4 as uuidv4 } from 'uuid';

import { GraphNode } from './src/definitions/GraphNode';
import { Arrow } from './src/definitions/Arrow';
import { ItemList } from './src/definitions/ItemList';

import { drawButton } from './src/modules/drawer/drawButton';
import { drawGraphNode, drawNodeAnchors } from './src/modules/drawer/drawGraphNode';
import { drawArrow, drawTempArrow, generateArrowPoints, drawArrowAnchor } from './src/modules/drawer/drawArrow';
import { drawSelectionField } from './src/modules/drawer/drawSelectionField';

import {
    handleNodeDragStart,
    handleArrowDragStart,
    handleMultipleNodesDragStart,
} from './src/modules/handler/mouseDownHandler';
import { handleGrabRelease, handleNodeDragStop, handleArrowCreation } from './src/modules/handler/mouseUpHandler';
import { handleSequenceSelection } from './src/modules/handler/handleSequenceSelection';
import { handleGraphNodeDoubleClick, handleArrowDoubleClick } from './src/modules/handler/doubleClickHandler';

import { toggleMenu } from './src/modules/ui/toggleMenu';
import { addHelp, renderHelpList } from './src/modules/ui/helpMenu';
import { addTask, renderTasks } from './src/modules/ui/taskMenu';
import {
    createTooltip,
    removeTooltip,
    updateDisabledState,
    grabCanvas,
    autoDeleteEmptyItems,
} from './src/modules/ui/generalUI';

import {
    snapNodePosition,
    removeOldConnection,
    isNodeInRectangle,
    findLastGraphNode,
    findGraphNodeLastIndex,
} from './src/modules/helper/utilities';
import { isArrowClicked } from './src/modules/helper/arrowHelper';
import { getAnchors, highlightAnchor } from './src/modules/helper/anchorHelper';
import { createArrowsFromGraphNodes, updatePresetIds } from './src/modules/helper/presetHelper';

import { flowchartPresets } from './src/modules/presets/flowchartPresets';
import { helpPresets } from './src/modules/presets/helpPresets';

import { papWidgetStyles } from './src/modules/styles/styles';

import { CustomPrompt } from './src/components/custom-prompt';
import './src/components/custom-prompt';
import { ConfirmPrompt } from './src/components/confirm-prompt';
import './src/components/confirm-prompt';
import { PropertyValueMap } from '@lit/reactive-element';

@customElement('webwriter-flowchart')
export class FlowchartWidget extends LitElementWw {
    @property({ type: Array, reflect: true, attribute: true }) accessor graphNodes: GraphNode[] = [];
    @property({ type: Object }) accessor selectedNode: GraphNode;
    @property({ type: Array }) accessor arrows: Arrow[] = [];
    @property({ type: Object }) accessor selectedArrow?: Arrow;
    getGraphNodes = () => this.graphNodes;
    getArrows = () => this.arrows;

    @property({ type: Array, reflect: true, attribute: true }) accessor taskList: ItemList[] = [];
    @property({ type: Array, reflect: true, attribute: true }) accessor helpList: ItemList[] = [];

    @property({ type: Number, reflect: true, attribute: true }) accessor height: number = 400;
    @property({ type: Number }) accessor currentHeight: number = this.height;

    @property({ type: Array }) accessor presetList: { name: string; graphNodes: GraphNode[] }[] = flowchartPresets;

    @property({ type: Object }) accessor graphSettings = { font: 'Courier New', fontSize: 16, theme: 'standard' };
    @property({ type: Number, reflect: true, attribute: true }) accessor zoomLevel: number = 100; // in Prozent
    private gridSize: number = 50;
    private dotSize: number = 1.5;

    @property({ type: Number, reflect: true, attribute: true }) accessor canvasOffsetX: number = 0;
    @property({ type: Number, reflect: true, attribute: true }) accessor canvasOffsetY: number = 0;

    @property({ type: Boolean, reflect: true, attribute: true }) accessor allowStudentEdit: boolean = false;
    @property({ type: Boolean, reflect: true, attribute: true }) accessor alowStudentPan: boolean = false;

    @property({ type: String, reflect: true, attribute: true }) accessor font = 'Courier New';
    @property({ type: Number, reflect: true, attribute: true }) accessor fontSize = 16;
    @property({ type: String, reflect: true, attribute: true }) accessor theme = 'standard';

    @property({ type: Boolean }) accessor fullscreen = false;

    static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private isDragging = false;
    private draggedNode: GraphNode;
    private dragOffset = { x: 0, y: 0 };
    private draggedNodes: GraphNode[] = [];

    private isDrawingArrow = false;
    private arrowStart?: { node: GraphNode; anchor: number };
    private tempArrowEnd?: { x: number; y: number };

    private isGrabbing = false;
    private grabStartPosition?: { x: number; y: number };
    private grabStartOffset?: { x: number; y: number };

    private hoveredAnchor?: { element: GraphNode; anchor: number };
    private isArrowAnchorHovered: boolean;

    private _isSelectingSequence = false;
    private selectedSequence: { id: string; order: number; type: string }[] = [];
    getSelectedSequence = () => this.selectedSequence;
    private activeSequenceButton: HTMLButtonElement | null = null;
    getActiveSequenceButton = () => this.activeSequenceButton;
    setActiveSequenceButton = (btn: HTMLButtonElement | null) => {
        this.activeSequenceButton = btn;
    };
    get isSelectingSequence() {
        return this._isSelectingSequence;
    }
    set isSelectingSequence(value: boolean) {
        const oldValue = this._isSelectingSequence;
        this._isSelectingSequence = value;
        if (oldValue !== value) {
            //this.showSolutionMenu();
        }
    }

    private promptType: 'node' | 'arrow' | null;
    private promptIndex: number | null;

    @property({ type: String }) accessor solutionMessage: string = '';
    @property({ type: Boolean }) accessor showSolution: boolean = false;

    @property({ type: Array }) accessor selectedNodes: GraphNode[] = [];
    private selectionRectangle?: { x: number; y: number; width: number; height: number };
    private checkOffset = true;

    static style = papWidgetStyles;

    public isEditable(): boolean {
        return this.contentEditable === 'true' || this.contentEditable === '';
    }

    render() {
        console.log('render', this);
        return html`
            <style>
                ${papWidgetStyles}
            </style>
            ${this.isEditable() ? this.renderToolMenu() : ''}
            <div class="workspace" @scroll="${this.handleScroll}">
                <canvas
                    width="100%"
                    height="${this.currentHeight}"
                    @mousedown="${this.handleMouseDown}"
                    @mouseup="${this.handleMouseUp}"
                    @mousemove="${this.handleMouseMove}"
                    @dblclick="${this.handleDoubleClick}"
                    @click="${(event: MouseEvent) => {
                        this.handleClick(event);
                        this.toggleMenu('context');
                    }}"
                    @contextmenu="${(event: MouseEvent) => {
                        event.preventDefault();
                        this.showContextMenu(event);
                    }}"
                    @wheel="${this.handleWheel}"
                ></canvas>

                <div class="action-menu" style=${this.fullscreen ? 'top:10px;left:10px;' : ''}>
                    <button
                        id="grab-button"
                        @mouseenter="${(e) => createTooltip(e, 'Bewegen des Canvas')}"
                        @mouseleave="${removeTooltip}"
                        @click="${this.grabCanvas}"
                        class="${this.isGrabbing ? 'active' : ''}"
                        style=${!this.alowStudentPan ? 'display:none' : ''}
                    >
                        ${drawButton('grab', 'tool')}
                    </button>
                    <button
                        @mouseenter="${(e) => createTooltip(e, 'Aufgabenmenü')}"
                        @mouseleave="${removeTooltip}"
                        @click="${() => this.toggleMenu('task')}"
                        style=${!this.isEditable() && this.taskList?.length == 0 ? 'display:none' : ''}
                    >
                        ${drawButton('task', 'tool')}
                    </button>
                    <button
                        @mouseenter="${(e) => createTooltip(e, 'Hinweise')}"
                        @mouseleave="${removeTooltip}"
                        @click="${() => this.toggleMenu('help')}"
                        style=${!this.isEditable() && this.helpList?.length == 0 ? 'display:none' : ''}
                    >
                        ${drawButton('help', 'tool')}
                    </button>
                    <button
                        @mouseenter="${(e) => createTooltip(e, 'Lösche alles')}"
                        @mouseleave="${removeTooltip}"
                        @click="${this.showConfirmPrompt}"
                        style=${!this.allowStudentEdit ? 'display:none' : ''}
                    >
                        ${drawButton('delete', 'tool')}
                    </button>
                    <button
                        @mouseenter="${(e) => createTooltip(e, 'Fullscreen')}"
                        @mouseleave="${removeTooltip}"
                        @click="${this.toggleFullscreen}"
                        class="fullscreen-button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512">
                            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <path
                                d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z"
                            />
                        </svg>
                    </button>
                </div>

                <div class="flowchart-menu" style=${!this.allowStudentEdit ? 'display:none' : ''}>
                    <button class="close-button" @click="${() => this.toggleMenu('flow')}">×</button>
                    <button @click="${() => this.addGraphNode('start', 'Start')}">
                        ${drawButton('start', 'flow')}
                    </button>
                    <button @click="${() => this.addGraphNode('op', 'Operation')}">${drawButton('op', 'flow')}</button>
                    <button @click="${() => this.addGraphNode('decision', '  Verzweigung  ')}">
                        ${drawButton('decision', 'flow')}
                    </button>
                    <button @click="${() => this.addGraphNode('i/o', 'Ein-/Ausgabe')}">
                        ${drawButton('i/o', 'flow')}
                    </button>
                    <button @click="${() => this.addGraphNode('sub', 'Unterprogramm')}">
                        ${drawButton('sub', 'flow')}
                    </button>
                    <button @click="${() => this.addGraphNode('connector', '')}">
                        ${drawButton('connector', 'flow')}
                    </button>
                    <button @click="${() => this.addGraphNode('end', 'Ende')}">${drawButton('end', 'flow')}</button>
                    <button @click="${() => this.addGraphNode('text', 'Kommentar')}">
                        ${drawButton('text', 'flow')}
                    </button>
                </div>

                <button class="show-flowchart-button hidden" @click="${() => this.toggleMenu('flow')}">+</button>

                <div class="solution-menu hidden">
                    <div class="solution-titel">Pfad überprüfen</div>
                    ${this.taskList?.map((task) =>
                        task.sequence
                            ? html`<button class="solution-button" @click="${() => this.checkSolution(task)}">
                                  ${task.titel}
                              </button>`
                            : ''
                    )}
                </div>

                <div class="task-menu hidden" style=${this.fullscreen ? 'top:10px;right:10px;' : ''}>
                    <button class="close-button" @click="${() => this.toggleMenu('task')}">×</button>
                    <div class="task-menu-wrapper">
                        ${this.taskList?.length === 0
                            ? html`<p class="no-tasks-message">Keine Aufgaben!</p>`
                            : renderTasks.bind(this)(this.taskList)}
                        <button class="add-task-button editMode" @click="${this.addTask}">
                            ${drawButton('addTask', 'task')}
                        </button>
                    </div>
                </div>

                <div class="help-menu hidden" style=${this.fullscreen ? 'top:10px;right:10px;' : ''}>
                    <button class="close-button" @click="${() => this.toggleMenu('help')}">×</button>
                    ${this.helpList?.length === 0
                        ? html`<p class="no-help-message">Keine Hinweise!</p>`
                        : renderHelpList.bind(this)(this.helpList)}
                    <button class="add-help-button editMode" @click="${this.addHelp}">
                        ${drawButton('addHelp', 'help')}
                    </button>
                </div>

                <div class="translate-menu hidden">
                    <button class="close-button" @click="${() => this.toggleMenu('translate')}">×</button>
                    <div class="translate-menu-container">
                        <button class="translate-button" @click="${() => this.translateFlowchart('natural')}">
                            ${drawButton('naturalLanguage', 'translate')}
                        </button>
                        <textarea id="naturalLanguageOutput" class="output-textarea hidden" disabled></textarea>
                    </div>
                    <div class="translate-menu-container">
                        <button class="translate-button" @click="${() => this.translateFlowchart('pseudo')}">
                            ${drawButton('pseudoCode', 'translate')}
                        </button>
                        <textarea id="pseudoCodeOutput" class="output-textarea hidden" disabled></textarea>
                    </div>
                </div>

                <div id="context-menu" class="context-menu">
                    <div class="context-menu-item" @click="${() => this.deleteSelectedObject()}">Löschen</div>
                </div>

                <custom-prompt
                    label="Geben Sie einen neuen Text ein:"
                    @submit="${(event: CustomEvent) => this.handlePromptSubmit(event)}"
                    @cancel="${this.hidePrompt}"
                    class="hidden"
                ></custom-prompt>

                <confirm-prompt
                    label="Sind Sie sicher, dass Sie alles löschen möchten?"
                    .onConfirm="${this.clearAll}"
                    .onCancel="${this.hidePrompt}"
                    class="hidden"
                ></confirm-prompt>

                <div class="prompt ${this.showSolution ? '' : 'hidden'}">
                    <p>${this.solutionMessage}</p>
                    <button @click="${this.closeSolution}">Schließen</button>
                </div>
            </div>
            <div
                class="y-rezise"
                @dragend="${this.handleYResizeEnd}"
                draggable="true"
                style=${!this.allowStudentEdit || this.fullscreen ? 'display:none' : ''}
            ></div>
        `;
    }

    private renderToolMenu() {
        return html`<aside class="tool-menu" part="options">
        <h2>Einstellungen</h2>

        <div class="setting-menu-container">
            <div class="setting-item">
                <label>Schriftart:</label>
                <select id="font-selector"
                    @change="${(e) => {
                        this.font = e.target.value;
                        this.graphSettings.font = e.target.value;
                        this.redrawCanvas();
                    }}"
                >
                    <option value="Arial">Arial</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New" selected>Courier New</option>
                </select>
            </div>
            <div class="setting-item">
                <label>Schriftgröße:</label>
                <select id="font-size-selector"
                    @change="${(e) => {
                        this.fontSize = e.target.value;
                        this.graphSettings.fontSize = parseInt(e.target.value);
                        this.redrawCanvas();
                    }}"
                >
                    <option value="12">12</option>
                    <option value="14">14</option>
                    <option value="16" selected>16</option>
                    <option value="18">18</option>
                    <option value="20">20</option>
                    <option value="22">22</option>
                </select>
            </div>
            <div class="setting-item">
                <label>Farbthema:</label>
                <select id="color-theme-selector"
                    @change="${(e) => {
                        this.theme = e.target.value;
                        this.graphSettings.theme = e.target.value;
                        this.redrawCanvas();
                    }}"
                >
                    <option value="standard" selected>Standard</option>
                    <option value="pastel">Pastel</option>
                    <option value="mono">Mono</option>
                    <option value="s/w">Schwarz/Weiß</option>
                </select>
            </div>
            <div class="setting-item">
                <label>Zoomen:</label>
                <div class="zoom-selector">
                    <button id="zoom-out-button" class="zoom-button"
                        @click="${(e) => {
                            this.zoomLevel = Math.max(this.zoomLevel - 10, 50); // Begrenze den Zoom auf 50%
                            this.applyZoom();
                        }}"
                    >-</button>
                    <span id="zoom-percentage" class="zoom-text">${this.zoomLevel}%</span>
                    <button id="zoom-in-button" class="zoom-button"
                        @click="${(e) => {
                            this.zoomLevel = Math.min(this.zoomLevel + 10, 200); // Begrenze den Zoom auf 200%
                            this.applyZoom();
                        }}"
                    >+</button>
                </div>
            </div>
            <div class="setting-item">
                <label>Bearbeiten erlauben:</label>
                <input
                    type="checkbox"
                    id="editable-checkbox"
                    @change="${(e) => {
                        this.allowStudentEdit = e.target.checked;
                    }}"
                    ?checked="${this.allowStudentEdit}"
                />
            </div>
            <div class="setting-item">
                <label>Bewegen erlauben:</label>
                <input
                    type="checkbox"
                    id="panable-checkbox"
                    @change="${(e) => {
                        this.alowStudentPan = e.target.checked;
                        if (e.target.checked) {
                            this.canvasOffsetX = 0;
                            this.canvasOffsetY = 0;
                        } else {
                            this.canvasOffsetX = parseFloat(this.canvas.style.getPropertyValue('--offset-x'));
                            this.canvasOffsetY = parseFloat(this.canvas.style.getPropertyValue('--offset-y'));
                        }
                    }}"
                    ?checked="${this.alowStudentPan}"
                />
        </div>
        <h2>Beispiele</h2>
        <div class="preset-container">
            <label>Beispiele:</label>
            <button class="preset-button" @click="${() => this.showPreset('Erklärung')}">Erkärung</button>
            <button class="preset-button" @click="${() => this.showPreset('Beispiel')}">Beispiel</button>
            <button class="preset-button" @click="${() => this.showPreset('If/Else')}">If/Else</button>
            <button class="preset-button" @click="${() => this.showPreset('For-Schleife')}">
                For-Schleife
            </button>
            <button class="preset-button" @click="${() => this.showPreset('Switch')}">Switch</button>
        </div>
    </aside>`;
    }

    // ------------------------ User interface Funktionen ------------------------

    // private getUserSettings() {
    //     const fontSelector = this.shadowRoot?.querySelector('#font-selector') as HTMLSelectElement;
    //     const fontSizeSelector = this.shadowRoot?.querySelector('#font-size-selector') as HTMLSelectElement;
    //     const themeSelector = this.shadowRoot?.querySelector('#color-theme-selector') as HTMLSelectElement;

    //     this.graphSettings.font = fontSelector.value;
    //     this.graphSettings.fontSize = parseInt(fontSizeSelector.value);
    //     this.graphSettings.theme = themeSelector.value;
    // }

    // Variante ohne Netlify
    // private translateFlowchart(language: 'natural' | 'pseudo') {
    //    const messages = this.generateMessages(language);
    //    document.body.style.cursor = 'wait';
    //    fetch('https://api.openai.com/v1/chat/completions', {
    //       method: 'POST',
    //       headers: {
    //          'Content-Type': 'application/json',
    //          'Authorization': `Bearer `,
    //       },
    //       body: JSON.stringify({
    //          "model": "gpt-3.5-turbo",
    //          "messages": messages,
    //          "max_tokens": 2000,
    //       }),
    //    })
    //    .then(response => response.json())
    //    .then(data => {
    //       console.log(data)
    //       const text = data.choices[0].message['content'].trim();
    //       if (language === 'natural') {
    //          let textAreaElement = this.shadowRoot.getElementById('naturalLanguageOutput') as HTMLTextAreaElement;
    //          textAreaElement.value = text;
    //          textAreaElement.classList.remove('hidden');
    //      } else {
    //          let textAreaElement = this.shadowRoot.getElementById('pseudoCodeOutput') as HTMLTextAreaElement;
    //          textAreaElement.value = text;
    //          textAreaElement.classList.remove('hidden');
    //      }
    //   })
    //   .finally(() => {
    //    document.body.style.cursor = 'auto';
    //   });;
    //  }

    private translateFlowchart(language: 'natural' | 'pseudo') {
        const messages = this.generateMessages(language);
        const translateButtons = this.shadowRoot.querySelectorAll('.translate-button');
        translateButtons.forEach((button: HTMLElement) => (button.style.cursor = 'wait'));
        document.body.style.cursor = 'wait';
        fetch('/.netlify/functions/translateFlowchart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: messages,
                max_tokens: 2000,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (language === 'natural') {
                    let textAreaElement = this.shadowRoot.getElementById(
                        'naturalLanguageOutput'
                    ) as HTMLTextAreaElement;
                    textAreaElement.value = data.translation;
                    textAreaElement.classList.remove('hidden');
                } else {
                    let textAreaElement = this.shadowRoot.getElementById('pseudoCodeOutput') as HTMLTextAreaElement;
                    textAreaElement.value = data.translation;
                    textAreaElement.classList.remove('hidden');
                }
            })
            .finally(() => {
                translateButtons.forEach((button: HTMLElement) => (button.style.cursor = 'pointer'));
                document.body.style.cursor = 'auto';
            });
    }

    private generateMessages(language: 'natural' | 'pseudo'): Array<{ role: string; content: string }> {
        let systemMessage: string;
        if (language === 'natural') {
            systemMessage =
                'Die folgenden Daten stellen ein Programmablaufplan dar. Beschreibe den Ablaufplan in einfachen natürlichen Worten.';
        } else {
            systemMessage =
                'Die folgenden Daten stellen ein Programmablaufplan dar. Erzeuge aus den gegebenen Daten Pseudocode.';
        }

        let userMessage: string = '';
        // Füge dem Prompt this.graphNodes hinzu
        this.graphNodes.forEach((node) => {
            userMessage += '\nID: ' + node.id;
            userMessage += '\nNode: ' + node.node;
            userMessage += '\nText: ' + node.text;

            if (node.connections) {
                userMessage += '\nConnections: ';
                node.connections.forEach((connection) => {
                    userMessage += '\nAnchor: ' + connection.anchor;
                    userMessage += '\nDirection: ' + connection.direction;
                    userMessage += '\nConnected To ID: ' + connection.connectedToId;
                    if (connection.text) {
                        userMessage += '\nText: ' + connection.text;
                    }
                });
            }
            userMessage += '\n';
        });

        return [
            {
                role: 'system',
                content: systemMessage,
            },
            {
                role: 'user',
                content: userMessage,
            },
        ];
    }

    selectSequence() {
        // Setze css style von Icon auf aktiv
        const selectButton = this.shadowRoot.getElementById('select-button');
        !this.isSelectingSequence ? selectButton?.classList.add('active') : selectButton?.classList.remove('active');

        this.isSelectingSequence = !this.isSelectingSequence;

        if (!this.isSelectingSequence) {
            this.selectedSequence = [];
        }

        // Deaktive alles ausgewählten Graphelemente
        this.selectedNode = undefined;
        this.selectedArrow = undefined;
        this.selectionRectangle = undefined;

        this.redrawCanvas();
    }

    checkSolution(task: ItemList) {
        // Prüfe, ob die Längen der ausgewählten Sequenz und der Aufgabensequenz übereinstimmen
        if (task.sequence && this.selectedSequence.length === task.sequence.length) {
            for (let i = 0; i < this.selectedSequence.length; i++) {
                // Prüfe, ob die IDs und der Typ jeder Sequenz übereinstimmen
                if (
                    this.selectedSequence[i].id !== task.sequence[i].id ||
                    this.selectedSequence[i].type !== task.sequence[i].type
                ) {
                    this.showSolutionWithMessage('Der ausgewählte Pfad ist leider falsch!');
                    return;
                }
            }
            this.showSolutionWithMessage('Der ausgewählte Pfad ist korrekt!');
        } else {
            this.showSolutionWithMessage('Der ausgewählte Pfad ist leider falsch!');
        }
    }

    // Zeige oder verstecke die angefragten Benutzeroberflächen
    private toggleMenu(menu: 'task' | 'flow' | 'context' | 'preset' | 'help' | 'translate' | 'setting') {
        toggleMenu(this, menu);
        this.focus();
    }

    // Zeige das Kontextmenü an, wenn ein Element angeklickt wurde
    private showContextMenu(event: MouseEvent) {
        if (!this.allowStudentEdit) {
            return;
        }

        const { x, y } = this.getMouseCoordinates(event);

        // Finde den angeklickten Knoten oder Verbindung und speichere sie
        const clickedNode = findLastGraphNode(this.ctx, this.graphNodes, x, y);
        const clickedArrowIndex = this.arrows.findIndex((arrow) => isArrowClicked(x, y, arrow.points));

        // Falls ein Element angeklickt wurde, wird das Kontextmenü angezeigt
        if (clickedNode || clickedArrowIndex !== -1) {
            const contextMenu = this.shadowRoot.getElementById('context-menu');
            if (contextMenu) {
                contextMenu.style.display = 'block';
                contextMenu.style.left = `${event.clientX}px`;
                contextMenu.style.top = `${event.clientY}px`;

                if (clickedNode) {
                    this.selectedNode = clickedNode;
                    this.selectedArrow = undefined;
                } else {
                    this.selectedArrow = this.arrows[clickedArrowIndex];
                    this.selectedNode = undefined;
                }
            }
        }
    }

    setSelectedSequence = (sequence: { id: string; order: number; type: string }[]) => {
        this.selectedSequence = sequence;
    };

    private addTask() {
        this.taskList = [...this.taskList, { titel: 'Titel', content: 'Aufgabe' }];
    }

    private addHelp() {
        this.helpList = [...this.helpList, { titel: 'Titel', content: 'Hinweis' }];
    }

    private showSolutionMenu() {
        const solutionMenuElement = this.shadowRoot?.querySelector('.solution-menu');

        if (!solutionMenuElement) {
            return;
        }

        // Prüfen, ob es eine Aufgabe mit einer Sequence gibt
        const taskWithSequenceExists = this.taskList.some((task) => task.sequence?.length);
        if (this.isSelectingSequence && taskWithSequenceExists && !this.isEditable()) {
            solutionMenuElement.classList.remove('hidden');
        } else {
            solutionMenuElement.classList.add('hidden');
        }
    }

    private showPreset(presetName: string) {
        const preset = this.presetList.find((p) => p.name === presetName);

        if (preset) {
            const updatedPreset = updatePresetIds(preset.graphNodes);

            this.graphNodes = [...this.graphNodes, ...updatedPreset];
            this.arrows = createArrowsFromGraphNodes(this.arrows, this.graphNodes);

            this.reconnectArrows();

            this.redrawCanvas();
        } else {
            console.error(`Preset "${presetName}" nicht gefunden`);
        }
    }

    // Aktiviere Bewegungsmodus für das Canvas
    private grabCanvas() {
        this.isGrabbing = grabCanvas(this, this.isGrabbing);
        this.selectedNode = undefined;
    }

    // ------------------------ Reconnect Arrow Funktionen ------------------------

    private reconnectArrows() {
        this.arrows.forEach((arrow) => {
            const fromId = arrow.from.id;
            const toId = arrow.to.id;

            const fromNode = this.graphNodes.find((node) => node.id === fromId);
            const toNode = this.graphNodes.find((node) => node.id === toId);

            if (fromNode && toNode) {
                arrow.from = fromNode;
                arrow.to = toNode;
            }
        });
    }

    // ------------------------ Drawer Funktionen ------------------------

    private redrawCanvas() {
        // Bereinige das Canvas und berücksichtigt den Zoom Faktor
        const scaleFactor = this.zoomLevel / 100;
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.scale(scaleFactor, scaleFactor);

        // this.getUserSettings();

        this.reconnectArrows();

        // Zeichne alle Verbindungen
        this.arrows.forEach((arrow) => {
            const isSelected = arrow === this.selectedArrow;
            arrow.points = generateArrowPoints(this.ctx, arrow);
            drawArrow(this.ctx, arrow, this.graphSettings, isSelected, this.selectedSequence);
        });

        // Zeichne alle Knoten
        this.graphNodes?.forEach((element) => {
            drawGraphNode(this.ctx, element, this.graphSettings, this.selectedNodes, this.selectedSequence);
        });

        // Zeichne die Ankerpunkte für das ausgewählte Element, falls vorhanden
        if (this.selectedNode) {
            drawNodeAnchors(this.ctx, this.selectedNode, this.hoveredAnchor);
        }

        // Zeichne Ankerpunkte des Pfeils, wenn dieser ausgewählt ist
        this.arrows.forEach((arrow) => {
            const isSelected = arrow === this.selectedArrow;
            if (isSelected) {
                drawArrowAnchor(this.ctx, arrow, this.isArrowAnchorHovered, this.graphSettings);
            }
        });

        //Zeichne eine temporäre Verbindung beim ziehen zwischen zwei Elementen, falls vorhanden
        if (this.isDrawingArrow && this.arrowStart && this.tempArrowEnd) {
            drawTempArrow(this.ctx, this.arrowStart, this.tempArrowEnd);
        }

        if (this.selectionRectangle) {
            drawSelectionField(this.ctx, this.selectionRectangle);
        }

        // Speichere die aktuellen Knoten und Verbindungen als Attribute
        // this.setAttribute('graph-nodes', JSON.stringify(this.graphNodes));
        // this.setAttribute('task-list', JSON.stringify(this.taskList));
        // this.setAttribute('help-list', JSON.stringify(this.helpList));
    }

    // Speichere die Position für den nächsten Knoten
    private addGraphNodeIndex = 0;

    private addGraphNode(
        node: 'start' | 'end' | 'op' | 'decision' | 'connector' | 'i/o' | 'sub' | 'text',
        text: string
    ) {
        const workspace = this.shadowRoot?.querySelector('.workspace') as HTMLElement;
        let centerX = this.canvas.width * 0.45 + workspace.scrollLeft;
        let centerY = this.canvas.height * 0.45 + workspace.scrollTop;

        switch (this.addGraphNodeIndex) {
            case 0:
                centerX += 0;
                centerY += 0;
                break;
            case 1:
                centerX -= 40;
                centerY += 20;
                break;
            case 2:
                centerX += 40;
                centerY += 40;
                break;
            default:
                centerX += 0;
                centerY += 0;
        }

        const element: GraphNode = {
            id: uuidv4(),
            node: node,
            text: text,
            x: centerX,
            y: centerY,
        };

        this.addGraphNodeIndex = (this.addGraphNodeIndex + 1) % 3;

        this.graphNodes = [...this.graphNodes, element];
        this.reconnectArrows();
        drawGraphNode(this.ctx, element, this.graphSettings, this.selectedNodes, this.selectedSequence);
    }

    // ------------------------ Mouse-Events ------------------------

    private handleMouseDown(event: MouseEvent) {
        const { x, y } = this.getMouseCoordinates(event);
        const nodeUnderCursor = findLastGraphNode(this.ctx, this.graphNodes, x, y);

        if (!nodeUnderCursor || !this.selectedNodes.includes(nodeUnderCursor)) {
            this.selectedNodes = [];
            this.draggedNodes = [];
        }

        // Handhabung wenn Knoten gezogen wird
        if (!this.isGrabbing) {
            if (!this.allowStudentEdit) {
                return;
            }

            if (this.selectedNodes.length > 1) {
                const { draggedNodes, isDragging, dragOffset } = handleMultipleNodesDragStart(
                    this.ctx,
                    x,
                    y,
                    this.selectedNodes,
                    this.selectedArrow
                );
                this.draggedNodes = draggedNodes;
                this.isDragging = isDragging;
                this.dragOffset = dragOffset;
            } else {
                const { draggedNode, isDragging, dragOffset } = handleNodeDragStart(
                    this.ctx,
                    x,
                    y,
                    this.graphNodes,
                    this.selectedArrow
                );
                this.draggedNode = draggedNode;
                this.isDragging = isDragging;
                this.dragOffset = dragOffset;
            }
        }

        if (this.isGrabbing) {
            // Update Offset von Canvwas wenn dieser gezogen wird
            this.grabStartPosition = { x, y };
            const offsetX = parseFloat(this.canvas.style.getPropertyValue('--offset-x'));
            const offsetY = parseFloat(this.canvas.style.getPropertyValue('--offset-y'));
            this.grabStartOffset = { x: offsetX, y: offsetY };
        } else {
            // Wenn ein Pfeil gezogen wird, wird ein temporärer gestrichelter Pfeil gezeichnet
            const { arrowToMove, arrowStart } = handleArrowDragStart(
                this.ctx,
                x,
                y,
                this.graphNodes,
                this.selectedArrow,
                this.handleAnchorClick.bind(this)
            );

            if (arrowToMove && arrowStart) {
                this.arrowStart = arrowStart;
                this.arrows = this.arrows.filter((arrow) => arrow !== arrowToMove);
            }
        }

        if (!nodeUnderCursor && !this.isGrabbing && !this.selectedNode) {
            if (!this.allowStudentEdit) {
                return;
            }

            this.selectionRectangle = { x, y, width: 0, height: 0 };
        }
    }

    private handleMouseUp(event: MouseEvent) {
        if (this.selectionRectangle) {
            this.selectionRectangle = undefined;
        } else if (this.isGrabbing && this.grabStartPosition) {
            // Setze die Grabposition des Canvas zurück, nachdem dieser gezogen wurde
            const { grabStartPosition, grabStartOffset } = handleGrabRelease();
            this.grabStartPosition = grabStartPosition;
            this.grabStartOffset = grabStartOffset;
        } else {
            if (this.isDragging) {
                // Füge diese Zeile hinzu, um die Knotenposition basierend auf dem Schwellenwert zu aktualisieren
                if (this.selectedNodes.length === 0) {
                    snapNodePosition(this.ctx, this.draggedNode, this.graphNodes, 8);
                }

                // Setze die Informationen zurück, nachdem ein Knoten gezogen wurde
                const { isDragging } = handleNodeDragStop();
                this.isDragging = isDragging;
            } else if (this.isDrawingArrow) {
                // Erstelle ggf. die Pfeilverbindung, nachdem ein Pfeil losgelassen wurde
                const { x, y } = this.getMouseCoordinates(event);
                const { tempArrowEnd, arrowStart, arrows } = handleArrowCreation(
                    this.ctx,
                    x,
                    y,
                    this.arrowStart,
                    this.graphNodes,
                    this.arrows
                );

                this.tempArrowEnd = tempArrowEnd;
                this.arrowStart = arrowStart;
                this.arrows = arrows;
                this.isDrawingArrow = false;
            }
        }

        // Resette einmalige Schranke fürs draggen mehrerer Knoten
        this.checkOffset = true;

        this.graphNodes = [...this.graphNodes];
    }

    private handleMouseMove(event: MouseEvent) {
        const { x, y } = this.getMouseCoordinates(event);
        if (this.selectionRectangle) {
            this.selectionRectangle.width = x - this.selectionRectangle.x;
            this.selectionRectangle.height = y - this.selectionRectangle.y;
            this.selectedNodes = this.graphNodes.filter((node) =>
                isNodeInRectangle(this.ctx, node, this.selectionRectangle)
            );
            this.redrawCanvas();
        } else if (this.isGrabbing && this.grabStartPosition && this.grabStartOffset) {
            const deltaX = x - this.grabStartPosition.x;
            const deltaY = y - this.grabStartPosition.y;

            // Aktualisiere die Koordinaten der Knoten und Verbindungen
            this.graphNodes.forEach((element) => {
                element.x += deltaX;
                element.y += deltaY;
            });

            this.arrows.forEach((arrow) => {
                if (arrow.points) {
                    arrow.points.forEach((point) => {
                        point.x += deltaX;
                        point.y += deltaY;
                    });
                }
            });

            // Aktualisiere das Canvas anhand der Mausbewegung
            const offsetX = parseFloat(this.canvas.style.getPropertyValue('--offset-x'));
            const offsetY = parseFloat(this.canvas.style.getPropertyValue('--offset-y'));
            this.canvas.style.setProperty('--offset-x', `${offsetX + (deltaX * this.zoomLevel) / 100}px`);
            this.canvas.style.setProperty('--offset-y', `${offsetY + (deltaY * this.zoomLevel) / 100}px`);

            // Zeichne das aktualisierte Canvas
            this.redrawCanvas();

            // Aktualisiere die grabStartPosition auf die aktuelle Mausposition
            this.grabStartPosition = { x, y };
        } else {
            if (this.isDragging && this.draggedNodes.length > 1) {
                let deltaX: number;
                let deltaY: number;

                if (this.checkOffset) {
                    deltaX = this.dragOffset.x;
                    deltaY = this.dragOffset.y;

                    const nodeUnderCursor = findLastGraphNode(this.ctx, this.graphNodes, x, y);
                    this.draggedNodes.forEach((node) => {
                        node.x = node.x + deltaX + (nodeUnderCursor.x - x);
                        node.y = node.y + deltaY + (nodeUnderCursor.y - y);
                    });

                    this.checkOffset = false;
                } else {
                    deltaX = x - this.dragOffset.x;
                    deltaY = y - this.dragOffset.y;
                    this.draggedNodes.forEach((node) => {
                        node.x += deltaX;
                        node.y += deltaY;
                    });
                }

                this.dragOffset = { x, y };

                this.redrawCanvas();
            } else if (this.isDragging && this.draggedNode) {
                this.draggedNode.x = x - this.dragOffset.x;
                this.draggedNode.y = y - this.dragOffset.y;
                this.redrawCanvas();
            } else if (this.isDrawingArrow && this.arrowStart && (this.selectedNode || this.selectedArrow)) {
                const { x, y } = this.getMouseCoordinates(event);

                this.tempArrowEnd = { x, y };

                this.redrawCanvas();
            }
        }

        // Highlighte den Ankerpunkt, falls der Benutzer über diesen kommt
        const { hoveredAnchor, isArrowAnchorHovered } = highlightAnchor(
            this.ctx,
            this.selectedNode,
            this.selectedArrow,
            x,
            y
        );
        this.hoveredAnchor = hoveredAnchor;
        this.isArrowAnchorHovered = isArrowAnchorHovered;
        this.redrawCanvas();
    }

    private handleClick(event: MouseEvent) {
        const { x, y } = this.getMouseCoordinates(event);

        if (this.isSelectingSequence) {
            handleSequenceSelection(this.ctx, this.selectedSequence, this.graphNodes, this.arrows, x, y);
            this.redrawCanvas();
        } else {
            if (!this.isGrabbing) {
                if (!this.allowStudentEdit) {
                    return;
                }

                if (this.draggedNodes.length === 0) {
                    // Setze das angeklickte Element, oder entferne die Auswahl, wenn kein Element angeklickt wurde
                    this.selectedNode = findLastGraphNode(this.ctx, this.graphNodes, x, y);
                    const selectedNodeIndex = this.graphNodes.lastIndexOf(this.selectedNode);
                    // Packe das ausgewählte Element ans Ende des Arrays, damit es über den anderen Elementen erscheint
                    if (this.selectedNode && !this.isDragging) {
                        this.graphNodes.splice(selectedNodeIndex, 1);
                        this.graphNodes.push(this.selectedNode);
                    }

                    this.updateAnchorListeners();
                }
                // Finde den angeklickte Pfeilindex, oder entferne die Auswahl, wenn kein Pfeil angeklickt wurde
                const selectedArrowIndex = this.arrows.findIndex((arrow) => isArrowClicked(x, y, arrow.points));
                // Wenn ein Pfeil angeklickt wurde, setze die property selectedArrow auf den angeklickten Pfeil
                // und verändere die Reihenfolge im Array, damit der angeklickte Pfeil immer vollständig gefärbt angezeigt wird
                if (selectedArrowIndex !== -1) {
                    this.selectedArrow = this.arrows[selectedArrowIndex];
                    this.arrows.splice(selectedArrowIndex, 1);
                    this.arrows.push(this.selectedArrow);
                    this.redrawCanvas();
                } else if (this.selectedArrow) {
                    this.selectedArrow = undefined;
                    this.redrawCanvas();
                }

                // Zeichne den Canvas neu, um die aktualisierte Auswahl anzuzeigen
                this.redrawCanvas();
            }
        }
    }

    private handleDoubleClick(event: MouseEvent) {
        if (!this.allowStudentEdit) {
            return;
        }

        const { x, y } = this.getMouseCoordinates(event);
        const clickedNodeIndex = findGraphNodeLastIndex(this.ctx, this.graphNodes, x, y);
        const selectedArrowIndex = this.arrows.findIndex((arrow) => isArrowClicked(x, y, arrow.points));

        if (clickedNodeIndex !== -1 && this.graphNodes[clickedNodeIndex].node !== 'connector') {
            handleGraphNodeDoubleClick(clickedNodeIndex, (type, index) => this.showCustomPrompt(type, index));
        } else if (selectedArrowIndex !== -1) {
            handleArrowDoubleClick(selectedArrowIndex, (type, index) => this.showCustomPrompt(type, index));
        }
    }

    private handleAnchorClick(node: GraphNode, anchor: number) {
        this.isDrawingArrow = true;
        this.arrowStart = { node, anchor };
    }

    private anchorMouseDownEvent: ((event: MouseEvent) => void) | null = null;

    private updateAnchorListeners() {
        if (this.selectedNode && this.selectedNode.node !== 'text') {
            const anchors = getAnchors(this.ctx, this.selectedNode, 15);

            // Entferne zuerst den bestehenden mousedown-EventListener, falls vorhanden
            if (this.anchorMouseDownEvent && this.canvas) {
                this.canvas.removeEventListener('mousedown', this.anchorMouseDownEvent);
                this.anchorMouseDownEvent = null;
            }

            // Erstelle den neuen EventListener und speicher ihn in der anchorMouseDownEvent-Variable
            this.anchorMouseDownEvent = (event) => {
                const { x, y } = this.getMouseCoordinates(event);
                anchors.forEach((position, index) => {
                    const distance = Math.sqrt((position.x - x) ** 2 + (position.y - y) ** 2);
                    if (distance <= 8) {
                        this.handleAnchorClick(this.selectedNode, index);
                    }
                });
            };

            // Füge den neuen EventListener hinzu
            if (this.canvas) {
                this.canvas.addEventListener('mousedown', this.anchorMouseDownEvent);
            }
        }
    }

    // ------------------------ Lifecycle ------------------------

    firstUpdated() {
        console.log('firstUpdated');

        console.log('this', this.taskList.length);

        this.canvas = this.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
        this.canvas.width = this.clientWidth;
        this.canvas.height = this.currentHeight;
        const workspace = this.shadowRoot.querySelector('.workspace') as HTMLElement;
        workspace.style.setProperty('--widget-height', `${this.currentHeight}px`);

        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.updateCanvasOffset(); // Offset aktualisieren

        this.arrows = createArrowsFromGraphNodes(this.arrows, this.graphNodes);

        this.graphSettings.font = this.font;
        this.graphSettings.fontSize = this.fontSize;
        this.graphSettings.theme = this.theme;

        this.applyZoom();
        this.redrawCanvas();

        // Help Prelist
        // helpPresets.forEach((item) => {
        //    this.helpList.push(item);
        //    addHelp(this, this.helpList);
        // });
    }

    connectedCallback() {
        super.connectedCallback();
        // window.addEventListener('resize', this.updateCanvasSize);
        // window.addEventListener('keydown', this.handleKeyDown);

        // Konvertiert das Array in einen String und setzt es als Attribut
        //this.setAttribute('graph-nodes', JSON.stringify(this.graphNodes));

        this.addEventListener('startSelectSequence', this.selectSequence);
    }

    disconnectedCallback() {
        // window.removeEventListener('resize', this.updateCanvasSize);
        // window.removeEventListener('keydown', this.handleKeyDown);

        this.removeEventListener('startSelectSequence', this.selectSequence.bind(this));
        super.disconnectedCallback();
    }

    updated(changedProperties: Map<string, any>) {
        if (changedProperties.has('contentEditable') && this.isEditable()) {
            autoDeleteEmptyItems(
                this,
                this.taskList,
                '.task-container',
                '.task-wrapper',
                '.task-title',
                '.task-content'
            );
            autoDeleteEmptyItems(
                this,
                this.helpList,
                '.help-container',
                '.help-wrapper',
                '.help-title',
                '.help-content'
            );
        }
        updateDisabledState(this, this.isEditable());
    }

    // Wird aufgerufen, wenn ein Attribut des Elements geändert wird
    attributeChangedCallback(name: string, oldVal: string, newVal: string) {
        super.attributeChangedCallback(name, oldVal, newVal);
        if (name === 'graph-nodes') {
            try {
                // Konvertiert den String zurück in ein Array
                this.graphNodes = JSON.parse(newVal);
                this.arrows = createArrowsFromGraphNodes(this.arrows, this.graphNodes);
                this.reconnectArrows();

                this.redrawCanvas();
            } catch (e) {
                console.error('Invalid JSON in graph-nodes attribute:', e);
            }
        }
    }

    // ------------------------ Allgemeine Systemfunktionen ------------------------

    // Passt die Canvasgröße an die aktuelle Größe des Fenster an
    updateCanvasSize = () => {
        this.canvas.width = this.clientWidth;
        this.canvas.height = this.currentHeight;

        const workspace = this.shadowRoot.querySelector('.workspace') as HTMLElement;
        workspace.style.setProperty('--widget-height', `${this.currentHeight}px`);

        this.redrawCanvas();
    };

    private applyZoom() {
        const scaleFactor = this.zoomLevel / 100;
        this.ctx.resetTransform();
        this.ctx.scale(scaleFactor, scaleFactor);
        this.canvas.style.setProperty('--scaled-grid-size', `${scaleFactor * this.gridSize}px`);
        this.canvas.style.setProperty('--scaled-grid-dot-size', `${scaleFactor * this.dotSize}px`);
        this.redrawCanvas();
    }

    // Lösche alle Elemente vom Canvas
    private clearAll() {
        this.graphNodes = [];
        this.selectedNode = undefined;
        this.arrows = [];
        this.arrowStart = undefined;
        this.redrawCanvas();
    }

    // Lösche das ausgewählte Objekt
    private deleteSelectedObject() {
        // Falls ein Knoten ausgewählt wurde, lösche den Knoten und alle zugehören Verbindungen
        if (this.selectedNodes) {
            this.selectedNodes.forEach((node) => {
                // Entferne ausgewählten Knoten
                this.graphNodes = this.graphNodes.filter((n) => n !== node);
                console.log('nach dem löschen', this.graphNodes);
                // Entferne die Verbindungsinformationen für alle betroffenen Knoten
                this.arrows.forEach((arrow) => {
                    if (arrow.from === node || arrow.to === node) {
                        removeOldConnection(arrow.from, arrow.to);
                    }
                });

                // Entferne alle Pfeile, die mit den gelöschten Elementen verbunden sind
                this.arrows = this.arrows.filter((arrow) => arrow.from !== node && arrow.to !== node);
            });

            this.selectedNodes = [];
        }

        if (this.selectedNode) {
            this.graphNodes = this.graphNodes.filter((node) => node !== this.selectedNode);

            this.arrows.forEach((arrow) => {
                if (arrow.from === this.selectedNode || arrow.to === this.selectedNode) {
                    removeOldConnection(arrow.from, arrow.to);
                }
            });

            this.arrows = this.arrows.filter(
                (arrow) => arrow.from !== this.selectedNode && arrow.to !== this.selectedNode
            );

            this.selectedNode = undefined;
        } else if (this.selectedArrow) {
            // Entferne den ausgewählten Pfeil und die zugehörigen Informationen in den verbundenen Knoten
            removeOldConnection(this.selectedArrow.from, this.selectedArrow.to);
            this.arrows = this.arrows.filter((arrow) => arrow !== this.selectedArrow);
            this.selectedArrow = undefined;
        }

        this.toggleMenu('context');
        this.redrawCanvas();
    }

    // Gibe die aktuellen Koordinaten der Maus zurück, welche den Offset des Canvas und des scrollen berücksichtigt.
    private getMouseCoordinates(event: MouseEvent) {
        let offsetX = this.canvas.getBoundingClientRect().left;
        const offsetY = this.canvas.getBoundingClientRect().top;
        if (this.fullscreen) {
            offsetX -= window.frameElement ? window.frameElement.getBoundingClientRect().left : 0;
        }
        const scaleFactor = this.zoomLevel / 100; // Der Skalierungsfaktor aufgrund von Zoom
        const x = (event.clientX - offsetX) / scaleFactor;
        const y = (event.clientY - offsetY) / scaleFactor;
        return { x, y };
    }

    private handleScroll(event: Event) {
        this.updateCanvasOffset();
    }

    private handleWheel(event: WheelEvent) {
        if (this.isGrabbing && this.matches(':focus-within')) {
            event.preventDefault();
            const zoomText = this.shadowRoot?.querySelector('#zoom-percentage') as HTMLSpanElement;

            if (event.deltaY < 0) {
                this.zoomLevel = Math.min(this.zoomLevel + 10, 200); // Begrenze den Zoom auf 200%
            } else {
                this.zoomLevel = Math.max(this.zoomLevel - 10, 50); // Begrenze den Zoom auf 50%
            }

            this.applyZoom();
        }
    }

    private updateCanvasOffset() {
        const offsetX = this.canvas.getBoundingClientRect().left;
        const offsetY = this.canvas.getBoundingClientRect().top;
        this.canvas.style.setProperty('--offset-x', `${offsetX}px`);
        this.canvas.style.setProperty('--offset-y', `${offsetY}px`);
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        const customPrompt = this.shadowRoot?.querySelector('custom-prompt');
        const confirmPrompt = this.shadowRoot?.querySelector('confirm-prompt');

        if (
            (event.key === 'Backspace' || event.key === 'Delete') &&
            customPrompt?.classList.contains('hidden') &&
            confirmPrompt?.classList.contains('hidden')
        ) {
            this.deleteSelectedObject();
        }
    };

    private handleYResizeEnd(event: MouseEvent) {
        this.currentHeight = Math.max(400, this.currentHeight + event.offsetY);
        this.height = this.currentHeight;
        //update css var

        this.updateCanvasSize();
        this.redrawCanvas();
    }

    private toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            const height = window.screen.height;
            const width = window.screen.width;

            this.canvas.width = width;
            this.canvas.height = height;

            const workspace = this.shadowRoot.querySelector('.workspace') as HTMLElement;
            workspace.style.setProperty('--widget-height', `${height}px`);

            this.redrawCanvas();

            this.requestFullscreen({ navigationUI: 'hide' });
            this.shadowRoot.querySelector('.flowchart-menu').classList.add('fullscreen');

            this.currentHeight = height;
            this.fullscreen = true;

            document.addEventListener('fullscreenchange', () => {
                if (!document.fullscreenElement) {
                    this.shadowRoot.querySelector('.flowchart-menu').classList.remove('fullscreen');
                    this.fullscreen = false;
                    this.currentHeight = this.height;
                    this.updateCanvasSize();
                }
            });
        }
    }

    // ------------------------ Prompt Funktionen ------------------------

    private showCustomPrompt(type: 'node' | 'arrow', index: number) {
        const promptElement = this.shadowRoot.querySelector('custom-prompt') as CustomPrompt;

        let currentText = '';
        if (type === 'node') {
            currentText = this.graphNodes[index].text;
        } else {
            if (this.arrows[index].text) {
                currentText = this.arrows[index].text;
            }
        }

        promptElement.setInputValue(currentText);
        promptElement.classList.remove('hidden');

        this.shadowRoot.querySelector('custom-prompt').classList.remove('hidden');

        const onSubmit = (value: string) => {
            if (type === 'node') {
                if (this.graphNodes[index].node === 'decision') {
                    this.graphNodes[index].text = '  ' + value + '  ';
                } else {
                    this.graphNodes[index].text = value;
                }
            } else {
                this.arrows[index].text = value;
            }
            this.redrawCanvas();
            this.shadowRoot.querySelector('custom-prompt').classList.add('hidden');
        };

        const onCancel = () => {
            this.shadowRoot.querySelector('custom-prompt').classList.add('hidden');
        };

        promptElement.onSubmit = onSubmit;
        promptElement.onCancel = onCancel;
    }

    private showConfirmPrompt() {
        const confirmPrompt = this.shadowRoot.querySelector('confirm-prompt') as ConfirmPrompt;
        confirmPrompt.classList.remove('hidden');
        confirmPrompt.enableKeyListener();

        const onSubmit = () => {
            confirmPrompt.disableKeyListener();
            this.clearAll();
            confirmPrompt.classList.add('hidden');
        };

        const onCancel = () => {
            confirmPrompt.classList.add('hidden');
            confirmPrompt.disableKeyListener();
        };

        (this.shadowRoot.querySelector('confirm-prompt') as ConfirmPrompt).onConfirm = onSubmit;
        (this.shadowRoot.querySelector('confirm-prompt') as ConfirmPrompt).onCancel = onCancel;
    }

    private hidePrompt() {
        const customPrompt = this.shadowRoot.querySelector('custom-prompt');
        const confirmPrompt = this.shadowRoot.querySelector('confirm-prompt') as ConfirmPrompt;

        if (customPrompt) {
            customPrompt.classList.add('hidden');
        }

        if (confirmPrompt) {
            confirmPrompt.classList.add('hidden');
            confirmPrompt.disableKeyListener();
        }
    }

    private handlePromptSubmit(event: CustomEvent) {
        const newText = event.detail.value;

        if (this.promptType === 'node') {
            this.graphNodes[this.promptIndex].text = newText;
        } else if (this.promptType === 'arrow') {
            this.arrows[this.promptIndex].text = newText;
            const selectedArrow = this.arrows[this.promptIndex];
            this.arrows.splice(this.promptIndex, 1);
            this.arrows.push(selectedArrow);
        }
        this.redrawCanvas();
        this.hidePrompt();
    }

    private showSolutionWithMessage(message: string) {
        this.solutionMessage = message;
        this.showSolution = true;
    }

    private closeSolution() {
        this.showSolution = false;
    }
}
