import { LitElementWw } from '@webwriter/lit'
import { html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { GraphNodeData, Arrow, ItemList } from './src/definitions'
import { drawButtonElement, drawGraphElement, drawElementAnchors, drawArrow } from './src/drawer'
import { toggleMenu, addTask, grabCanvas } from './src/ui'
import { getAnchors, getArrowInformation, getNearestCircle, highlightAnchor, isArrowClicked, removeOldConnection, findLastGraphElement, findGraphElementLastIndex } from './src/helper'

import { papWidgetStyles } from './src/styles'


@customElement('pap-widget')
export class PAPWidget extends LitElementWw {
   @property({ type: Array }) graphElements: GraphNodeData[] = [];
   @property({ type: Object }) selectedElement?: GraphNodeData;
   @property({ type: Array }) arrows: Arrow[] = [];
   @property({ type: Object }) selectedArrow?: Arrow;

   @property({ type: Array }) taskList: ItemList[] = [];
   @property({ type: Array }) helpList: ItemList[] = [];
 
   private canvas: HTMLCanvasElement;
   private ctx: CanvasRenderingContext2D;

   private isDragging = false;
   private draggedElement: GraphNodeData;
   private dragOffset = { x: 0, y: 0 };

   private isDrawingArrow = false;
   private arrowStart?: { element: GraphNodeData; anchor: number };
   private tempArrowEnd?: { x: number; y: number };

   private isGrabbing = false;
   private grabStartPosition?: { x: number; y: number };
   private grabStartOffset?: { x: number; y: number };

   private hoveredAnchor?: { element: GraphNodeData; anchor: number };
   private hoveredArrowAnchor: boolean;

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
            <button @click='${() => this.addGraphElement('start', 'Start')}'>
               ${drawButtonElement('start', 'flow')}
            </button>
            <button @click='${() => this.addGraphElement('op', 'Operation')}'>
               ${drawButtonElement('op', 'flow')}
            </button>
            <button @click='${() => this.addGraphElement('decision', 'Verzweigung')}'>
               ${drawButtonElement('decision', 'flow')}
            </button>
            <button @click='${() => this.addGraphElement('connector', '')}'>
               ${drawButtonElement('connector', 'flow')}
            </button>
            <button @click='${() => this.addGraphElement('i/o', 'Ein-/Ausgabe')}'>
               ${drawButtonElement('i/o', 'flow')}
            </button>
            <button @click='${() => this.addGraphElement('sub', 'Unterprogramm')}'>
               ${drawButtonElement('sub', 'flow')}
            </button>
            <button @click='${() => this.addGraphElement('end', 'Ende')}'>
               ${drawButtonElement('end', 'flow')} 
            </button>
            <button @click='${() => this.addGraphElement('text', 'Text')}'>
               ${drawButtonElement('text', 'flow')}
            </button>
         </div>

         <button class="show-flowchart-button hidden" @click='${() => this.toggleMenu('flow')}'>
            +
         </button>

         <div class='tool-menu'>
            <button id="grab-button" @click='${this.grabCanvas}'>
               ${drawButtonElement('grab', 'tool')}
            </button>
            <button @click='${() => this.clearAll()}'>
               ${drawButtonElement('delete', 'tool')}
            </button>
            <button @click='${() => this.toggleMenu('task')}'>
               ${drawButtonElement('task', 'tool')}
            </button>
            <button @click='${() => this.toggleMenu('help')}'>
               ${drawButtonElement('help', 'tool')}
            </button>
         </div>

         <div class='task-menu'>
            <button class='close-button' @click='${() => this.toggleMenu('task')}'>
               ×
            </button>
            <div class='task-menu-wrapper'>
               <div class="task-container"></div>
               <button class="add-task-button editMode" @click='${this.addTask}'>
                  ${drawButtonElement('addTask', 'task')}
               </button>
            </div>   
         </div> 

         <div class='help-menu hidden'>
            <button class='close-button' @click='${() => this.toggleMenu('help')}'>
               ×
            </button>
            <div class="help-container"></div>
               <button class="add-help-button editMode" @click='${this.addTask}'>
                  ${drawButtonElement('addTask', 'task')}
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

   // Zeige oder verstecke die angefragten Benutzeroberflächen 
   private toggleMenu(menu: 'task' | 'flow' | 'context' | 'help') {
      toggleMenu (this, menu);
    }

    // Zeige das Kontextmenü an, wenn ein Element angeklickt wurde
   private showContextMenu(event: MouseEvent) {
      const {x, y} = this.getMouseCoordinates(event);

      // Finde den angeklickten Knoten oder Verbindung und speichere sie
      const clickedElement = findLastGraphElement(this.ctx, this.graphElements, x, y);
      const clickedArrowIndex = this.arrows.findIndex((arrow) => isArrowClicked(x, y, arrow.points));

      // Falls ein Element angeklickt wurde, wird das Kontextmenü angezeigt
      if (clickedElement || clickedArrowIndex !== -1) {
         const contextMenu = this.shadowRoot.getElementById('context-menu');
         if (contextMenu) {
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${event.clientX}px`;
            contextMenu.style.top = `${event.clientY}px`;

            if (clickedElement) {
               this.selectedElement = clickedElement;
               this.selectedArrow = undefined;
            } else {
               this.selectedArrow = this.arrows[clickedArrowIndex];
               this.selectedElement = undefined;
            }
         }
      }
   }

    private addTask() {
      addTask(this, this.taskList);
   }

   // Aktiviere Bewegungsmodus für das Canvas
   private grabCanvas(){
      this.isGrabbing = grabCanvas(this, this.isGrabbing);
   }

   // ------------------------ Drawer Funktionen ------------------------

   private redrawCanvas() {
      // Bereinige das Canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Zeichne alle Knoten 
      this.graphElements.forEach((element) => {
         drawGraphElement(this.ctx, element, this.selectedElement);
      });

      // Zeichne alle Verbindungen 
      this.arrows.forEach((arrow) => {
         const fromCoordination = getArrowInformation(this.ctx, arrow.from, arrow.to);
         const toCoordination = getArrowInformation(this.ctx, arrow.to, arrow.from);
         const updatedArrowPoints = drawArrow(this.ctx, fromCoordination, toCoordination, arrow.isSelected, this.hoveredArrowAnchor, true);
         arrow.points = updatedArrowPoints;
         if (this.selectedArrow === arrow) {
            arrow.isSelected = true;
         } else {
            arrow.isSelected = false;
         }
      });

      // Zeichne die Ankerpunkte für das ausgewählte Element, falls vorhanden
      if (this.selectedElement) {
         drawElementAnchors(this.ctx, this.selectedElement, this.hoveredAnchor);
      }

      //Zeichne eine temporäre Verbindung beim ziehen zwischen zwei Elementen, falls vorhanden
      if (this.isDrawingArrow && this.arrowStart && this.tempArrowEnd) {
         const anchors = getAnchors(this.ctx, this.arrowStart.element);
         drawArrow(this.ctx, anchors[this.arrowStart.anchor], this.tempArrowEnd);
      }
   }

   private addGraphElement(node: 'start' | 'end' | 'op' | 'decision' | 'connector' | 'i/o' | 'sub' | 'text', text: string) {
      const workspace = this.shadowRoot?.querySelector('.workspace') as HTMLElement;
      const centerX = this.canvas.width * 0.5 + workspace.scrollLeft;
      const centerY = this.canvas.height * 0.5 + workspace.scrollTop;

      const element: GraphNodeData = {
         node: node,
         text: text,
         x: centerX,
         y: centerY 
      };

      this.graphElements = [...this.graphElements, element];
      drawGraphElement(this.ctx, element, this.selectedElement);
   }

   

   // ------------------------ Mouse-Events ------------------------

   private handleMouseDown(event: MouseEvent) {
      const {x, y} = this.getMouseCoordinates(event);

      if (this.isGrabbing) {
         this.grabStartPosition = { x, y };
         const offsetX = parseFloat(this.style.getPropertyValue('--offset-x'));
         const offsetY = parseFloat(this.style.getPropertyValue('--offset-y'));
         this.grabStartOffset = { x: offsetX, y: offsetY };
      } else {
         this.draggedElement = findLastGraphElement(this.ctx, this.graphElements, x, y);
         
         if (this.draggedElement && !this.selectedArrow) {
            this.isDragging = true;
            this.dragOffset = { x: x - this.draggedElement.x, y: y - this.draggedElement.y };
         }

         if (this.selectedArrow) {
            const { points } = this.selectedArrow;

            const isWithinCircle = (x: number, y: number, circleX: number, circleY: number, radius: number) =>
               Math.sqrt(Math.pow(x - circleX, 2) + Math.pow(y - circleY, 2)) <= radius;

            // Überprüfe ob einer der Ankerpunkte berührt wurde, wenn ja setze die Variablen zum ziehen.
            //if (isWithinCircle(x, y, points[0].x, points[0].y, 5) || isWithinCircle(x, y, points[points.length - 1].x, points[points.length - 1].y, 5)) {
            if (isWithinCircle(x, y, points[points.length - 1].x, points[points.length - 1].y, 5)) {
               let tempElement: GraphNodeData;
               let tempAnchor: number;
               const nearestElement = findLastGraphElement(this.ctx, this.graphElements, x, y);

               // Bestimme das Startelement von dem der temporäre Pfeil gesetzt werden soll
               if (nearestElement) {
                  // Auskommentierten Code sind für den Fall das an beiden Start- und Endpositionen der Pfeil verschoben werden kann
                  //nearestElement === this.selectedArrow.from ? tempElement = this.selectedArrow.to : tempElement = this.selectedArrow.from
                  tempElement = this.selectedArrow.from;
                  for (let i = 0; i < tempElement.connections.length; i++) {
                     if (tempElement.connections[i].connectedTo === nearestElement) { tempAnchor = tempElement.connections[i].anchor }
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
            const {x, y} = this.getMouseCoordinates(event);

            const targetElement = findLastGraphElement(this.ctx, this.graphElements, x, y);

            // Überprüft ob ein Zielelement gefunden wurde und dieser ungleich dem Startelement
            if (this.arrowStart && targetElement && (this.arrowStart.element !== targetElement) && (targetElement.node !== 'text')) {

               // Speichere die Pfeilverbindung am Startelement
               if (!this.arrowStart.element.connections) {
                  this.arrowStart.element.connections = [];
               }
               this.arrowStart.element.connections.push({ anchor: this.arrowStart.anchor, connectedTo: targetElement });

               // Speichere die Pfeilverbindung am Ziel-Element
               if (!targetElement.connections) {
                  targetElement.connections = [];
               }
               const nearestCircleIndex = getNearestCircle(this.ctx, { x, y }, targetElement);
               targetElement.connections.push({ anchor: nearestCircleIndex, connectedTo: this.arrowStart.element });

               // Hole die Eckpunkte zum Zeichnen des Pfeils, um sie im arrows-Array abzuspeichern
               const fromCoordination = getArrowInformation(this.ctx, this.arrowStart.element, targetElement);
               const toCoordination = getArrowInformation(this.ctx, targetElement, this.arrowStart.element);
               const points = drawArrow(this.ctx, fromCoordination, toCoordination, false, true);
               this.arrows.push({ from: this.arrowStart.element, to: targetElement, points });
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
      this.graphElements.forEach(element => {
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
         if (this.isDragging && this.draggedElement) {
      
            this.draggedElement.x = x - this.dragOffset.x;
            this.draggedElement.y = y - this.dragOffset.y;

            this.redrawCanvas();
         } else if (this.isDrawingArrow && this.arrowStart && (this.selectedElement || this.selectedArrow)) {
            const {x, y} = this.getMouseCoordinates(event);

            this.tempArrowEnd = { x, y };

            this.redrawCanvas();
         }
      }

      // Highlighte den Ankerpunkt, falls der Benutzer über diesen kommt
      const { hoveredAnchor, hoveredArrowAnchor } = highlightAnchor( this.ctx, this.selectedElement, this.selectedArrow, x, y );
      this.hoveredAnchor = hoveredAnchor;
      this.hoveredArrowAnchor = hoveredArrowAnchor;
      this.redrawCanvas();
   }

   private handleClick(event: MouseEvent) {
      const {x, y} = this.getMouseCoordinates(event);

      // Setze das angeklickte Element, oder entferne die Auswahl, wenn kein Element angeklickt wurde
      this.selectedElement = findLastGraphElement(this.ctx, this.graphElements, x, y);
      const selectedElementIndex = this.graphElements.lastIndexOf(this.selectedElement);
      // Packe das ausgewählte Element ans Ende des Arrays, damit es über den anderen Elementen erscheint
      if (this.selectedElement && !this.isDragging) {
         this.graphElements.splice(selectedElementIndex, 1);
         this.graphElements.push(this.selectedElement);
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

   private handleDoubleClick(event: MouseEvent) {
      const {x, y} = this.getMouseCoordinates(event);

      // Ermittle, ob das Doppelklick-Event auf einem der Rechtecke stattgefunden hat
      const clickedElementIndex = findGraphElementLastIndex(this.ctx, this.graphElements, x, y);

      if (clickedElementIndex !== -1 && this.graphElements[clickedElementIndex].node !== 'connector') {
         // Fordere den Benutzer auf, neuen Text einzugeben
         const newText = prompt('Bitte geben Sie den neuen Text ein:');

         if (newText !== null) {
            // Ersetze den Text des Elements
            this.graphElements[clickedElementIndex].text = newText;

            // Zeichne das Canvas neu, um die Änderungen anzuzeigen
            this.redrawCanvas();
         }
      }
   }

   private handleAnchorClick(event: MouseEvent, element: GraphNodeData, anchor: number) {
      event.stopPropagation();
      this.isDrawingArrow = true;
      this.arrowStart = { element, anchor };
   }

   private updateAnchorListeners() {
      if (this.selectedElement && this.selectedElement.node !== 'text') {
         const anchors = getAnchors(this.ctx, this.selectedElement, 15);
   
         anchors.forEach((position, index) => {
            this.canvas?.addEventListener('mousedown', (event) => {
               const {x, y} = this.getMouseCoordinates(event);
               const distance = Math.sqrt((position.x - x) ** 2 + (position.y - y) ** 2);
               if (distance <= 8) {
                  this.handleAnchorClick(event, this.selectedElement, index);
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
   }

   connectedCallback() {
      super.connectedCallback();
      window.addEventListener('resize', this.updateCanvasSize);
   }

   disconnectedCallback() {
      window.removeEventListener('resize', this.updateCanvasSize);
      super.disconnectedCallback();
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
      this.graphElements = [];
      this.selectedElement = undefined;
      this.arrows = [];
      this.arrowStart = undefined;
      this.redrawCanvas();
   }

   // Lösche das ausgewählte Objekt 
   private deleteSelectedObject() {
      // Falls ein Knoten ausgewählt wurde, lösche den Knoten und alle zugehören Verbindungen 
      if (this.selectedElement) {
         // Entferne ausgewählten Knoten
         this.graphElements = this.graphElements.filter((element) => element !== this.selectedElement);

         // Entferne die Verbindungsinformationen für alle betroffenen Knoten
         this.arrows.forEach(arrow => {
            if (arrow.from === this.selectedElement || arrow.to === this.selectedElement) {
               removeOldConnection(arrow.from, arrow.to);
            }
         });

         // Entferne alle Pfeile, die mit dem gelöschten Element verbunden sind
         this.arrows = this.arrows.filter(
            (arrow) => arrow.from !== this.selectedElement && arrow.to !== this.selectedElement
         );

         this.selectedElement = undefined;
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
      return {x, y};
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