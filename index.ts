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
import { drawSelectionField } from './src/modules/drawer/drawSelectionField';

import { handleNodeDragStart, handleArrowDragStart, handleMultipleNodesDragStart } from './src/modules/handler/mouseDownHandler';
import { handleGrabRelease, handleNodeDragStop, handleArrowCreation } from './src/modules/handler/mouseUpHandler';
import { handleSequenceSelection } from './src/modules/handler/handleSequenceSelection';
import { handleGraphNodeDoubleClick, handleArrowDoubleClick } from './src/modules/handler/doubleClickHandler';

import { toggleMenu } from './src/modules/ui/toggleMenu';
import { addHelp } from './src/modules/ui/helpMenu';
import { addTask } from './src/modules/ui/taskMenu';
import { createTooltip, removeTooltip, updateDisabledState, grabCanvas, autoDeleteEmptyItems } from './src/modules/ui/generalUI'

import { snapNodePosition, removeOldConnection, findLastGraphNode, findGraphNodeLastIndex } from './src/modules/helper/utilities'
import { isArrowClicked } from './src/modules/helper/arrowHelper';
import { getAnchors, highlightAnchor } from './src/modules/helper/anchorHelper';
import { createArrowsFromGraphNodes, updatePresetIds } from './src/modules/helper/presetHelper';

import { flowchartPresets } from './src/modules/presets/flowchartPresets';
import { helpPresets } from './src/modules/presets/helpPresets';

import { papWidgetStyles } from './src/modules/styles/styles'

import { CustomPrompt } from './src/components/custom-prompt';
import './src/components/custom-prompt'
import { ConfirmPrompt } from './src/components/confirm-prompt';
import './src/components/confirm-prompt'



@customElement('ww-flowchart')
export class PAPWidget extends LitElementWw {
   @property({ type: Array }) graphNodes: GraphNode[] = [];
   @property({ type: Object }) selectedNode?: GraphNode;
   @property({ type: Array }) arrows: Arrow[] = [];
   @property({ type: Object }) selectedArrow?: Arrow;

   @property({ type: Array }) taskList: ItemList[] = [];
   @property({ type: Array }) helpList: ItemList[] = [];

   @property({ type: Array }) presetList: { name: string, graphNodes: GraphNode[] }[] = flowchartPresets;

   @property({ type: Object }) graphSettings = { font: 'Courier New', fontSize: 16, theme: 'standard' };


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

   private isSelectingSequence = false;
   private selectedSequence: { id: string; order: number; type: string }[] = [];

   private promptType: 'node' | 'arrow' | null;
   private promptIndex: number | null;

   @property({ type: Array }) selectedNodes: GraphNode[] = [];
   private selectionRectangle?: { x: number, y: number, width: number, height: number };
   private checkOffset = true;

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
            <button @click='${() => this.addGraphNode('decision', '  Verzweigung  ')}'>
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
            <button 
               @mouseenter='${(e) => createTooltip(e, 'Lösche alles')}'
               @mouseleave='${removeTooltip}'
               @click='${this.showConfirmPrompt}'>
               ${drawButton('delete', 'tool')}
            </button>
            <button id='grab-button' 
               @mouseenter='${(e) => createTooltip(e, 'Bewegen des Canvas')}'
               @mouseleave='${removeTooltip}'
               @click='${this.grabCanvas}'>
               ${drawButton('grab', 'tool')}
            </button>
            <button id='select-button' 
               @mouseenter='${(e) => createTooltip(e, 'Auswahlmodus')}'
               @mouseleave='${removeTooltip}'
               @click='${this.selectSequence}'>
               ${drawButton('select', 'tool')}
            </button>
            <button 
               @mouseenter='${(e) => createTooltip(e, 'Übersetzungsmenü')}'
               @mouseleave='${removeTooltip}'
               @click='${() => this.toggleMenu('translate')}'>
               ${drawButton('translate', 'tool')}
            </button>
            <button 
               @mouseenter='${(e) => createTooltip(e, 'Aufgabenmenü')}'
               @mouseleave='${removeTooltip}'
               @click='${() => this.toggleMenu('task')}'>
               ${drawButton('task', 'tool')}
            </button>
            <button 
               @mouseenter='${(e) => createTooltip(e, 'Vorgefertigte Beispiele')}'
               @mouseleave='${removeTooltip}'
               @click='${() => this.toggleMenu('preset')}'>
               ${drawButton('preset', 'tool')}
            </button>
            <button 
               @mouseenter='${(e) => createTooltip(e, 'Hilfe')}'
               @mouseleave='${removeTooltip}'
               @click='${() => this.toggleMenu('help')}'>
               ${drawButton('help', 'tool')}
            </button>
            <button 
               @mouseenter='${(e) => createTooltip(e, 'Einstellungen')}'
               @mouseleave='${removeTooltip}'
               @click='${() => this.toggleMenu('setting')}'>
               ${drawButton('setting', 'tool')}
            </button>
         </div>

         <div class='task-menu hidden'>
            <button class='close-button' @click='${() => this.toggleMenu('task')}'>
               ×
            </button>
            <div class='task-menu-wrapper'>
            ${this.taskList.length === 0 && this.editable
            ? html`<p class="no-tasks-message">Keine Aufgaben!</p>`
            : html`<div class="task-container"></div>`}
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

         <div class='setting-menu hidden'>
            <button class='close-button' @click='${() => this.toggleMenu('setting')}'>
               ×
            </button>
            <div class="setting-menu-container">
               <div class="setting-item">
                  <label>Schriftart:</label>
                  <select id="font-selector">
                     <option value="Arial">Arial</option>
                     <option value="Verdana">Verdana</option>
                     <option value="Times New Roman">Times New Roman</option>
                     <option value="Courier New" selected>Courier New</option>
                  </select>
               </div>
               <div class="setting-item">
                  <label>Schriftgröße:</label>
                  <select id="font-size-selector">
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
                  <select id="color-theme-selector">
                     <option value="standard" selected>Standard</option>
                     <option value="pastel">Pastel</option>
                     <option value="mono">Mono</option>
                  </select>
               </div>
            </div>
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

         <confirm-prompt
            label="Sind Sie sicher, dass Sie alles löschen möchten?"
            .onConfirm="${this.clearAll}"
            .onCancel="${this.hidePrompt}"
            class="hidden"
         ></confirm-prompt>

      </div>
    `;
   }

   // ------------------------ User interface Funktionen ------------------------

   private getUserSettings() {
      const fontSelector = this.shadowRoot?.querySelector('#font-selector') as HTMLSelectElement;
      const fontSizeSelector = this.shadowRoot?.querySelector('#font-size-selector') as HTMLSelectElement;
      const themeSelector = this.shadowRoot?.querySelector('#color-theme-selector') as HTMLSelectElement;

      this.graphSettings.font = fontSelector.value;
      this.graphSettings.fontSize = parseInt(fontSizeSelector.value);
      this.graphSettings.theme = themeSelector.value;
   }


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
      // Deaktive alles ausgewählten Graphelemente
      this.selectedNode = undefined;
      this.selectedArrow = undefined;
      this.selectionRectangle = undefined;

      this.redrawCanvas();
   }

   // Zeige oder verstecke die angefragten Benutzeroberflächen 
   private toggleMenu(menu: 'task' | 'flow' | 'context' | 'preset' | 'help' | 'translate' | 'setting') {
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
      console.log(this.graphNodes);
   }

   // ------------------------ Drawer Funktionen ------------------------

   private redrawCanvas() {
      // Bereinige das Canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.getUserSettings();

      // Zeichne alle Verbindungen
      this.arrows.forEach((arrow) => {
         const isSelected = arrow === this.selectedArrow;
         arrow.points = generateArrowPoints(this.ctx, arrow);
         drawArrow(this.ctx, arrow, this.graphSettings, isSelected, this.selectedSequence);
      });

      // Zeichne alle Knoten 
      this.graphNodes.forEach((element) => {
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
      this.setAttribute('graph-nodes', JSON.stringify(this.graphNodes));
   }

   // Speichere die Position für den nächsten Knoten
   private addGraphNodeIndex = 0;

   private addGraphNode(node: 'start' | 'end' | 'op' | 'decision' | 'connector' | 'i/o' | 'sub' | 'text', text: string) {
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
      };

      const element: GraphNode = {
         id: uuidv4(),
         node: node,
         text: text,
         x: centerX,
         y: centerY
      };

      this.addGraphNodeIndex = (this.addGraphNodeIndex + 1) % 3;

      this.graphNodes = [...this.graphNodes, element];
      drawGraphNode(this.ctx, element, this.graphSettings, this.selectedNodes, this.selectedSequence);
   }

   // ------------------------ Mouse-Events ------------------------

   private isNodeInRectangle(node: GraphNode, rect: { x: number, y: number, width: number, height: number }): boolean {
      const rectStartX = rect.width >= 0 ? rect.x : rect.x + rect.width;
      const rectStartY = rect.height >= 0 ? rect.y : rect.y + rect.height;

      const rectEndX = rect.width >= 0 ? rect.x + rect.width : rect.x;
      const rectEndY = rect.height >= 0 ? rect.y + rect.height : rect.y;

      return node.x >= rectStartX && node.y >= rectStartY && node.x <= rectEndX && node.y <= rectEndY;
   }

   private handleMouseDown(event: MouseEvent) {
      const { x, y } = this.getMouseCoordinates(event);
      const nodeUnderCursor = findLastGraphNode(this.ctx, this.graphNodes, x, y);

      if (!nodeUnderCursor || !this.selectedNodes.includes(nodeUnderCursor)) {
         this.selectedNodes = [];
         this.draggedNodes = [];
      }

      // Handhabung wenn Knoten gezogen wird
      if (this.selectedNodes.length > 1) {

         const { draggedNodes, isDragging, dragOffset } = handleMultipleNodesDragStart(this.ctx, x, y, this.selectedNodes, this.selectedArrow);
         this.draggedNodes = draggedNodes;
         this.isDragging = isDragging;
         this.dragOffset = dragOffset;

      } else {
         const { draggedNode, isDragging, dragOffset } = handleNodeDragStart(this.ctx, x, y, this.graphNodes, this.selectedArrow);
         this.draggedNode = draggedNode;
         this.isDragging = isDragging;
         this.dragOffset = dragOffset;
      }

      if (this.isGrabbing) {
         // Update Offset von Canvwas wenn dieser gezogen wird
         this.grabStartPosition = { x, y };
         const offsetX = parseFloat(this.style.getPropertyValue('--offset-x'));
         const offsetY = parseFloat(this.style.getPropertyValue('--offset-y'));
         this.grabStartOffset = { x: offsetX, y: offsetY };
      } else {
         // Wenn ein Pfeil gezogen wird, wird ein temporärer gestrichelter Pfeil gezeichnet
         const { arrowToMove, arrowStart } = handleArrowDragStart(this.ctx, x, y, this.graphNodes, this.selectedArrow, this.handleAnchorClick.bind(this));

         if (arrowToMove && arrowStart) {
            this.arrowStart = arrowStart;
            this.arrows = this.arrows.filter((arrow) => arrow !== arrowToMove);
         }
      }

      if (!nodeUnderCursor && !this.isGrabbing && !this.selectedNode) {
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
            const { tempArrowEnd, arrowStart, arrows } = handleArrowCreation(this.ctx, x, y, this.arrowStart, this.graphNodes, this.arrows);

            this.tempArrowEnd = tempArrowEnd;
            this.arrowStart = arrowStart;
            this.arrows = arrows;
            this.isDrawingArrow = false;
         }
      }

      // Resette einmalige Schranke fürs draggen mehrerer Knoten
      this.checkOffset = true;
   }

   private handleMouseMove(event: MouseEvent) {
      const { x, y } = this.getMouseCoordinates(event);
      if (this.selectionRectangle) {
         this.selectionRectangle.width = x - this.selectionRectangle.x;
         this.selectionRectangle.height = y - this.selectionRectangle.y;
         this.selectedNodes = this.graphNodes.filter(node => this.isNodeInRectangle(node, this.selectionRectangle));
         this.redrawCanvas();
      } else
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
            if (this.isDragging && this.draggedNodes.length > 1) {
               let deltaX: number;
               let deltaY: number;

               if (this.checkOffset) {
                  deltaX = this.dragOffset.x;
                  deltaY = this.dragOffset.y;

                  const nodeUnderCursor = findLastGraphNode(this.ctx, this.graphNodes, x, y);
                  this.draggedNodes.forEach(node => {
                     node.x = node.x + deltaX + (nodeUnderCursor.x - x);
                     node.y = node.y + deltaY + (nodeUnderCursor.y - y);
                  });

                  this.checkOffset = false;
               } else {
                  deltaX = x - this.dragOffset.x;
                  deltaY = y - this.dragOffset.y;
                  this.draggedNodes.forEach(node => {
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
      const { hoveredAnchor, isArrowAnchorHovered } = highlightAnchor(this.ctx, this.selectedNode, this.selectedArrow, x, y);
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

   private handleDoubleClick(event: MouseEvent) {
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
   }

   connectedCallback() {
      super.connectedCallback();
      window.addEventListener('resize', this.updateCanvasSize);
      window.addEventListener('keydown', this.handleKeyDown);

      // Konvertiert das Array in einen String und setzt es als Attribut
      this.setAttribute('graph-nodes', JSON.stringify(this.graphNodes));
   }

   disconnectedCallback() {
      window.removeEventListener('resize', this.updateCanvasSize);
      window.removeEventListener('keydown', this.handleKeyDown);
      super.disconnectedCallback();
   }

   updated(changedProperties: Map<string, any>) {
      if (changedProperties.has('editable') && this.editable) {
         autoDeleteEmptyItems(this, this.taskList, '.task-container', '.task-wrapper', '.task-title', '.task-content');
         autoDeleteEmptyItems(this, this.helpList, '.help-container', '.help-wrapper', '.help-title', '.help-content');
      }
      updateDisabledState(this, this.editable);
   }


   // Wird aufgerufen, wenn ein Attribut des Elements geändert wird
   attributeChangedCallback(name: string, oldVal: string, newVal: string) {
      super.attributeChangedCallback(name, oldVal, newVal);
      if (name === 'graph-nodes') {
         try {
            // Konvertiert den String zurück in ein Array
            this.graphNodes = JSON.parse(newVal);
         } catch (e) {
            console.error('Invalid JSON in graph-nodes attribute:', e);
         }
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
      if (this.selectedNodes) {
         this.selectedNodes.forEach((node) => {
            // Entferne ausgewählten Knoten
            this.graphNodes = this.graphNodes.filter((n) => n !== node);

            // Entferne die Verbindungsinformationen für alle betroffenen Knoten
            this.arrows.forEach(arrow => {
               if (arrow.from === node || arrow.to === node) {
                  removeOldConnection(arrow.from, arrow.to);
               }
            });

            // Entferne alle Pfeile, die mit den gelöschten Elementen verbunden sind
            this.arrows = this.arrows.filter(
               (arrow) => arrow.from !== node && arrow.to !== node
            );
         });

         this.selectedNodes = [];
      }

      if (this.selectedNode) {
         this.graphNodes = this.graphNodes.filter((node) => node !== this.selectedNode);

         this.arrows.forEach(arrow => {
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

   private handleKeyDown = (event: KeyboardEvent) => {
      const customPrompt = this.shadowRoot?.querySelector('custom-prompt');
      const confirmPrompt = this.shadowRoot?.querySelector('confirm-prompt');

      if ( (event.key === 'Escape' || event.key === 'Backspace') && customPrompt?.classList.contains('hidden') && confirmPrompt?.classList.contains('hidden') ) {
        this.deleteSelectedObject();
      }
    }

   // ------------------------ Prompt Funktionen ------------------------

   private showCustomPrompt(type: 'node' | 'arrow', index: number) {
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

      (this.shadowRoot.querySelector('custom-prompt') as CustomPrompt).onSubmit = onSubmit;
      (this.shadowRoot.querySelector('custom-prompt') as CustomPrompt).onCancel = onCancel;
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


}

/*
TODO Liste

SelectionMode:
- performance verbessern
- abgleichen mit Musterlösung
- Wiederholende Zahlen sollen nebeneinander angezeigt werden


- Cursor anpassen, je nach dem was gehovert wird

*/