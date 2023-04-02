import { LitElementWw } from "@webwriter/lit"
import { html, css}  from "lit"
import { customElement, property } from "lit/decorators.js"

import { GraphNodeData, Arrow } from "./src/definitions"
import { drawArrow } from "./src/drawer"
import { measureTextSize, getAnchors, getArrowInformation, getNearestCircle, isArrowClicked, findLast, findLastIndex } from "./src/helper"


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
      if (this.selectedArrow === arrow) {
        arrow.isSelected = true;
      } else {
        arrow.isSelected = false;
      }
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
          if (distance <= 6) {
            this.handleCircleClick(event, element, index);          }
        });
      });
    }
  }
  

  // ------------ Mouse-Events ------------

  private handleMouseDown(event: MouseEvent) {
    const x = event.clientX - this.canvas.offsetLeft;
    const y = event.clientY - this.canvas.offsetTop;

    this.draggedElement = this.findLastGraphElement(x, y);

    if (this.draggedElement && !this.selectedArrow) {
      this.isDragging = true;
      this.dragOffset = { x: x - this.draggedElement.x, y: y - this.draggedElement.y };
    }

    if (this.selectedArrow) {
      const { points } = this.selectedArrow;
      console.log(this.selectedArrow);
      const isWithinCircle = (x: number, y: number, circleX: number, circleY: number, radius: number) =>
        Math.sqrt(Math.pow(x - circleX, 2) + Math.pow(y - circleY, 2)) <= radius;
      
      // Überprüfe ob einer der Ankerpunkte berührt wurde, wenn ja setze die Variablen zum ziehen.
      if (isWithinCircle(x, y, points[0].x, points[0].y, 5) || isWithinCircle(x, y, points[points.length - 1].x, points[points.length - 1].y, 5)) {
        
        console.log ("Ankerpunktkreis");
        // Rufe handleCircleClick auf um einen temporären Pfeil zu zeichnen.
        let tempElement: GraphNodeData;
        let tempAnchor: number;
        const nearestElement = this.findLastGraphElement(x, y);
     
        // Bestimme das Startelement von dem der temporäre Pfeil gesetzt werden soll
        if (nearestElement) {
          nearestElement === this.selectedArrow.from ? tempElement = this.selectedArrow.to : tempElement = this.selectedArrow.from
          for (let i = 0; i < tempElement.connections.length; i++ ) {
            if (tempElement.connections[i].connectedTo === nearestElement) { tempAnchor = tempElement.connections[i].anchor }
          }
          console.log('Richtiger Anker ' + tempAnchor);
          console.log('Startelement '+ tempElement.node);
          this.handleCircleClick(event, tempElement, tempAnchor);
          this.arrows = this.arrows.filter((arrow) => arrow.from !== this.selectedArrow.from || arrow.to !== this.selectedArrow.to);
        }

      }
    }
  }

  private handleMouseUp(event: MouseEvent) {
    if (this.isDragging) {
      this.isDragging = false;
    } else if (this.isDrawingArrow) {
      const x = event.clientX - this.canvas.offsetLeft;
      const y = event.clientY - this.canvas.offsetTop;
  
      const targetElement = this.findLastGraphElement(x, y);
      
      // Überprüft ob ein Zielelement gefunden wurde und dieser ungleich dem Startelement
      if (this.arrowStart && targetElement && (this.arrowStart.element !== targetElement)) {
      
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
    //this.selectedArrow = undefined;
  }

  

  private handleMouseMove(event: MouseEvent) {
    if (this.isDragging && this.draggedElement) {
      const x = event.clientX - this.canvas.offsetLeft - this.dragOffset.x;
      const y = event.clientY - this.canvas.offsetTop - this.dragOffset.y;

      this.draggedElement.x = x;
      this.draggedElement.y = y;

      this.redrawCanvas();
    } else if (this.isDrawingArrow && this.arrowStart && (this.selectedElement || this.selectedArrow) ) {

      const x = event.clientX - this.canvas.offsetLeft;
      const y = event.clientY - this.canvas.offsetTop;

      this.tempArrowEnd = { x, y };
  
      this.redrawCanvas();
    }
  }

  private handleClick(event: MouseEvent) {
    const x = event.clientX - this.canvas.offsetLeft;
    const y = event.clientY - this.canvas.offsetTop;
    
    // Setze das angeklickte Element, oder entferne die Auswahl, wenn kein Element angeklickt wurde
    this.selectedElement = this.findLastGraphElement(x, y);
    const selectedElementIndex = this.graphElements.lastIndexOf(this.selectedElement);
    // Packe das ausgewählte Element ans Ende des Arrays, damit es über den anderen Elementen erscheint
    if(this.selectedElement && !this.isDragging ) {
      this.graphElements.splice(selectedElementIndex, 1);
      this.graphElements.push(this.selectedElement);
    }

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
    const d = 5;  // Toleranzbereich
    return findLast(this.graphElements, (element) =>
      x >= element.x - d &&
      x <= element.x + measureTextSize(this.ctx, element.text).width + d &&
      y >= element.y - d &&
      y <= element.y + measureTextSize(this.ctx, element.text).height + d
    );
    
  }

  // Finde das letzte Element von den Graphelement-Array anhand der x und y Koordinate und gibt den Index zurück 
  private findGraphElementLastIndex(x:number, y:number) {
    const d = 5;  // Toleranzbereich
    return findLastIndex(this.graphElements, (element) =>
      x >= element.x - d &&
      x <= element.x + measureTextSize(this.ctx, element.text).width + d &&
      y >= element.y - d &&
      y <= element.y + measureTextSize(this.ctx, element.text).height + d
    );
  }
  
}

/*

TODO Liste

Funktionalitäten des PAP
- Text ändern: Textarea vs prompt()? 
- Hervorheben der Lininen durch anklicken. -> Durch 2 Kreise an Start- und Endpunkt, um die Linie zu versetzen. 
- Rechtklick soll fenster öffnen mit Menü zum löschen einzelner Elemente
- (Canvas per drag and drop verschieben)
- Textelemente für Verbindungen 
- Zwischenpunkte für Loops 
- Select All, verschieben mehrere Elemente durch drag and drop

Aufgaben
- Aufgabenfeld damit Aufgabentexten angegeben werden können. zB Konstruiere zu folgendem Text ein PAP


Design Entscheidungen:
- Canvasgröße? Gesamtfläche - Sidebar?
- Outline an den jeweiligen Elementen für mehr Tiefe
- Start- und Endknoten runde Ecken anpassen
- Buttons durch Buttons mit der richtigen Form ersetzen


Pfeil umsetzen TODO
- wenn ein ausgewählter Pfeil angeklickt wurde, blockiere die Maus interaktion für die darunterliegenden Elemente
- Was muss als nächstes gemacht werden?
  - Ankerpunkt des Pfeils muss gespeichert werden
  - alter Pfeil muss aus dem Array gelöscht werden
  - falls kein gültiges target Elemetn gefunden wurde füge den alten Pfeil wieder hinzu
  - falls gültiges Target gefunden wurde, setzte den Pfeil korrekt und füge ihm dem Array hinzu
  - Richtung des Pfeils beachten, dieser muss gegebenfalls vertauscht werden 
  - Interaktionen mit drag Element beachten 
*/