import { LitElementWw } from "@webwriter/lit"
import { html, css}  from "lit"
import { customElement, property } from "lit/decorators.js"

import { GraphNodeData, Arrow } from "./src/definitions"
import { drawArrow } from "./src/drawer"
import { measureTextSize, getAnchors, getArrowInformation, getNearestCircle, findLast, findLastIndex } from "./src/helper"


@customElement('pap-widget')
export class PAPWidget extends LitElementWw {
  @property({ type: Array }) graphElements: GraphNodeData[] = [];
  @property({ type: Object }) selectedElement?: GraphNodeData;
  @property({ type: Array }) arrows: Arrow[] = [];
  @property({ type: Object }) selectedArrow?: Arrow;
  

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private isDragging = false;
  private draggedElement: GraphNodeData;
  private dragOffset = { x: 0, y: 0 };

  private isDrawingArrow = false;
  private arrowStart?: { element: GraphNodeData; anchor: number };
  private tempArrowEnd?: { x: number; y: number };
  
  static styles = css`
   :host {
      --offset-x: 0;
      --offset-y: 0;
      --grid-background-color: white;
      --grid-color: #104E8B;
      --grid-size: 50px;
      --grid-dot-size: 1px;
    }
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      height: 100%;
      width: 160px;
      background-color: #f8f8f8;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    button {
      font-size: 16px;
      padding: 10px;
      margin-right: 10px;
    }
    canvas {
      position: relative;
      margin-left: 210px;
      width: calc(100% - 210);
      height: 100%;
      border: 1px solid black;
      background-size: var(--grid-size) var(--grid-size);
      background-image: radial-gradient(
        circle,
        var(--grid-color) var(--grid-dot-size),
        var(--grid-background-color) var(--grid-dot-size)
      );
      background-position: var(--offset-x) var(--offset-y);
      z-index: 0;
    }
  `;

  render() {
    return html`
      <div class="sidebar">
        <button @click="${() => this.addGraphElement('start', 'Start')}">
          Füge Start-Knoten hinzu
        </button>
        <button @click="${() => this.addGraphElement('end', 'Ende')}">
          Füge Ende-Knoten hinzu
        </button>
        <button @click="${() => this.addGraphElement('op', 'Operation')}">
          Füge Operations-Knoten hinzu
        </button>
        <button @click="${() => this.addGraphElement('case', 'Verzweigung')}">
          Füge Verzweigungs-Knoten hinzu
        </button>
        <button @click="${() => this.clearAll()}">
          Lösche alles
        </button>
      </div>
      <canvas
        width="${window.innerWidth - 400}"
        height="${window.innerHeight}"
        @mousedown="${this.handleMouseDown}"
        @mouseup="${this.handleMouseUp}"
        @mousemove="${this.handleMouseMove}"
        @click="${this.handleClick}"
        @dblclick="${this.handleDoubleClick}"
      ></canvas>
    `;
  }

  firstUpdated() {
    this.canvas = this.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
    this.canvas.width = window.innerWidth - 400;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    // Zeichne bereits hinzugefügte Elemente erneut
    this.graphElements.forEach((element) => {
      this.drawGraphElement(element);
    });
  }

  // Passt die Canvasgröße an die aktuelle Größe des Fenster an
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.updateCanvasSize);
  }
  
  disconnectedCallback() {
    window.removeEventListener('resize', this.updateCanvasSize);
    super.disconnectedCallback();
  }
  
  updateCanvasSize = () => {
    this.canvas.width = window.innerWidth - 400;
    this.canvas.height = window.innerHeight;
    this.redrawCanvas();
  };

  private redrawCanvas() {
    
    // Bereinige das Canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Zeichne alle Knoten 
    this.graphElements.forEach((element) => {
      this.drawGraphElement(element);
    });

    // Zeichne alle Verbindungen 
    this.arrows.forEach((arrow) => {
      const fromCoordination = getArrowInformation(this.ctx, arrow.from, arrow.to);
      const toCoordination = getArrowInformation(this.ctx, arrow.to, arrow.from);
      const updatedArrowPoints = drawArrow(this.ctx, fromCoordination, toCoordination, arrow.isSelected, true); 
      arrow.points = updatedArrowPoints;
    });
   
    //Zeichne eine temporäre Verbindung beim ziehen zwischen zwei Elementen
    if (this.isDrawingArrow && this.arrowStart && this.tempArrowEnd) {
      const anchors = getAnchors(this.ctx, this.arrowStart.element);
      drawArrow(this.ctx, anchors[this.arrowStart.anchor], this.tempArrowEnd);
    }
  }

  // Lösche alle Elemente vom Canvas 
  private clearAll() {
    this.graphElements = [];
    this.arrows = [];
    this.arrowStart = undefined;
    this.redrawCanvas();
  }

  private addGraphElement(node: 'start' | 'end' | 'op' | 'case', text: 'Start' | 'Ende' | 'Operation' | 'Verzweigung') {
    const x = Math.floor(Math.random() * this.canvas.width * 0.8);
    const y = Math.floor(Math.random() * this.canvas.height * 0.8);
    // const x = this.canvas.width * 0.5;
    // const y = this.canvas.height * 0.5;

    let element: GraphNodeData = {
      node: node,
      text: text,
      x: x,
      y: y
    };

    
    this.graphElements = [...this.graphElements, element];
    this.drawGraphElement(element);
  }

  private drawGraphElement(element: GraphNodeData) {
    // Wird genutzt, damit die Breite beim ersten Element richtig gemessen wird. 
    let firstTime = true;
    if (firstTime) {
      this.ctx.fillStyle = 'black';
      this.ctx.font = 'bold 16px Courier New';
      this.ctx.fillText(element.text, element.x + 10, element.y + (60 / 2) + 5);
      firstTime = false;
    }

    const { node, text, x, y} = element;
    const { width, height } = measureTextSize(this.ctx, text);

    // Zeichne die passenden Knoten je nach Typ
    switch (node) {
      case 'start':
      case 'end':
          this.ctx.fillStyle = "#4F94CD";
          // Zeichne ein abgerundetes Rechteck
          const radius = 25; // Radius der abgerundeten Ecken
          this.ctx.beginPath();
          this.ctx.moveTo(x + radius, y);
          this.ctx.lineTo(x + width - radius, y);
          this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          this.ctx.lineTo(x + width, y + height - radius);
          this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          this.ctx.lineTo(x + radius, y + height);
          this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
          this.ctx.lineTo(x, y + radius);
          this.ctx.quadraticCurveTo(x, y, x + radius, y);
          this.ctx.closePath();
          this.ctx.fill();
          break;
      case 'op':
          this.ctx.fillStyle = "#43cd80";
          this.ctx.fillRect(x, y, width, height);
          break;
      case 'case':
          this.ctx.fillStyle = "#FF3030";
          // Zeichne einen Diamanten
          this.ctx.beginPath();
          this.ctx.moveTo(x + width / 2, y);
          this.ctx.lineTo(x + width, y + height / 2);
          this.ctx.lineTo(x + width / 2, y + height);
          this.ctx.lineTo(x, y + height / 2);
          this.ctx.closePath();
          this.ctx.fill();
          break;
      default:
          this.ctx.fillStyle = "red";
    }

    // Text zum Element hinzufügen
    this.ctx.fillStyle = 'black';
    this.ctx.font = 'bold 16px Courier New';
    this.ctx.fillText(text, x + 10, y + (height / 2) + 5);

    // Hervorhebung eines ausgewählten Knoten
    if (this.selectedElement === element) {
      this.ctx.strokeStyle = '#87cefa';
      this.ctx.setLineDash([5, 10]);
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, y, width, height);

      // Zeichne die kleinen Kreise an den Rändern
      this.ctx.fillStyle = '#87cefa';
      const circleRadius = 4;
      const d = 10;   //Abstand zu den Element
      const anchors = [
        { x: x + width / 2, y: y - d },
        { x: x + width + d, y: y + height / 2 },
        { x: x + width / 2, y: y + height + d },
        { x: x - d, y: y + height / 2 },
      ];

      // Index: 0: oben, 1: rechts, 2: unten, 3: links 
      anchors.forEach((position, index) => {
        this.ctx.beginPath();
        this.ctx.arc(position.x, position.y, circleRadius, 0, 2 * Math.PI);
        this.ctx.fill();

          // Füge einen Event Listener für jeden Kreis hinzu
        this.canvas?.addEventListener('mousedown', (event) => {
          const x = event.clientX - this.canvas.offsetLeft;
          const y = event.clientY - this.canvas.offsetTop;
          const distance = Math.sqrt((position.x - x) ** 2 + (position.y - y) ** 2);

          if (distance <= 5) {
            this.handleCircleClick(event, element, index);
          }
        });
      });
    }
  }
  

  // ------------ Mouse-Events ------------

  private handleMouseDown(event: MouseEvent) {
    const x = event.clientX - this.canvas.offsetLeft;
    const y = event.clientY - this.canvas.offsetTop;

    this.draggedElement = this.findLastGraphElement(x, y);


    if (this.draggedElement) {
      this.isDragging = true;
      this.dragOffset = { x: x - this.draggedElement.x, y: y - this.draggedElement.y };
    }
  }

  private handleMouseUp(event: MouseEvent) {
    if (this.isDragging) {
      this.isDragging = false;
    } else if (this.isDrawingArrow) {
      const x = event.clientX - this.canvas.offsetLeft;
      const y = event.clientY - this.canvas.offsetTop;
  
      const targetElement = this.findLastGraphElement(x, y);
  
      if (this.arrowStart && targetElement) {
      
        // Speichere die Pfeilverbindung am Startelement
        if (!this.arrowStart.element.connections) {
          this.arrowStart.element.connections = [];
        }
        this.arrowStart.element.connections.push({ anchor: this.arrowStart.anchor, connectedTo: targetElement });

        // Speichere die Pfeilverbindung am Ziel-Element
        if (!targetElement.connections) {
          targetElement.connections = [];
        }
        const nearestCircleIndex = getNearestCircle(this.ctx, {x, y}, targetElement);
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
  }

  private handleMouseMove(event: MouseEvent) {
    if (this.isDragging && this.draggedElement) {
      const x = event.clientX - this.canvas.offsetLeft - this.dragOffset.x;
      const y = event.clientY - this.canvas.offsetTop - this.dragOffset.y;

      this.draggedElement.x = x;
      this.draggedElement.y = y;

      this.redrawCanvas();
    } else if (this.isDrawingArrow && this.arrowStart && this.selectedElement) {
      const x = event.clientX - this.canvas.offsetLeft;
      const y = event.clientY - this.canvas.offsetTop;

      this.tempArrowEnd = { x, y };
  
      this.redrawCanvas();
    }
  }

  private handleClick(event: MouseEvent) {
    const x = event.clientX - this.canvas.offsetLeft;
    const y = event.clientY - this.canvas.offsetTop;
    
    // Setze das ausgewählte Element, oder entferne die Auswahl, wenn kein Element angeklickt wurde
    this.selectedElement = this.findLastGraphElement(x, y);
    const selectedElementIndex = this.graphElements.lastIndexOf(this.selectedElement);
    // Packe das ausgewählte Element ans Ende des Arrays, damit es über den anderen Elementen erscheint
    if(this.selectedElement && !this.isDragging) {
      this.graphElements.splice(selectedElementIndex, 1);
      this.graphElements.push(this.selectedElement);
    }

    // Finde den angeklickten Pfeil
    const clickedArrowIndex = this.arrows.findIndex((arrow) => this.isArrowClicked(x, y, arrow.points));
    // Wenn ein Pfeil angeklickt wurde, ändere den isSelected-Wert und zeichne das Canvas neu
    if (clickedArrowIndex !== -1) {
      // this.selectedArrow = this.arrows[clickedArrowIndex];
      // this.selectedArrow.isSelected = true;
      this.arrows[clickedArrowIndex].isSelected = true; //Pfeil muss noch abgewählt werden
      console.log("Pfeil anklickt");
      this.redrawCanvas();
    } 

    // if(this.selectedArrow && !this.isDragging) {
    //   this.arrows.splice(clickedArrowIndex, 1);
    //   this.arrows.push(this.selectedElement);
    // }
 

    // Zeichne den Canvas neu, um die aktualisierte Auswahl anzuzeigen
    this.redrawCanvas();
  }

  private handleDoubleClick(event: MouseEvent) {
    const x = event.offsetX;
    const y = event.offsetY;

    // Ermittle, ob das Doppelklick-Event auf einem der Rechtecke stattgefunden hat
    const clickedElementIndex = this.findGraphElementLastIndex(x, y);
    
    if (clickedElementIndex !== -1) {
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

  private handleCircleClick(event: MouseEvent, element: GraphNodeData, anchor: number) {
    event.stopPropagation();
    this.isDrawingArrow = true;
    this.arrowStart = { element, anchor };
  }

    // ------------ Hilfsfunktionen ------------

  // Finde das letzte Element von den Graphelement-Array anhand der x und y Koordinate und gibt dieses zurück
  private findLastGraphElement(x:number, y:number) {
    return findLast(this.graphElements, (element) =>
      x >= element.x &&
      x <= element.x + measureTextSize(this.ctx, element.text).width &&
      y >= element.y &&
      y <= element.y + measureTextSize(this.ctx, element.text).height
    );
    
  }

  // Finde das letzte Element von den Graphelement-Array anhand der x und y Koordinate und gibt den Index zurück 
  private findGraphElementLastIndex(x:number, y:number) {
    return findLastIndex(this.graphElements, (element) =>
      x >= element.x &&
      x <= element.x + measureTextSize(this.ctx, element.text).width &&
      y >= element.y &&
      y <= element.y + measureTextSize(this.ctx, element.text).height
    );
  }


  private isArrowClicked(mouseX: number, mouseY: number, points: { x: number; y: number }[]): boolean {
    const clickTolerance = 8;
  
    for (let i = 0; i < points.length - 1; i++) {
      const startPoint = points[i];
      const endPoint = points[i + 1];
  
      const dx = endPoint.x - startPoint.x;
      const dy = endPoint.y - startPoint.y;
      const length = Math.sqrt(dx * dx + dy * dy);
  
      const dot = ((mouseX - startPoint.x) * dx + (mouseY - startPoint.y) * dy) / (length * length);
      const closestX = startPoint.x + dot * dx;
      const closestY = startPoint.y + dot * dy;
  
      if (dot >= 0 && dot <= 1) {
        const distance = Math.sqrt(Math.pow(closestX - mouseX, 2) + Math.pow(closestY - mouseY, 2));
        if (distance <= clickTolerance) {
          return true;
        }
      }
    }
    return false;
  }
  
}

/*

TODO Liste

Funktionalitäten des PAP
- Text ändern: Textarea vs prompt()? 
- Hervorheben der Lininen durch anklicken. -> Durch 2 Kreise an Start- und Endpunkt, um die Linie zu versetzen. 
- Rechtklick soll fenster öffnen mit Menü zum löschen einzelner Elemente
- Canvas per drag and drop verschieben
- Textelemente für Verbindungen 
- Select All, verschieben mehrere Elemente durch drag and drop

Aufgaben
- Aufgabenfeld damit Aufgabentexten angegeben werden können. zB Konstruiere zu folgendem Text ein PAP


Design Entscheidungen:
- Canvasgröße? Gesamtfläche - Sidebar?
- Outline an den jeweiligen Elementen für mehr Tiefe
- Start- und Endknoten runde Ecken anpassen
- Buttons durch Buttons mit der richtigen Form ersetzen


*/