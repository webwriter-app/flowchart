// --------------- Funktionen zum Zeichnen der Elemente ---------------

// Zeichnet die Verbindungspfeile zwischen den Elementen
export function drawArrow(ctx: CanvasRenderingContext2D, from: { x: number; y: number; anchor?: number }, to: { x: number; y: number; anchor?: number }, isSelected: boolean = false, returnPoints = false) {

    const headLength = 8;
    const padding = 15; // Raum zwischen Elementen und Pfeil
  
    let points: { x: number; y: number }[] = [from];
  
    if (from && to) {
 
        // Halte die Positionen der Knoten zueinander fest
        const isAbove = to.y < from.y;
        const isLeft = to.x < from.x;
        
        // Zum Zeichnen der Verbindungen zwischen zwei Knoten 
        // werden verschiedene Punkte in dem Array points festgehalten.
        // Je nach Position zueinander sind die Punkte anders und müssen daher überprüft werden.
        // SA - Startanker; ZA - Zielanker; 

        if (from.anchor === 0 ) {           // SA oben (0) 
            points.push({ x: from.x, y: from.y - padding });

            if (to. anchor === 0) {         // SA oben -> ZA oben
                if (isAbove) {
                    points.push({ x: from.x, y: to.y - padding });
                    points.push({ x: to.x, y: to.y - padding }); 
                } else {
                    points.push({ x: to.x, y: from.y - padding});
                }
            } else if (to.anchor === 1) {   // SA oben -> ZA rechts
                if (isAbove) {
                    if (isLeft) {
                        points.push({ x: from.x, y: to.y });
                    } else {
                        points.push({ x: from.x, y: (from.y + to.y) / 2 });
                        points.push({ x: to.x + padding, y: (from.y + to.y) / 2 });
                        points.push({ x: to.x + padding, y: to.y });
                    }
                } else {
                    if (isLeft) {
                        points.push({ x: (from.x + to.x) / 2, y: from.y - padding });
                        points.push({ x: (from.x + to.x) / 2, y: to.y });
                    } else {
                        points.push({ x: to.x + padding, y: from.y - padding });
                        points.push({ x: to.x + padding, y: to.y });
                    }
                }
            } else if (to.anchor === 2) {   // SA oben -> ZA unten
                if (isAbove) {
                    points.push({ x: from.x, y: (from.y + to.y) / 2 });
                    points.push({ x: to.x, y: (from.y + to.y) / 2 }); 
                } else {
                    points.push({ x: (from.x + to.x) / 2, y: from.y - padding });
                    points.push({ x: (from.x + to.x) / 2, y: to.y + padding });
                    points.push({ x: to.x, y: to.y + padding });
                }
            } else if (to.anchor === 3) {   // SA oben -> ZA links
                if (isAbove) {
                    if (isLeft) {
                        points.push({ x: from.x, y: (from.y + to.y) / 2 }); 
                        points.push({ x: to.x - padding, y: (from.y + to.y) / 2 }); 
                        points.push({ x: to.x - padding, y: to.y }); 
                    } else {
                        points.push({ x: from.x, y: to.y });
                    }
                } else {
                    if (isLeft) {
                        points.push({ x: to.x - padding, y: from.y - padding }); 
                        points.push({ x: to.x - padding, y: to.y })
                    } else {
                        points.push({ x: (from.x + to.x) / 2 , y: from.y - padding }); 
                        points.push({ x: (from.x + to.x) / 2 , y: to.y }); 
                    }
                }
            }
        } else if (from.anchor === 1) {     // SA rechts (1)
            points.push({ x: from.x + padding, y: from.y });

            if (to.anchor === 0) {          // SA rechts -> ZA oben
                if (isAbove) {
                    if (isLeft) {
                        points.push({ x: from.x + padding, y: to.y - padding });
                        points.push({ x: to.x, y: to.y - padding });
                    } else {
                        points.push({ x: (from.x + to.x) / 2, y: from.y });
                        points.push({ x: (from.x + to.x) / 2, y: to.y - padding});
                        points.push({ x: to.x, y: to.y - padding});
                    }
                } else {
                    if (isLeft) {
                        points.push({ x: from.x + padding, y: to.y - padding });
                        points.push({ x: to.x, y: to.y - padding });
                    } else {
                        points.push({ x: to.x, y: from.y });
                    }
                }
            } else if (to.anchor === 1) {   // SA rechts -> ZA rechts
                if (isLeft) {
                    points.push({ x: from.x + padding, y: to.y });
                } else {
                    points.push({ x: to.x + padding, y: from.y });
                    points.push({ x: to.x + padding, y: to.y });
                }
            } else if (to.anchor === 2) {   // SA rechts -> ZA unten 
                if (isLeft) {
                    if (isAbove) {
                        points.push({ x: from.x + padding, y: (from.y + to.y) / 2 });
                        points.push({ x: to.x, y: (from.y + to.y) / 2 });
                    } else {
                        points.push({ x: from.x + padding, y: to.y + padding });
                        points.push({ x: to.x, y: to.y + padding });
                    }
                } else {
                    if (isAbove) {
                        points.push({ x: to.x, y: from.y });
                    } else {
                        points.push({ x: (from.x + to.x) / 2 , y: from.y });
                        points.push({ x: (from.x + to.x) / 2 , y: to.y + padding });
                        points.push({ x: to.x , y: to.y + padding });
                    }
                }
            } else if (to.anchor === 3) {   // SA rechts -> ZA links 
                if (isLeft) {
                    points.push({ x: from.x + padding, y: (from.y + to.y) / 2 });
                    points.push({ x: to.x - padding, y: (from.y + to.y) / 2 });
                    points.push({ x: to.x - padding, y: to.y });
                } else {
                    points.push({ x: (from.x + to.x) / 2 , y: from.y });
                    points.push({ x: (from.x + to.x) / 2 , y: to.y });
                }
            }
        } else if (from.anchor === 2) {     // SA unten (2)
            points.push({ x: from.x, y: from.y + padding });

            if (to.anchor === 0) {          // SA unten -> ZA oben
                if (isAbove) {
                    points.push({ x: (from.x + to.x) / 2, y: from.y + padding });
                    points.push({ x: (from.x + to.x) / 2, y: to.y - padding });
                    points.push({ x: to.x, y: to.y - padding });
                } else {
                    points.push({ x: from.x, y: (from.y + to.y) / 2 });
                    points.push({ x: to.x, y: (from.y + to.y) / 2 });
                }
            } else if (to.anchor === 1) {   // SA unten -> ZA rechts
                if (!isLeft) {
                    points.push({ x: to.x + padding, y: from.y + padding });
                    points.push({ x: to.x + padding, y: to.y });
                } else {
                    if (isAbove) {
                        points.push({ x: (from.x + to.x) / 2, y: from.y + padding });
                        points.push({ x: (from.x + to.x) / 2, y: to.y });
                    } else {
                        points.push({ x: from.x, y: to.y })
                    }
                }
            } else if (to.anchor === 2) {   // SA unten -> ZA unten
                if (isAbove) {
                    points.push({ x: to.x, y: from.y + padding });
                } else {
                    points.push({ x: from.x, y: to.y + padding });
                    points.push({ x: to.x, y: to.y + padding });
                }
            } else if (to.anchor === 3) {   // SA unten -> ZA links
                if (isLeft) {
                    if (isAbove) {
                        points.push({ x: to.x - padding, y: from.y + padding });
                        points.push({ x: to.x - padding, y: to.y });
                    } else {
                        points.push({ x: from.x, y: (from.y + to.y) / 2 });
                        points.push({ x: to.x - padding, y: (from.y + to.y) / 2 });
                        points.push({ x: to.x - padding, y: to.y });
                    }
                } else {
                    if (isAbove) {
                        points.push({ x: (from.x + to.x) / 2, y: from.y + padding });
                        points.push({ x: (from.x + to.x) / 2, y: to.y });
                    } else {
                        points.push({ x: from.x, y: to.y })
                    }
                }
            }
        } else if (from.anchor === 3 ){     // SA links (3)
            points.push({ x: from.x - padding, y: from.y });
            if (to.anchor === 0) {          // SA links -> ZA oben
                if (!isLeft) {
                        if(isAbove) {
                            points.push({ x: from.x - padding, y: to.y - padding });
                            points.push({ x: to.x, y: to.y - padding});
                        } else {
                            points.push({ x: from.x - padding, y: (from.y + to.y) / 2 });
                            points.push({ x: to.x, y: (from.y + to.y) / 2 });
                        }
                } else {
                    if (isAbove) {
                        points.push({ x: (from.x + to.x) / 2, y: from.y });
                        points.push({ x: (from.x + to.x) / 2, y: to.y - padding });
                        points.push({ x: to.x, y: to.y - padding });
                    } else {
                        points.push({ x: to.x, y: from.y });
                    }
                }
            } else if (to.anchor === 1) {   // SA links -> ZA rechts
                if (isLeft) {
                    points.push({ x: (from.x + to.x) / 2, y: from.y });
                    points.push({ x: (from.x + to.x) / 2, y: to.y });
                } else {
                    points.push({ x: from.x - padding, y: (from.y + to.y) /2 });
                    points.push({ x: to.x + padding, y: (from.y + to.y) /2 });
                    points.push({ x: to.x + padding, y: to.y });
                }
            } else if (to.anchor === 2) {   // SA links -> ZA unten
                if (isAbove) {
                    if (isLeft) {
                        points.push({ x: to.x, y: from.y });
                    } else {
                        points.push({ x: from.x - padding, y: (from.y + to.y) /2 });
                        points.push({ x: to.x, y: (from.y + to.y) /2 });
                    }
                } else {
                    if (isLeft) {
                        points.push({ x: (from.x + to.x) / 2, y: from.y });
                        points.push({ x: (from.x + to.x) / 2, y: to.y + padding });
                        points.push({ x: to.x, y: to.y + padding });
                    } else {
                        points.push({ x: from.x - padding, y: to.y + padding });
                        points.push({ x: to.x, y: to.y + padding });
                    }
                }
            } else if (to.anchor === 3) {   // SA links -> ZA links
                if (isLeft) {
                    points.push({ x: to.x - padding, y: from.y });
                    points.push({ x: to.x - padding, y: to.y });
                } else {
                    points.push({ x: from.x - padding, y: to.y });
                }
            }

        } else {
            // Setze keine Punkte beim temporären Pfeil oder unbekannten Anker
        }
    }
  
    points.push(to);
   
     // Setze den Stil und zeichne die Verbindung
    ctx.strokeStyle = isSelected ? '#87cefa' : 'black';
    ctx.fillStyle = isSelected ? '#87cefa' : 'black';
    ctx.lineWidth = 2;

    ctx.beginPath();
    // Zeichne gestrichelte Linien, falls noch kein Zielelement ausgewählt wurde
    points.length > 2 ?  ctx.setLineDash([]) : ctx.setLineDash([5, 10]);    
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Zeichne den Pfeilkopf
    const angle = Math.atan2(to.y - points[points.length - 2].y, to.x - points[points.length - 2].x);
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headLength * Math.cos(angle - Math.PI / 6), to.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - headLength * Math.cos(angle + Math.PI / 6), to.y - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

 
    // Zeichne Ankerpunkte des Pfeils, wenn dieser angeklickt wurde
    if (isSelected) {
        drawAnchorArrow(ctx, from.anchor, points[0].x, points[0].y);
        drawAnchorArrow(ctx, to.anchor, points[points.length - 1].x, points[points.length - 1].y);
    }

     // Gib die Eckpunkte des Pfeils zum abspeichern zurück, falls returnPoints auf true gesetzt wurde
     if (returnPoints) {
        return points;
    }
}

// Zeichne die Ankerpunkte einer Verbindung
export function drawAnchorArrow (ctx: CanvasRenderingContext2D, anchor: number, x: number, y: number) {
    const drawAnchor = (x: number, y: number, radius: number, color: string) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    };
    
    const offSetAnchor = 0;

    switch (anchor) {
        case 0:
            drawAnchor(x, y - offSetAnchor, 5, 'red');
            break;
        case 1:
            drawAnchor(x + offSetAnchor, y, 5, 'red');
            break;
        case 2:
            drawAnchor(x, y + offSetAnchor, 5, 'red');
            break;
        case 3:
            drawAnchor(x - offSetAnchor, y, 5, 'red');
            break;
    }
};
