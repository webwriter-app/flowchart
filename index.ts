import { LitElementWw } from '@webwriter/lit'
import { html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { v4 as uuidv4 } from 'uuid';

import { GraphNode } from './src/domain/GraphNode';
import { Arrow } from './src/domain/Arrow';
import { ItemList } from './src/domain/ItemList';

import { drawButton } from './src/modules/drawer/drawButton';
import { drawGraphNode } from './src/modules/drawer/drawGraphNode';
import { drawNodeAnchors } from './src/modules/drawer/drawNodeAnchors';
import { drawArrow } from './src/modules/drawer/drawArrow';

import { handleSequenceSelection } from './src/modules/handler/handleSequenceSelection';

import { toggleMenu, addTask, addHelp, updateDisabledState, grabCanvas } from './src/ui'

import { removeOldConnection, findLastGraphNode, findGraphNodeLastIndex } from './src/modules/helper/generalHelper'
import { getArrowInformation, isArrowClicked } from './src/modules/helper/arrowHelper';
import { getAnchors, getNearestCircle, highlightAnchor } from './src/modules/helper/anchorHelper';
import { createArrowsFromGraphNodes, updatePresetIds } from './src/modules/helper/presetHelper';

import { flowchartPresets } from './src/modules/presets/flowchartPresets';
import { helpPresets } from './src/modules/presets/helpPresets';

import { papWidgetStyles } from './src/modules/styles/styles'


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
   private hoveredArrowAnchor: boolean;

   private isSelectingSequence = false;
   private selectedSequence: { id: string; order: number; type: string}[] = [];

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
            <button id='grab-button' @click='${this.grabCanvas}'>
               ${drawButton('grab', 'tool')}
            </button>
            <button id='select-button' @click='${this.selectSequence}'>
               ${drawButton('select', 'tool')}
            </button>
            <button @click='${() => this.clearAll()}'>
               ${drawButton('delete', 'tool')}
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

         <div class='task-menu'>
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

         <div id='context-menu' class='context-menu'>
            <div class='context-menu-item' @click='${() => this.deleteSelectedObject()}'>
               Löschen
            </div>
         </div>

      </div>
    `;
   }

   // ------------------------ User interface Funktionen ------------------------

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
   private toggleMenu(menu: 'task' | 'flow' | 'context' | 'preset' | 'help') {
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
         const fromCoordination = getArrowInformation(this.ctx, arrow.from, arrow.to);
         const toCoordination = getArrowInformation(this.ctx, arrow.to, arrow.from);
         const updatedArrowPoints = drawArrow(this.ctx, fromCoordination, toCoordination, this.selectedSequence, arrow.isSelected, this.hoveredArrowAnchor, true, arrow.text);
         arrow.points = updatedArrowPoints;
         if (this.selectedArrow === arrow) {
            arrow.isSelected = true;
         } else {
            arrow.isSelected = false;
         }
      });

      // Zeichne die Ankerpunkte für das ausgewählte Element, falls vorhanden
      if (this.selectedNode) {
         drawNodeAnchors(this.ctx, this.selectedNode, this.hoveredAnchor);
      }

      //Zeichne eine temporäre Verbindung beim ziehen zwischen zwei Elementen, falls vorhanden
      if (this.isDrawingArrow && this.arrowStart && this.tempArrowEnd) {
         const anchors = getAnchors(this.ctx, this.arrowStart.node);
         drawArrow(this.ctx, anchors[this.arrowStart.anchor], this.tempArrowEnd);
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
         this.grabStartPosition = { x, y };
         const offsetX = parseFloat(this.style.getPropertyValue('--offset-x'));
         const offsetY = parseFloat(this.style.getPropertyValue('--offset-y'));
         this.grabStartOffset = { x: offsetX, y: offsetY };
      } else {
         this.draggedNode = findLastGraphNode(this.ctx, this.graphNodes, x, y);

         if (this.draggedNode && !this.selectedArrow) {
            this.isDragging = true;
            this.dragOffset = { x: x - this.draggedNode.x, y: y - this.draggedNode.y };
         }

         if (this.selectedArrow) {
            const { points } = this.selectedArrow;

            const isWithinCircle = (x: number, y: number, circleX: number, circleY: number, radius: number) =>
               Math.sqrt(Math.pow(x - circleX, 2) + Math.pow(y - circleY, 2)) <= radius;

            // Überprüfe ob einer der Ankerpunkte berührt wurde, wenn ja setze die Variablen zum ziehen.
            //if (isWithinCircle(x, y, points[0].x, points[0].y, 5) || isWithinCircle(x, y, points[points.length - 1].x, points[points.length - 1].y, 5)) {
            if (isWithinCircle(x, y, points[points.length - 1].x, points[points.length - 1].y, 5)) {
               let tempElement: GraphNode;
               let tempAnchor: number;
               const nearestElement = findLastGraphNode(this.ctx, this.graphNodes, x, y);

               // Bestimme das Startelement von dem der temporäre Pfeil gesetzt werden soll
               if (nearestElement) {
                  // Auskommentierten Code sind für den Fall das an beiden Start- und Endpositionen der Pfeil verschoben werden kann
                  //nearestElement === this.selectedArrow.from ? tempElement = this.selectedArrow.to : tempElement = this.selectedArrow.from
                  tempElement = this.selectedArrow.from;
                  for (let i = 0; i < tempElement.connections.length; i++) {
                     if (tempElement.connections[i].connectedToId === nearestElement.id) { tempAnchor = tempElement.connections[i].anchor }
                  }

                  // Rufe handleAnchorClick auf um einen temporären Pfeil zu zeichnen.
                  this.handleAnchorClick(event, tempElement, tempAnchor);

                  // Lösche die alten Verbindungsinformationen innerhalb der Knoten und die Verbindung
                  removeOldConnection(this.selectedArrow.from, this.selectedArrow.to);
                  // Entferne den alte Verbindung 
                  this.arrows = this.arrows.filter((arrow) => arrow.from !== this.selectedArrow.from || arrow.to !== this.selectedArrow.to);
               }

            }
         }
      }
   }

   private handleMouseUp(event: MouseEvent) {
      if (this.isGrabbing && this.grabStartPosition) {
         this.grabStartPosition = undefined;
         this.grabStartOffset = undefined;
      } else {
         if (this.isDragging) {
            // Element loslassen nach dem ziehen
            this.isDragging = false;
         } else if (this.isDrawingArrow) {
            const { x, y } = this.getMouseCoordinates(event);

            const targetElement = findLastGraphNode(this.ctx, this.graphNodes, x, y);

            // Überprüft ob ein Zielelement gefunden wurde und dieser ungleich dem Startelement
            if (this.arrowStart && targetElement && (this.arrowStart.node !== targetElement) && (targetElement.node !== 'text')) {

               // Speichere die Pfeilverbindung am Startelement
               if (!this.arrowStart.node.connections) {
                  this.arrowStart.node.connections = [];
               }
               this.arrowStart.node.connections.push({ anchor: this.arrowStart.anchor, direction: 'to', connectedToId: targetElement.id });

               // Speichere die Pfeilverbindung am Ziel-Element
               if (!targetElement.connections) {
                  targetElement.connections = [];
               }
               const nearestCircleIndex = getNearestCircle(this.ctx, { x, y }, targetElement);
               targetElement.connections.push({ anchor: nearestCircleIndex, direction: 'from', connectedToId: this.arrowStart.node.id });

               // Hole die Eckpunkte zum Zeichnen des Pfeils, um sie im arrows-Array abzuspeichern
               const fromCoordination = getArrowInformation(this.ctx, this.arrowStart.node, targetElement);
               const toCoordination = getArrowInformation(this.ctx, targetElement, this.arrowStart.node);
               const points = drawArrow(this.ctx, fromCoordination, toCoordination, this.selectedSequence, false, true);
               this.arrows.push({ id: uuidv4(), from: this.arrowStart.node, to: targetElement, points });
               this.redrawCanvas();
            }

            this.isDrawingArrow = false;
         }

         // Resete die Informationen
         this.tempArrowEnd = undefined;
         this.arrowStart = undefined;
         //this.selectedArrow = undefined;
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
      const { hoveredAnchor, hoveredArrowAnchor } = highlightAnchor(this.ctx, this.selectedNode, this.selectedArrow, x, y);
      this.hoveredAnchor = hoveredAnchor;
      this.hoveredArrowAnchor = hoveredArrowAnchor;
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
            this.selectedArrow.isSelected = true;
            this.arrows.splice(selectedArrowIndex, 1);
            this.arrows.push(this.selectedArrow);
            this.redrawCanvas();
         } else if (this.selectedArrow) {
            this.selectedArrow.isSelected = false;
            this.selectedArrow = undefined;
            this.redrawCanvas();
         }

         // Zeichne den Canvas neu, um die aktualisierte Auswahl anzuzeigen
         this.redrawCanvas();

      }
   }

   private handleDoubleClick(event: MouseEvent) {
      const { x, y } = this.getMouseCoordinates(event);

      // Ermittle, ob das Doppelklick-Event auf einem der Rechtecke stattgefunden hat
      const clickedNodeIndex = findGraphNodeLastIndex(this.ctx, this.graphNodes, x, y);

      if (clickedNodeIndex !== -1 && this.graphNodes[clickedNodeIndex].node !== 'connector') {
         // Fordere den Benutzer auf, einen neuen Text einzugeben
         const newText = prompt('Bitte geben einen neuen Text ein:');

         if (newText !== null) {
            // Ersetze den Text des Elements
            this.graphNodes[clickedNodeIndex].text = newText;

            // Zeichne das Canvas neu, um die Änderungen anzuzeigen
            this.redrawCanvas();
         }
      } 

      const selectedArrowIndex = this.arrows.findIndex((arrow) => isArrowClicked(x, y, arrow.points));
      if (selectedArrowIndex !== -1) {
         this.selectedArrow = this.arrows[selectedArrowIndex];

         // Fordere den Benutzer auf, einen neuen Text für den Pfeil einzugeben
         const newText = prompt('Bitte gebe einen  neuen Text für den Pfeil ein:');
     
         if (newText !== null) {
           // Ersetze den Text des Pfeils
           this.selectedArrow.text = newText;
           this.arrows.splice(selectedArrowIndex, 1);
           this.arrows.push(this.selectedArrow);

           this.redrawCanvas();
         }
      }
   }

   private handleAnchorClick(event: MouseEvent, node: GraphNode, anchor: number) {
      event.stopPropagation();
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
                  this.handleAnchorClick(event, this.selectedNode, index);
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

}

/*
TODO Liste

Funktionalitäten des PAP
- Text ändern: Textarea vs prompt()? 
-> eigenes Promt erstellen. Textarea sieht nicht gut aus, kein svg
- Schriftarten ändern
- Select All, verschieben mehrere Elemente durch drag and drop
- Feedback Option 
   - Erklärung der Aktionen
   - Eigene Feedbackmöglichkeit für Lehrkräfte 

*/