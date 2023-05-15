export function drawSelectionField(ctx: CanvasRenderingContext2D, rect: { x: number, y: number, width: number, height: number }) {
   const { x, y, width, height } = rect;

    // Füllen des Rechtecks
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = 'rgba(173, 216, 230, 0.2)'; 
    ctx.fill();
 
   // Äußere, durchgehende Linie
   ctx.beginPath();
   ctx.rect(x, y, width, height);
   ctx.lineWidth = 1;
   ctx.strokeStyle = 'rgba(0, 122, 255, 0.5)';
   ctx.stroke();

}
