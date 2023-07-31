// Funktion zum Zeichnen von Schaltflächenelementen
export function drawButton(element: string, menu: 'flow' | 'tool' | 'task' | 'help' | 'translate') {
   
   // Funktion zum übersichtlichen setzen der Attribute der SVG Grafiken 
   function setAttributeList(element: SVGElement, attributes: { [key: string]: string }): void {
      for (const key in attributes) {
         element.setAttribute(key, attributes[key]);
      }
   }

   // Setze die Maße für das Parent SVG Element und das Text Element in Abhängigkeit vom Menü 
   const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
   const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

   switch (menu) {
      case 'flow':
         setAttributeList(svg, {
            width: '130',
            height: '55',
         });
         setAttributeList(text, {
            x: '65',
            y: '35',
            fill: 'white',
            'text-anchor': 'middle',
            'font-size': '13',
            'font-family': 'Arial'
         });
         svg.appendChild(text);
         break;
      case 'tool':
         setAttributeList(svg, {
            width: '40',
            height: '30',
         });
         break;
      case 'task':
         setAttributeList(svg, {
            width: '240',
            height: '30',
         });
         break;
      case 'help':
      case "translate":
         setAttributeList(svg, {
            width: '140',
            height: '30',
         });
         break;
      default:
         console.log('Unbekanntes Menü');
   }

   switch (element) {
      case 'start':
      case 'end':
         const terminal = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
         setAttributeList(terminal, {
            x: '15',
            y: '15',
            width: '100',
            height: '30',
            rx: '15',
            ry: '15',
            fill: 'none',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(terminal);
         element === 'start' ? text.textContent = 'Start' : text.textContent = 'Ende';
         break;

      case 'op':
         const operation = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
         setAttributeList(operation, {
            x: '15',
            y: '15',
            width: '100',
            height: '30',
            fill: 'none',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(operation);
         text.textContent = 'Operation';
         break;

      case 'decision':
         const decision = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
         setAttributeList(decision, {
            points: '65,5 125,27 65,50 5,27',
            fill: 'none',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(decision);
         text.textContent = 'Verzweigung';
         text.setAttribute('y', '32');
         break;

      case 'connector':
         const connector = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
         setAttributeList(connector, {
            cx: '65',
            cy: '24',
            r: '8',
            fill: 'none',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(connector);
         text.textContent = 'Übergangsstelle';
         text.setAttribute('y', '50');
         break;

      case 'i/o':
         const io = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
         const offsetX = 6;
         const offsetY = 15;
         const width = 115;
         const height = 30;
         const skewX = 20;
      
         const points = [
            offsetX + skewX, offsetY,
            offsetX + width, offsetY,
            offsetX + width - skewX, offsetY + height,
            offsetX, offsetY + height
         ].join(',');
      
         setAttributeList(io, {
            points: points,
            fill: 'none',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(io);
         text.textContent = 'Ein-/Ausgabe';
         break;

      case 'sub':
         const sub = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
         setAttributeList(sub, {
            x: '7',
            y: '15',
            width: '114',
            height: '30',
            fill: 'none',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(sub);

         const lineL = document.createElementNS('http://www.w3.org/2000/svg', 'line');
         setAttributeList(lineL, {
            x1: '12',
            y1: '15',
            x2: '12',
            y2: '45',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(lineL);

         const lineR = document.createElementNS('http://www.w3.org/2000/svg', 'line');
         setAttributeList(lineR, {
            x1: '116',
            y1: '15',
            x2: '116',
            y2: '45',
            stroke: 'white',
            'stroke-width': '2'
         });
         svg.appendChild(lineR);

         text.textContent = 'Unterprogramm';
         text.setAttribute('x', '63');
         break;

      case 'text':
         text.textContent = 'Kommentar';
         break;

      // Tool Menü    
      case 'grab':
         const scaleGrab = 0.05;
         const grabX = 115;
         const grabY = 45;

         const hand = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(hand, {
            d: 'M408.864 79.052c-22.401-33.898-66.108-42.273-98.813-23.588-29.474-31.469-79.145-31.093-108.334-.022-47.16-27.02-108.71 5.055-110.671 60.806C44.846 105.407 0 140.001 0 187.429v56.953c0 32.741 14.28 63.954 39.18 85.634l97.71 85.081c4.252 3.702 3.11 5.573 3.11 32.903 0 17.673 14.327 32 32 32h252c17.673 0 32-14.327 32-32 0-23.513-1.015-30.745 3.982-42.37l42.835-99.656c6.094-14.177 9.183-29.172 9.183-44.568V146.963c0-52.839-54.314-88.662-103.136-67.911zM464 261.406a64.505 64.505 0 0 1-5.282 25.613l-42.835 99.655c-5.23 12.171-7.883 25.04-7.883 38.25V432H188v-10.286c0-16.37-7.14-31.977-19.59-42.817l-97.71-85.08C56.274 281.255 48 263.236 48 244.381v-56.953c0-33.208 52-33.537 52 .677v41.228a16 16 0 0 0 5.493 12.067l7 6.095A16 16 0 0 0 139 235.429V118.857c0-33.097 52-33.725 52 .677v26.751c0 8.836 7.164 16 16 16h7c8.836 0 16-7.164 16-16v-41.143c0-33.134 52-33.675 52 .677v40.466c0 8.836 7.163 16 16 16h7c8.837 0 16-7.164 16-16v-27.429c0-33.03 52-33.78 52 .677v26.751c0 8.836 7.163 16 16 16h7c8.837 0 16-7.164 16-16 0-33.146 52-33.613 52 .677v114.445z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '0.1',
            transform: `scale(${scaleGrab}) translate(${grabX} ${grabY})`
         });
         svg.appendChild(hand);
         break;

      case 'select':
         const scaleSelect = 0.05;
         const selectX = 280;
         const selectY = 45;

         const select = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(select, {
            d: 'M318.4 304.5c-3.531 9.344-12.47 15.52-22.45 15.52h-105l45.15 94.82c9.496 19.94 1.031 43.8-18.91 53.31c-19.95 9.504-43.82 1.035-53.32-18.91L117.3 351.3l-75 88.25c-4.641 5.469-11.37 8.453-18.28 8.453c-2.781 0-5.578-.4844-8.281-1.469C6.281 443.1 0 434.1 0 423.1V56.02c0-9.438 5.531-18.03 14.12-21.91C22.75 30.26 32.83 31.77 39.87 37.99l271.1 240C319.4 284.6 321.1 295.1 318.4 304.5z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '0.1',
            transform: `scale(${scaleSelect}) translate(${selectX} ${selectY})`
         });
         svg.appendChild(select);
         break;

      case 'delete':
         const scaleDelete = 0.74;
         const deleteX = 7;
         const deleteY = 1;

         const bin = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(bin, {
            d: 'M28,40H11.8c-3.3,0-5.9-2.7-5.9-5.9V16c0-0.6,0.4-1,1-1s1,0.4,1,1v18.1c0,2.2,1.8,3.9,3.9,3.9H28c2.2,0,3.9-1.8,3.9-3.9V16   c0-0.6,0.4-1,1-1s1,0.4,1,1v18.1C33.9,37.3,31.2,40,28,40z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '1',
            transform: `scale(${scaleDelete}) translate(${deleteX} ${deleteY})`
         });

         const lid = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(lid, {
            d: 'M33.3,4.9h-7.6C25.2,2.1,22.8,0,19.9,0s-5.3,2.1-5.8,4.9H6.5c-2.3,0-4.1,1.8-4.1,4.1S4.2,13,6.5,13h26.9   c2.3,0,4.1-1.8,4.1-4.1S35.6,4.9,33.3,4.9z M19.9,2c1.8,0,3.3,1.2,3.7,2.9h-7.5C16.6,3.2,18.1,2,19.9,2z M33.3,11H6.5   c-1.1,0-2.1-0.9-2.1-2.1c0-1.1,0.9-2.1,2.1-2.1h26.9c1.1,0,2.1,0.9,2.1,2.1C35.4,10.1,34.5,11,33.3,11z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '1',
            transform: `scale(${scaleDelete}) translate(${deleteX} ${deleteY})`
         });

         const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(line, {
            d: 'M12.9,35.1c-0.6,0-1-0.4-1-1V17.4c0-0.6,0.4-1,1-1s1,0.4,1,1v16.7C13.9,34.6,13.4,35.1,12.9,35.1z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '1',
            transform: `scale(${scaleDelete}) translate(${deleteX} ${deleteY})`
         });

         const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(line2, {
            d: 'M26.9,35.1c-0.6,0-1-0.4-1-1V17.4c0-0.6,0.4-1,1-1s1,0.4,1,1v16.7C27.9,34.6,27.4,35.1,26.9,35.1z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '1',
            transform: `scale(${scaleDelete}) translate(${deleteX} ${deleteY})`
         });

         const line3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(line3, {
            d: 'M19.9,35.1c-0.6,0-1-0.4-1-1V17.4c0-0.6,0.4-1,1-1s1,0.4,1,1v16.7C20.9,34.6,20.4,35.1,19.9,35.1z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '1',
            transform: `scale(${scaleDelete}) translate(${deleteX} ${deleteY})`
         });
         svg.appendChild(bin);
         svg.appendChild(lid);
         svg.appendChild(line);
         svg.appendChild(line2);
         svg.appendChild(line3);
         break;
      
      case 'translate':
         const scaleTranslate = 0.85;
         const translateX = 10;
         const translateY = 4;

         const rightArrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(rightArrow, {
            d: 'M28.75,17.77671a1.24991,1.24991,0,0,0-1.25,1.25,2.73109,2.73109,0,0,1-2.67578,2.77734H9.122l3.48254-3.57227a1.25,1.25,0,0,0-1.78906-1.74609L5.2627,22.181a1.25046,1.25046,0,0,0,0,1.7461l5.55273,5.69531a1.25,1.25,0,1,0,1.78906-1.7461L9.122,24.30405H24.8418c.00653,0,.0119-.00366.01837-.00366A5.23207,5.23207,0,0,0,30,19.02671,1.24991,1.24991,0,0,0,28.75,17.77671Z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '0.1',
            transform: `scale(${scaleTranslate}) translate(${translateX} ${translateY})` 
         });

         const leftArrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(leftArrow, {
            d: 'M20.87805,8.19467l-3.48254,3.57227A1.25,1.25,0,1,0,19.18457,13.513L24.7373,7.81772a1.25045,1.25045,0,0,0,0-1.74609L19.18457.37631a1.25,1.25,0,1,0-1.78906,1.7461l3.48254,3.57226H5.1582c-.00653,0-.0119.00367-.01837.00367A5.23207,5.23207,0,0,0,0,10.972a1.25,1.25,0,0,0,2.5,0A2.7311,2.7311,0,0,1,5.17578,8.19467Z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '0.1',
            transform: `scale(${scaleTranslate}) translate(${translateX} ${translateY})` 
         });
   
         svg.appendChild(rightArrow);
         svg.appendChild(leftArrow);
         break;

      case 'preset':
         const scalePreset = 0.85;
         const presetX = 5;
         const presetY = 2;

         const chart = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(chart, {
            d: 'M24,10h4a2,2,0,0,0,2-2V4a2,2,0,0,0-2-2H24a2,2,0,0,0-2,2V5H19a2,2,0,0,0-2,2v8H14V12a2,2,0,0,0-2-2H4a2,2,0,0,0-2,2v8a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V17h3v8a2,2,0,0,0,2,2h3v1a2,2,0,0,0,2,2h4a2,2,0,0,0,2-2V24a2,2,0,0,0-2-2H24a2,2,0,0,0-2,2v1H19V17h3v1a2,2,0,0,0,2,2h4a2,2,0,0,0,2-2V14a2,2,0,0,0-2-2H24a2,2,0,0,0-2,2v1H19V7h3V8A2,2,0,0,0,24,10ZM12,20H4V12h8Zm12,4h4v4H24Zm0-10h4v4H24ZM24,4h4V8H24Z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '0.1',
            transform: `scale(${scalePreset}) translate(${presetX} ${presetY})` // rotate(90, 17, 17)  
         });
         svg.appendChild(chart);
         break;

      case 'help':
         const scaleHelp = 0.06;
         const helpX = 85;
         const helpY = 0;

         const curve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(curve, {
            d: 'M345.1,77.1C317.6,56.2,286.6,49,247.3,49c-29.8,0-55.3,6.1-75.5,19.7C142,89,128,123.1,128,177h76.8   c0-14.4-1.4-29.9,7-43.2c8.4-13.3,20.1-23.5,40.2-23.5c20.4,0,30.9,5.9,40.8,18.1c8.4,10.4,11.6,22.8,11.6,36   c0,11.4-5.8,21.9-12.7,31.4c-3.8,5.6-8.8,10.6-15.1,15.4c0,0-41.5,24.7-56.1,48.1c-10.9,17.4-14.8,39.2-15.7,65.3   c-0.1,1.9,0.6,5.8,7.2,5.8c6.5,0,56,0,61.8,0c5.8,0,7-4.4,7.1-6.2c0.4-9.5,1.6-24.1,3.3-29.6c3.3-10.4,9.7-19.5,19.7-27.3   l20.7-14.3c18.7-14.6,33.6-26.5,40.2-35.9c11.3-15.4,19.2-34.4,19.2-56.9C384,123.5,370.5,96.4,345.1,77.1z M242,370.2   c-25.9-0.8-47.3,17.2-48.2,45.3c-0.8,28.2,19.5,46.7,45.5,47.5c27,0.8,47.9-16.6,48.7-44.7C288.8,390.2,269,371,242,370.2z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '0.1',
            transform: `scale(${scaleHelp}) translate(${helpX} ${helpY})`
         });
         svg.appendChild(curve);
         break;

      case 'task':
         const scaleTask = 1.5;
         const taskX = 1;
         const taskY = -1;

         const board = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(board, {
            d: 'M5 22h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2h-2a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1H5c-1.103 0-2 .897-2 2v15c0 1.103.897 2 2 2zM5 5h2v2h10V5h2v15H5V5z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '0.1',
            transform: `scale(${scaleTask}) translate(${taskX} ${taskY})`
         });

         const check = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(check, {
            d: 'm11 13.586-1.793-1.793-1.414 1.414L11 16.414l5.207-5.207-1.414-1.414z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '0.1',
            transform: `scale(${scaleTask}) translate(${taskX} ${taskY})`
         });
         svg.appendChild(board);
         svg.appendChild(check);
         break;

      case 'setting':
         const scaleSetting = 0.22;
         const settingX = 30;
         const settingY = 7;

         const wheel = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(wheel, {
            d: 'M64,39A25,25,0,1,0,89,64,25,25,0,0,0,64,39Zm0,44A19,19,0,1,1,83,64,19,19,0,0,1,64,83Z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '3',
            transform: `scale(${scaleSetting}) translate(${settingX} ${settingY})`
         });

         const gear = document.createElementNS('http://www.w3.org/2000/svg', 'path');
         setAttributeList(gear, {
            d: 'M121,48h-8.93a1,1,0,0,1-.94-.68,49.9,49.9,0,0,0-2-4.85,1,1,0,0,1,.18-1.15L115.62,35a7,7,0,0,0,0-9.9L102.89,12.38a7,7,0,0,0-9.9,0l-6.31,6.31a1,1,0,0,1-1.15.18,49.76,49.76,0,0,0-4.85-2,1,1,0,0,1-.68-.94V7a7,7,0,0,0-7-7H55a7,7,0,0,0-7,7v8.93a1,1,0,0,1-.68.94,49.9,49.9,0,0,0-4.85,2,1,1,0,0,1-1.15-.18L35,12.38a7,7,0,0,0-9.9,0L12.38,25.11a7,7,0,0,0,0,9.9l6.31,6.31a1,1,0,0,1,.18,1.15,49.76,49.76,0,0,0-2,4.85,1,1,0,0,1-.94.68H7a7,7,0,0,0-7,7V73a7,7,0,0,0,7,7h8.93a1,1,0,0,1,.94.68,49.9,49.9,0,0,0,2,4.85,1,1,0,0,1-.18,1.15L12.38,93a7,7,0,0,0,0,9.9l12.73,12.73a7,7,0,0,0,9.9,0l6.31-6.31a1,1,0,0,1,1.15-.18,49.76,49.76,0,0,0,4.85,2,1,1,0,0,1,.68.94V121a7,7,0,0,0,7,7H73a7,7,0,0,0,7-7v-8.93a1,1,0,0,1,.68-.94,49.9,49.9,0,0,0,4.85-2,1,1,0,0,1,1.15.18L93,115.62a7,7,0,0,0,9.9,0l12.73-12.73a7,7,0,0,0,0-9.9l-6.31-6.31a1,1,0,0,1-.18-1.15,49.76,49.76,0,0,0,2-4.85,1,1,0,0,1,.94-.68H121a7,7,0,0,0,7-7V55A7,7,0,0,0,121,48Zm1,25a1,1,0,0,1-1,1h-8.93a7,7,0,0,0-6.6,4.69,43.9,43.9,0,0,1-1.76,4.26,7,7,0,0,0,1.35,8l6.31,6.31a1,1,0,0,1,0,1.41L98.65,111.38a1,1,0,0,1-1.41,0l-6.31-6.31a7,7,0,0,0-8-1.35,43.88,43.88,0,0,1-4.27,1.76,7,7,0,0,0-4.68,6.6V121a1,1,0,0,1-1,1H55a1,1,0,0,1-1-1v-8.93a7,7,0,0,0-4.69-6.6,43.9,43.9,0,0,1-4.26-1.76,7,7,0,0,0-8,1.35l-6.31,6.31a1,1,0,0,1-1.41,0L16.62,98.65a1,1,0,0,1,0-1.41l6.31-6.31a7,7,0,0,0,1.35-8,43.88,43.88,0,0,1-1.76-4.27A7,7,0,0,0,15.93,74H7a1,1,0,0,1-1-1V55a1,1,0,0,1,1-1h8.93a7,7,0,0,0,6.6-4.69,43.9,43.9,0,0,1,1.76-4.26,7,7,0,0,0-1.35-8l-6.31-6.31a1,1,0,0,1,0-1.41L29.35,16.62a1,1,0,0,1,1.41,0l6.31,6.31a7,7,0,0,0,8,1.35,43.88,43.88,0,0,1,4.27-1.76A7,7,0,0,0,54,15.93V7a1,1,0,0,1,1-1H73a1,1,0,0,1,1,1v8.93a7,7,0,0,0,4.69,6.6,43.9,43.9,0,0,1,4.26,1.76,7,7,0,0,0,8-1.35l6.31-6.31a1,1,0,0,1,1.41,0l12.73,12.73a1,1,0,0,1,0,1.41l-6.31,6.31a7,7,0,0,0-1.35,8,43.88,43.88,0,0,1,1.76,4.27,7,7,0,0,0,6.6,4.68H121a1,1,0,0,1,1,1Z',
            fill: 'white',
            stroke: 'white',
            'stroke-width': '3',
            transform: `scale(${scaleSetting}) translate(${settingX} ${settingY})`
         });
         svg.appendChild(wheel);
         svg.appendChild(gear);
         break;

      // Task Menü 
      case 'addTask':
         setAttributeList(text, {
            x: '120',
            y: '22',
            fill: 'white',
            'text-anchor': 'middle',
            'font-size': '16',
            'font-family': 'Arial'
         });
         text.textContent = 'Arbeitsauftrag hinzufügen';
         svg.appendChild(text);
         break;

      // Help Menü 
      case 'addHelp':
         setAttributeList(text, {
            x: '70',
            y: '22',
            fill: 'white',
            'text-anchor': 'middle',
            'font-size': '16',
            'font-family': 'Arial'
         });
         text.textContent = 'Hinweis hinzufügen';
         svg.appendChild(text);
         break;

      // Translate Menü
      case 'naturalLanguage':
         setAttributeList(text, {
            x: '70',
            y: '22',
            fill: 'white',
            'text-anchor': 'middle',
            'font-size': '16',
            'font-family': 'Arial'
         });
         text.textContent = 'Natürliche Sprache';
         svg.appendChild(text);
         break;
      case 'pseudoCode':
         setAttributeList(text, {
            x: '70',
            y: '22',
            fill: 'white',
            'text-anchor': 'middle',
            'font-size': '16',
            'font-family': 'Arial'
         });
         text.textContent = 'Pseudocode';
         svg.appendChild(text);
         break;

      default:
         console.log('Unbekannte SVG Bezeichnung');
   }

   return svg;
}