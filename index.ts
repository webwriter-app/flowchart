import { LitElementWw } from '@webwriter/lit'
import { html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { v4 as uuidv4 } from 'uuid';

import { GraphNode } from './src/definitions/GraphNode';
import { Arrow } from './src/definitions/Arrow';
import { ItemList } from './src/definitions/ItemList';

import { drawButton } from './src/modules/drawer/drawButton';
import { drawGraphNode, drawNodeAnchors } from './src/modules/drawer/drawGraphNode';
import { drawArrow, drawTempArrow, generateArrowPoints, drawArrowAnchor } from './src/modules/drawer/drawArrow';

import { handleNodeDragStart, handleArrowDragStart } from './src/modules/handler/mouseDownHandler';
import { handleGrabRelease, handleNodeDragStop, handleArrowCreation } from './src/modules/handler/mouseUpHandler';
import { handleSequenceSelection } from './src/modules/handler/handleSequenceSelection';
import { handleGraphNodeDoubleClick, handleArrowDoubleClick } from './src/modules/handler/doubleClickHandler';

import { toggleMenu, addTask, addHelp, updateDisabledState, grabCanvas } from './src/ui'

import { removeOldConnection, findLastGraphNode, findGraphNodeLastIndex } from './src/modules/helper/utilities'
import { isArrowClicked } from './src/modules/helper/arrowHelper';
import { getAnchors, highlightAnchor } from './src/modules/helper/anchorHelper';
import { createArrowsFromGraphNodes, updatePresetIds } from './src/modules/helper/presetHelper';

import { flowchartPresets } from './src/modules/presets/flowchartPresets';
import { helpPresets } from './src/modules/presets/helpPresets';

import { papWidgetStyles } from './src/modules/styles/styles'

import { CustomPrompt } from './src/components/custom-prompt';
import './src/components/custom-prompt'

@customElement('pap-widget')
export class PAPWidget extends LitElementWw {
   @property({ type: Array }) graphNodes: GraphNode[] = [];
   @property({ type: Object }) selectedNode?: GraphNode;
   @property({ type: Array }) arrows: Arrow[] = [];
   @property({ type: Object }) selectedArrow?: Arrow;

   @property({ type: Array }) taskList: ItemList[] = [];
   @property({ type: Array }) helpList: ItemList[] = [];

   @property({ type: Array }) presetList: { name: string, graphNodes: GraphNode[] }[] = flowchartPresets;


   private canvas: HTMLCanvasElement;
   private ctx: CanvasRenderingContext2D;

   private isDragging = false;
   private draggedNode: GraphNode;
   private dragOffset = { x: 0, y: 0 };

   private isDrawingArrow = false;
   private arrowStart?: { node: GraphNode; anchor: number };
   private tempArrowEnd?: { x: number; y: number };

   private isGrabbing = false;
   private grabStartPosition?: { x: number; y: number };
   private grabStartOffset?: { x: number; y: number };

   private hoveredAnchor?: { element: GraphNode; anchor: number };
   private isArrowAnchorHovered: boolean;

   private isSelectingSequence = false;
   private selectedSequence: { id: string; order: number; type: string }[] = [];

   private promptType: 'node' | 'arrow' | null;
   private promptIndex: number | null;


   static styles = papWidgetStyles;

   render() {
      return html`
      <div class='workspace' @scroll='${this.handleScroll}'>

         <canvas
            width='${window.innerWidth}'
            height='${window.innerHeight}'
            @mousedown='${this.handleMouseDown}'
            @mouseup='${this.handleMouseUp}'
            @mousemove='${this.handleMouseMove}'
            @dblclick='${this.handleDoubleClick}'
            @click='${(event: MouseEvent) => { this.handleClick(event); this.toggleMenu('context') }}'
            @contextmenu='${(event: MouseEvent) => { event.preventDefault(); this.showContextMenu(event); }}'
         ></canvas>

         <div class='flowchart-menu'>
            <button class="close-button" @click='${() => this.toggleMenu('flow')}'>
               ×
            </button>
            <button @click='${() => this.addGraphNode('start', 'Start')}'>
               ${drawButton('start', 'flow')}
            </button>
            <button @click='${() => this.addGraphNode('op', 'Operation')}'>
               ${drawButton('op', 'flow')}
            </button>
            <button @click='${() => this.addGraphNode('decision', 'Verzweigung')}'>
               ${drawButton('decision', 'flow')}
            </button>
            <button @click='${() => this.addGraphNode('connector', '')}'>
               ${drawButton('connector', 'flow')}
            </button>
            <button @click='${() => this.addGraphNode('i/o', 'Ein-/Ausgabe')}'>
               ${drawButton('i/o', 'flow')}
            </button>
            <button @click='${() => this.addGraphNode('sub', 'Unterprogramm')}'>
               ${drawButton('sub', 'flow')}
            </button>
            <button @click='${() => this.addGraphNode('end', 'Ende')}'>
               ${drawButton('end', 'flow')} 
            </button>
            <button @click='${() => this.addGraphNode('text', 'Kommentar')}'>
               ${drawButton('text', 'flow')}
            </button>
         </div>

         <button class="show-flowchart-button hidden" @click='${() => this.toggleMenu('flow')}'>
            +
         </button>

         <div class='tool-menu'>
            <button @click='${() => this.clearAll()}'>
               ${drawButton('delete', 'tool')}
            </button>
            <button id='grab-button' @click='${this.grabCanvas}'>
               ${drawButton('grab', 'tool')}
            </button>
            <button id='select-button' @click='${this.selectSequence}'>
               ${drawButton('select', 'tool')}
            </button>
            <button @click='${() => this.toggleMenu('translate')}'>
               ${drawButton('translate', 'tool')}
            </button>
            <button @click='${() => this.toggleMenu('task')}'>
               ${drawButton('task', 'tool')}
            </button>
            <button @click='${() => this.toggleMenu('preset')}'>
               ${drawButton('preset', 'tool')}
            </button>
            <button @click='${() => this.toggleMenu('help')}'>
               ${drawButton('help', 'tool')}
            </button>
         </div>

         <div class='task-menu hidden'>
            <button class='close-button' @click='${() => this.toggleMenu('task')}'>
               ×
            </button>
            <div class='task-menu-wrapper'>
               <div class="task-container"></div>
               <button class="add-task-button editMode" @click='${this.addTask}'>
                  ${drawButton('addTask', 'task')}
               </button>
            </div>   
         </div> 

         <div class='preset-menu hidden'>
            <button class='close-button' @click='${() => this.toggleMenu('preset')}'>
               ×
            </button>
            <div class="preset-container"></div>
               <button class="preset-button" @click='${() => this.showPreset('Beispiel')}'>
                  Beispiel
               </button>
               <button class="preset-button" @click='${() => this.showPreset('If/Else')}'>
                  If/Else
               </button>
               <button class="preset-button" @click='${() => this.showPreset('For-Schleife')}'>
                  For-Schleife
               </button>
         </div>

         <div class='help-menu hidden'>
            <button class='close-button' @click='${() => this.toggleMenu('help')}'>
               ×
            </button>
            <div class="help-container"></div>
               <button class="add-help-button editMode" @click='${this.addHelp}'>
                  ${drawButton('addHelp', 'help')}
               </button>
         </div>

         <div class='translate-menu hidden'>
            <button class='close-button' @click='${() => this.toggleMenu('translate')}'>
               ×
            </button>
            <div class="translate-container"></div>
               <button class="translate-button" @click='${this.translateToPseudoCode}'>
                  ${drawButton('pseudoCode', 'translate')}
               </button>
         </div>

         <div id='context-menu' class='context-menu'>
            <div class='context-menu-item' @click='${() => this.deleteSelectedObject()}'>
               Löschen
            </div>
         </div>

         <custom-prompt
            label="Geben Sie einen neuen Text ein:"
            @submit="${(event: CustomEvent) => this.handlePromptSubmit(event)}"
            @cancel="${this.hidePrompt}"
            class="hidden"
         ></custom-prompt>

      </div>
    `;
   }

   // ------------------------ User interface Funktionen ------------------------

   private translateToPseudoCode() {
      const pseudocode = this.generatePseudoCode(this.graphNodes);
      console.log(pseudocode);

   }

   private generatePseudoCode(graphNodes: GraphNode[]) {
   }


   private selectSequence() {
      // Setze css style von Icon auf aktiv
      const selectButton = this.shadowRoot.getElementById('select-button');
      !this.isSelectingSequence ? selectButton?.classList.add('active') : selectButton?.classList.remove('active');

      this.isSelectingSequence = !this.isSelectingSequence;

      if (!this.isSelectingSequence) {
         this.selectedSequence = [];
      }
      this.redrawCanvas();
   }

   // Zeige oder verstecke die angefragten Benutzeroberflächen 
   private toggleMenu(menu: 'task' | 'flow' | 'context' | 'preset' | 'help' | 'translate') {
      toggleMenu(this, menu);
   }

   // Zeige das Kontextmenü an, wenn ein Element angeklickt wurde
   private showContextMenu(event: MouseEvent) {
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

   private addTask() {
      addTask(this, this.taskList);
   }

   private addHelp() {
      addHelp(this, this.helpList);
   }

   private showPreset(presetName: string) {
      const preset = this.presetList.find((p) => p.name === presetName);

      if (preset) {
         const updatedPreset = updatePresetIds(preset.graphNodes);

         this.graphNodes = [...this.graphNodes, ...updatedPreset];
         this.arrows = createArrowsFromGraphNodes(this.arrows, this.graphNodes);
         this.redrawCanvas();
      } else {
         console.error(`Preset "${presetName}" nicht gefunden`);
      }
   }

   // Aktiviere Bewegungsmodus für das Canvas
   private grabCanvas() {
      this.isGrabbing = grabCanvas(this, this.isGrabbing);
      console.log("GraphNode: ", this.graphNodes);
      console.log("Arrows: ", this.arrows);
   }

   // ------------------------ Drawer Funktionen ------------------------

   private redrawCanvas() {
      // Bereinige das Canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Zeichne alle Knoten 
      this.graphNodes.forEach((element) => {
         drawGraphNode(this.ctx, element, this.selectedNode, this.selectedSequence);
      });

      // Zeichne alle Verbindungen
      this.arrows.forEach((arrow) => {
         const isSelected = arrow === this.selectedArrow;
         arrow.points = generateArrowPoints(this.ctx, arrow);
         drawArrow(this.ctx, arrow, isSelected, this.selectedSequence);

         // Zeichne Ankerpunkte des Pfeils, wenn dieser ausgewählt ist
         if (isSelected) {
            drawArrowAnchor(this.ctx, arrow, this.isArrowAnchorHovered);
         }
      });

      // Zeichne die Ankerpunkte für das ausgewählte Element, falls vorhanden
      if (this.selectedNode) {
         drawNodeAnchors(this.ctx, this.selectedNode, this.hoveredAnchor);
      }

      //Zeichne eine temporäre Verbindung beim ziehen zwischen zwei Elementen, falls vorhanden
      if (this.isDrawingArrow && this.arrowStart && this.tempArrowEnd) {
         drawTempArrow(this.ctx, this.arrowStart, this.tempArrowEnd);
      }
   }

   private addGraphNode(node: 'start' | 'end' | 'op' | 'decision' | 'connector' | 'i/o' | 'sub' | 'text', text: string) {
      const workspace = this.shadowRoot?.querySelector('.workspace') as HTMLElement;
      const centerX = this.canvas.width * 0.5 + workspace.scrollLeft;
      const centerY = this.canvas.height * 0.5 + workspace.scrollTop;

      const element: GraphNode = {
         id: uuidv4(),
         node: node,
         text: text,
         x: centerX,
         y: centerY
      };

      this.graphNodes = [...this.graphNodes, element];
      drawGraphNode(this.ctx, element, this.selectedNode, this.selectedSequence);
   }



   // ------------------------ Mouse-Events ------------------------

   private handleMouseDown(event: MouseEvent) {
      const { x, y } = this.getMouseCoordinates(event);

      if (this.isGrabbing) {
         // Update Offset von Canvwas wenn dieser gezogen wird
         this.grabStartPosition = { x, y };
         const offsetX = parseFloat(this.style.getPropertyValue('--offset-x'));
         const offsetY = parseFloat(this.style.getPropertyValue('--offset-y'));
         this.grabStartOffset = { x: offsetX, y: offsetY };
      } else {
         // Handhabung wenn Knoten gezogen wird
         const { draggedNode, isDragging, dragOffset } = handleNodeDragStart(this.ctx, x, y, this.graphNodes, this.selectedArrow);
         this.draggedNode = draggedNode;
         this.isDragging = isDragging;
         this.dragOffset = dragOffset;

         // Wenn ein Pfeil gezogen wird, wird ein temporärer gestrichelter Pfeil gezeichnet
         const { arrowToMove, arrowStart } = handleArrowDragStart(this.ctx, x, y, this.graphNodes, this.selectedArrow, this.handleAnchorClick.bind(this));

         if (arrowToMove && arrowStart) {
            this.arrowStart = arrowStart;
            this.arrows = this.arrows.filter((arrow) => arrow !== arrowToMove);
         }
      }
   }

   private handleMouseUp(event: MouseEvent) {
      if (this.isGrabbing && this.grabStartPosition) {
         // Setze die Grabposition des Canvas zurück, nachdem dieser gezogen wurde
         const { grabStartPosition, grabStartOffset } = handleGrabRelease();
         this.grabStartPosition = grabStartPosition;
         this.grabStartOffset = grabStartOffset;
      } else {
         if (this.isDragging) {
            // Setze die Informationen zurück, nachdem ein Knoten gezogen wurde
            const { isDragging } = handleNodeDragStop();
            this.isDragging = isDragging;
         } else if (this.isDrawingArrow) {
            // Erstelle ggf. die Pfeilverbindung, nachdem ein Pfeil losgelassen wurde
            const { x, y } = this.getMouseCoordinates(event);
            const { tempArrowEnd, arrowStart, arrows } = handleArrowCreation(this.ctx, x, y, this.arrowStart, this.graphNodes, this.arrows);

            this.tempArrowEnd = tempArrowEnd;
            this.arrowStart = arrowStart;
            this.arrows = arrows;
            this.isDrawingArrow = false;
         }
      }
   }

   private handleMouseMove(event: MouseEvent) {
      const { x, y } = this.getMouseCoordinates(event);
      if (this.isGrabbing && this.grabStartPosition && this.grabStartOffset) {
         const deltaX = x - this.grabStartPosition.x;
         const deltaY = y - this.grabStartPosition.y;

         // Aktualisiere die Koordinaten der Knoten und Verbindungen
         this.graphNodes.forEach(element => {
            element.x += deltaX;
            element.y += deltaY;
         });
         this.arrows.forEach(arrow => {
            if (arrow.points) {
               arrow.points.forEach(point => {
                  point.x += deltaX;
                  point.y += deltaY;
               });
            }
         });

         // Aktualisiere das Canvas anhand der Mausbewegung
         const offsetX = parseFloat(this.style.getPropertyValue('--offset-x'));
         const offsetY = parseFloat(this.style.getPropertyValue('--offset-y'));
         this.style.setProperty('--offset-x', `${offsetX + deltaX}px`);
         this.style.setProperty('--offset-y', `${offsetY + deltaY}px`);

         // Zeichne das aktualisierte Canvas
         this.redrawCanvas();

         // Aktualisiere die grabStartPosition auf die aktuelle Mausposition
         this.grabStartPosition = { x, y };
      } else {
         if (this.isDragging && this.draggedNode) {

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
      const { hoveredAnchor, isArrowAnchorHovered } = highlightAnchor(this.ctx, this.selectedNode, this.selectedArrow, x, y);
      this.hoveredAnchor = hoveredAnchor;
      this.isArrowAnchorHovered = isArrowAnchorHovered;
      this.redrawCanvas();
   }

   private handleClick(event: MouseEvent) {
      const { x, y } = this.getMouseCoordinates(event);

      if (this.isSelectingSequence) {
         handleSequenceSelection(this.ctx, this.selectedSequence, this.graphNodes, this.arrows, x, y);
         console.log(this.selectedSequence);
      } else {

         // Setze das angeklickte Element, oder entferne die Auswahl, wenn kein Element angeklickt wurde
         this.selectedNode = findLastGraphNode(this.ctx, this.graphNodes, x, y);
         const selectedNodeIndex = this.graphNodes.lastIndexOf(this.selectedNode);
         // Packe das ausgewählte Element ans Ende des Arrays, damit es über den anderen Elementen erscheint
         if (this.selectedNode && !this.isDragging) {
            this.graphNodes.splice(selectedNodeIndex, 1);
            this.graphNodes.push(this.selectedNode);
         }

         this.updateAnchorListeners();

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

   private handleDoubleClick(event: MouseEvent) {
      const { x, y } = this.getMouseCoordinates(event);
      const clickedNodeIndex = findGraphNodeLastIndex(this.ctx, this.graphNodes, x, y);
      const selectedArrowIndex = this.arrows.findIndex((arrow) => isArrowClicked(x, y, arrow.points));

      if (clickedNodeIndex !== -1 && this.graphNodes[clickedNodeIndex].node !== 'connector') {
         handleGraphNodeDoubleClick( clickedNodeIndex, (type, index) => this.showPrompt(type, index));
      } else if (selectedArrowIndex !== -1) {
         handleArrowDoubleClick( selectedArrowIndex, (type, index) => this.showPrompt(type, index));
      }
   }

   private handleAnchorClick(node: GraphNode, anchor: number) {
      this.isDrawingArrow = true;
      this.arrowStart = { node, anchor };
   }

   private updateAnchorListeners() {
      if (this.selectedNode && this.selectedNode.node !== 'text') {
         const anchors = getAnchors(this.ctx, this.selectedNode, 15);

         anchors.forEach((position, index) => {
            this.canvas?.addEventListener('mousedown', (event) => {
               const { x, y } = this.getMouseCoordinates(event);
               const distance = Math.sqrt((position.x - x) ** 2 + (position.y - y) ** 2);
               if (distance <= 8) {
                  this.handleAnchorClick(this.selectedNode, index);
               }
            });
         });
      }
   }

   // ------------------------ Lifecycle ------------------------

   firstUpdated() {
      this.canvas = this.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
      this.updateCanvasOffset(); // Offset aktualisieren

      // Fügen Sie standardmäßige Hilfeinformationen hinzu
      helpPresets.forEach((item) => {
         this.helpList.push(item);
         addHelp(this, this.helpList);
      });
      console.log(helpPresets);
      console.log(this.helpList);
   }

   connectedCallback() {
      super.connectedCallback();
      window.addEventListener('resize', this.updateCanvasSize);
   }

   disconnectedCallback() {
      window.removeEventListener('resize', this.updateCanvasSize);
      super.disconnectedCallback();
   }

   updated(changedProperties: Map<string, any>) {
      if (changedProperties.has('editable')) {
         updateDisabledState(this, this.editable);
      }
   }

   // ------------------------ Allgemeine Systemfunktionen ------------------------

   // Passt die Canvasgröße an die aktuelle Größe des Fenster an
   updateCanvasSize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.redrawCanvas();
   };

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
      if (this.selectedNode) {
         // Entferne ausgewählten Knoten
         this.graphNodes = this.graphNodes.filter((node) => node !== this.selectedNode);

         // Entferne die Verbindungsinformationen für alle betroffenen Knoten
         this.arrows.forEach(arrow => {
            if (arrow.from === this.selectedNode || arrow.to === this.selectedNode) {
               removeOldConnection(arrow.from, arrow.to);
            }
         });

         // Entferne alle Pfeile, die mit dem gelöschten Element verbunden sind
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
      const offsetX = this.canvas.getBoundingClientRect().left;
      const offsetY = this.canvas.getBoundingClientRect().top;
      const x = event.clientX - offsetX;
      const y = event.clientY - offsetY;
      return { x, y };
   }

   private handleScroll(event: Event) {
      this.updateCanvasOffset();
   }

   private updateCanvasOffset() {
      const offsetX = this.canvas.getBoundingClientRect().left;
      const offsetY = this.canvas.getBoundingClientRect().top;
      this.style.setProperty('--offset-x', `${offsetX}px`);
      this.style.setProperty('--offset-y', `${offsetY}px`);
   }

   // ------------------------ Prompt Funktionen ------------------------

   private showPrompt(type: 'node' | 'arrow', index: number) {
      this.shadowRoot.querySelector('custom-prompt').classList.remove('hidden');

      const onSubmit = (value: string) => {
         if (type === 'node') {
            this.graphNodes[index].text = value;
         } else {
            this.arrows[index].text = value;
         }
         this.redrawCanvas();
         this.shadowRoot.querySelector('custom-prompt').classList.add('hidden');
      };

      const onCancel = () => {
         this.shadowRoot.querySelector('custom-prompt').classList.add('hidden');
      };

      (this.shadowRoot.querySelector('custom-prompt') as CustomPrompt).onSubmit = onSubmit;
      (this.shadowRoot.querySelector('custom-prompt') as CustomPrompt).onCancel = onCancel;
   }

   private hidePrompt() {
      const prompt = this.shadowRoot.querySelector('custom-prompt');
      if (prompt) {
         prompt.classList.add('hidden');
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


}

/*
TODO Liste

Einstellungsmenü:
- Schriftarten ändern
- Colortheme ändern

Hilfsmenü:
- UI überarbeiten

SelectionMode:
- performance verbessern
- abgleichen mit Musterlösung
- Wiederholende Zahlen sollen nebeneinander angezeigt werden

Weitere Funktionen:
- Select All, verschieben mehrere Elemente durch drag and drop

UI:
- Größe der Elemente einheitlich gestalten
- Verbindungen sollen locken in einem radius von 5px 

*/