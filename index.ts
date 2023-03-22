import {LitElementWw} from "@webwriter/lit"
import {html, css} from "lit"
import {customElement, property, query} from "lit/decorators.js"

interface GraphNodeData {
  node: 'start' | 'op' | 'case' ;
  text?: string;
  x: number;
  y: number;
  connections?: { position: number; connectedTo: GraphNodeData }[];
}


@customElement('pap-widget')
export class PAPWidget extends LitElementWw {
  @property({ type: Array }) graphElements: GraphNodeData[] = [];
  @property({ type: Object }) selectedElement?: GraphNodeData;
  @property({ type: Array }) arrows: { 
    from: GraphNodeData; 
    to: GraphNodeData 
  }[] = [];


  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private isDragging = false;
  private draggedElement: GraphNodeData;
  private dragOffset = { x: 0, y: 0 };

  private isDrawingArrow = false;
  private arrowStart?: { element: GraphNodeData; position: number };
  private tempArrowEnd?: { x: number; y: number };

  static styles = css`
   :host {
      --offset-x: 0;
      --offset-y: 0;
      --grid-background-color: white;
      --grid-color: lightgrey;
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
      width: 800px;
      height: 600px;
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

  protected render() {
    return html`
      <div class="sidebar">
        <button @click="${() => this.addGraphElement('start', 'Start')}">
          Füge Start-Knoten hinzu
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
        width="800"
        height="600"
        @mousedown="${this.handleMouseDown}"
        @mouseup="${this.handleMouseUp}"
        @mousemove="${this.handleMouseMove}"
        @click="${this.handleClick}"
        @dblclick="${this.handleDoubleClick}"
      ></canvas>
    `;
  }

  // Lösche alle Elemente vom Canvas 
  private clearAll() {
    this.graphElements = [];
    this.arrows = [];
    this.redrawCanvas();
  }

  private addGraphElement(node: 'start' | 'op' | 'case', text: 'Start' | 'Operation' | 'Verzweigung') {
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
    const { width, height } = this.measureTextSize(text);

    // Zeichne die passenden Knoten je nach Typ
    switch (node) {
      case 'start':
          this.ctx.fillStyle = "green";
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
          this.ctx.fillStyle = "yellow";
          this.ctx.fillRect(x, y, width, height);
          break;
      case 'case':
          this.ctx.fillStyle = "red";
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

    // Zeichne den Rand, wenn das Element ausgewählt ist
    if (this.selectedElement === element) {
      this.ctx.strokeStyle = 'blue';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, y, width, height);

      // Zeichne die kleinen Kreise an den Rändern
      this.ctx.fillStyle = 'blue';
      const circleRadius = 4;
      const d = 10;   //Abstand zu den Element
      const positions = [
        { x: x + width / 2, y: y - d },
        { x: x + width + d, y: y + height / 2 },
        { x: x + width / 2, y: y + height + d },
        { x: x - d, y: y + height / 2 },
      ];

      // Index: 0: oben, 1: rechts, 2: unten, 3: links 
      positions.forEach((position, index) => {
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


  private drawArrow(from: { x: number; y: number }, to: { x: number; y: number }) {

    let dx = to.x - from.x;
    let dy = to.y - from.y;
    let angle = Math.atan2(dy, dx);
    
    const arrowHeadLength = 10; // Passe die Länge der Pfeilspitze an
    const arrowHeadAngle = 80 * (Math.PI / 180); // Passe den Winkel der Pfeilspitze an 
    
    this.ctx.fillStyle = "black";
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 2;
    
    // Zeichne die Hauptlinie des Pfeils
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();
    
    // Zeichne die Pfeilspitze
    this.ctx.beginPath();
    this.ctx.moveTo(to.x, to.y);
    this.ctx.lineTo(to.x - arrowHeadLength * Math.cos(angle - arrowHeadAngle / 2), to.y - arrowHeadLength * Math.sin(angle - arrowHeadAngle / 2));
    this.ctx.lineTo(to.x - arrowHeadLength * Math.cos(angle + arrowHeadAngle / 2), to.y - arrowHeadLength * Math.sin(angle + arrowHeadAngle / 2));
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.fill();

  }
  
  private redrawCanvas() {
    // Zeichne alle Knoten 
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.graphElements.forEach((element) => {
      this.drawGraphElement(element);
    });

    // Zeichne alle Verbindungen 
    this.arrows.forEach((arrow) => {
      const from = this.getArrowEndpoint(arrow.from, arrow.to);
      const to = this.getArrowEndpoint(arrow.to, arrow.from);
      this.drawArrow(from, to);
    });

    //Zeichne eine temporäre Verbindung beim ziehen zwischen zwei Elementen
    if (this.isDrawingArrow && this.arrowStart && this.tempArrowEnd) {
      const positions = this.getPositions(this.arrowStart.element);
      this.drawArrow(positions[this.arrowStart.position], this.tempArrowEnd);
    }
  }

  // ------------ Hilfsfunktionen ------------

  // Bestimme die Maße der Knoten anhand der Textgrößen
  private measureTextSize(text: string): { width: number; height: number } {
    const metrics = this.ctx.measureText(text);
    const width = Math.max(metrics.width + 20, 80);
    const height = Math.max(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 20, 60);
    return { width, height };
  }

  private findGraphElement(x:number, y:number) {
    return this.graphElements.find((element) =>
      x >= element.x &&
      x <= element.x + this.measureTextSize(element.text).width &&
      y >= element.y &&
      y <= element.y + this.measureTextSize(element.text).height
    );
  }

  // Gibt das Positionen Array einen Knotens zurück
  private getPositions(element: GraphNodeData) {
    const positions = [
      { x: element.x + this.measureTextSize(element.text).width / 2, y: element.y },
      { x: element.x + this.measureTextSize(element.text).width, y: element.y + this.measureTextSize(element.text).height / 2 },
      { x: element.x + this.measureTextSize(element.text).width / 2, y: element.y + this.measureTextSize(element.text).height },
      { x: element.x, y: element.y + this.measureTextSize(element.text).height / 2 },
    ];

    return positions;
  }

  // Sucht den nähstgelegenten Ankerpunkt und gibt den Index zurück 
  private getNearestCircle(from: { x: number; y: number }, element: GraphNodeData) {
    const positions = this.getPositions(element);
  
    let minDistance = Infinity;
    let nearestCircleIndex = 0;
  
    positions.forEach((position, index) => {
      const distance = Math.sqrt((position.x - from.x) ** 2 + (position.y - from.y) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCircleIndex = index;
      }
    });

    return nearestCircleIndex;
  }


  private getArrowEndpoint(from: GraphNodeData, to: GraphNodeData) {

    const positions = this.getPositions(from);
  
    if (!from.connections) {
      return positions[0];
    }
  
    const connection = from.connections.find( x => x.connectedTo === to);
    if (connection) {
      return positions[connection.position];
    }
  
    return positions[0];
  }

  // ------------ Mouse-Events ------------

  private handleMouseDown(event: MouseEvent) {
    const x = event.clientX - this.canvas.offsetLeft;
    const y = event.clientY - this.canvas.offsetTop;

    this.draggedElement = this.findGraphElement(x, y);


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
  
      const targetElement = this.graphElements.find((element) =>
        x >= element.x - 10 &&
        x <= element.x + this.measureTextSize(element.text).width + 10 &&
        y >= element.y - 10 &&
        y <= element.y + this.measureTextSize(element.text).height + 10
      );
  
      if (this.arrowStart && targetElement) {
        
  
        // Speichere die Pfeilverbindung am Startelement
        if (!this.arrowStart.element.connections) {
          this.arrowStart.element.connections = [];
        }
        this.arrowStart.element.connections.push({ position: this.arrowStart.position, connectedTo: targetElement });

        // Speichere die Pfeilverbindung am Ziel-Element
        if (!targetElement.connections) {
          targetElement.connections = [];
        }
        const nearestCircleIndex = this.getNearestCircle( {x, y}, targetElement);
        targetElement.connections.push({ position: nearestCircleIndex, connectedTo: this.arrowStart.element });

        this.arrows.push({ from: this.arrowStart.element, to: targetElement });

        this.redrawCanvas();
      }

  
      this.isDrawingArrow = false;
    }
    this.tempArrowEnd = undefined;
  }


  private handleClick(event: MouseEvent) {
    const x = event.clientX - this.canvas.offsetLeft;
    const y = event.clientY - this.canvas.offsetTop;

    // Setze das ausgewählte Element, oder entferne die Auswahl, wenn kein Element angeklickt wurde
    this.selectedElement = this.findGraphElement(x, y);

    // Zeichne den Canvas neu, um die aktualisierte Auswahl anzuzeigen
    this.redrawCanvas();
  }

  private handleMouseMove(event: MouseEvent) {
    if (this.isDragging && this.draggedElement) {
      const x = event.clientX - this.canvas.offsetLeft - this.dragOffset.x;
      const y = event.clientY - this.canvas.offsetTop - this.dragOffset.y;

      this.draggedElement.x = x;
      this.draggedElement.y = y;

      this.redrawCanvas();
    } else if (this.isDrawingArrow && this.arrowStart) {
      const x = event.clientX - this.canvas.offsetLeft;
      const y = event.clientY - this.canvas.offsetTop;

      this.tempArrowEnd = { x, y };
  
      this.redrawCanvas();
    }
  }

  private async handleDoubleClick(event: MouseEvent) {
    const x = event.offsetX;
    const y = event.offsetY;

    // Ermittle, ob das Doppelklick-Event auf einem der Rechtecke stattgefunden hat
    const clickedElementIndex = this.graphElements.findIndex((element) =>
      x >= element.x &&
      x <= element.x + this.measureTextSize(element.text).width &&
      y >= element.y &&
      y <= element.y + this.measureTextSize(element.text).height
    );

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

  private handleCircleClick(event: MouseEvent, element: GraphNodeData, position: number) {
    event.stopPropagation();
    this.isDrawingArrow = true;
    this.arrowStart = { element, position };
  }

  
  firstUpdated() {
    this.canvas = this.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    // Zeichne bereits hinzugefügte Elemente erneut
    this.graphElements.forEach((element) => {
      this.drawGraphElement(element);
    });
  }
  
}