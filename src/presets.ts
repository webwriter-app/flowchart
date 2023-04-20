// Presets von verschiedenen PAPs die erzeugt werden können

export const flowchartPresets = [
   {
      name: 'Beispiel',
      graphElements:
         [
            {
               id: "0ac439b0-7b5e-4648-989d-61712e63ee57",
               node: "start",
               text: "Start",
               x: 769,
               y: 86.5,
               connections: [
                  { anchor: 2, direction: "to", connectedToId: "4fcfbda4-65e6-489b-825e-0641d358c087" },
               ],
            },
            {
               id: "4fcfbda4-65e6-489b-825e-0641d358c087",
               node: "i/o",
               text: 'Eingabe: Tipp = "Kopf" oder "Zahl"',
               x: 630,
               y: 154.5,
               connections: [
                  { anchor: 0, direction: "from", connectedToId: "0ac439b0-7b5e-4648-989d-61712e63ee57" },
                  { anchor: 2, direction: "to", connectedToId: "04893012-47f7-4e75-93b9-cbe58910e18a" },
               ],
            },
            {
               id: "04893012-47f7-4e75-93b9-cbe58910e18a",
               node: "op",
               text: "Zufallszahl: randInt (0, 1)",
               x: 664,
               y: 240.5,
               connections: [
                  { anchor: 0, direction: "from", connectedToId: "4fcfbda4-65e6-489b-825e-0641d358c087" },
                  { anchor: 2, direction: "to", connectedToId: "7f76385a-caf3-4c65-a72e-665b50ef9787" },
               ],
            },
            {
               id: "7f76385a-caf3-4c65-a72e-665b50ef9787",
               node: "decision",
               text: " Zufallszahl == 0? ",
               x: 702,
               y: 316.5,
               connections: [
                  { anchor: 0, direction: "from", connectedToId: "04893012-47f7-4e75-93b9-cbe58910e18a" },
                  { anchor: 2, direction: "to", connectedToId: "9e067393-c167-4157-8104-10cfa4b2a8de" },
                  { anchor: 2, direction: "to", connectedToId: "43375730-48f0-4e07-8ba9-686672b8cb26" },
               ],
            },
            {
               id: "9e067393-c167-4157-8104-10cfa4b2a8de",
               node: "op",
               text: 'Seite = "Kopf"',
               x: 550,
               y: 422.5,
               connections: [
                  { anchor: 0, direction: "from", connectedToId: "7f76385a-caf3-4c65-a72e-665b50ef9787" },
                  { anchor: 2, direction: "to", connectedToId: "812ce303-a1a3-46e1-84b4-ff2cdc5c819a" },
               ],
            },
            {
               id: "43375730-48f0-4e07-8ba9-686672b8cb26",
               node: "op",
               text: 'Seite = "Zahl"',
               x: 920,
               y: 422.5,
               connections: [
                 { anchor: 0, direction: "from", connectedToId: "7f76385a-caf3-4c65-a72e-665b50ef9787" },
                 { anchor: 2, direction: "to", connectedToId: "812ce303-a1a3-46e1-84b4-ff2cdc5c819a" },
               ],
            },
            {
               id: "85824bad-03cf-47b5-a2b7-7f691419fa7f",
               node: "end",
               text: "Ende",
               x: 773,
               y: 772.5,
               connections: [
                  { anchor: 0, direction: "from", connectedToId: "68e5723f-1985-4d87-ac52-0230430c7d49" },
                  { anchor: 0, direction: "from", connectedToId: "9533930b-1a71-4e14-a207-24e6b356a595" },
               ],
            },
            {
               id: "9533930b-1a71-4e14-a207-24e6b356a595",
               node: "i/o",
               text: 'Ausgabe: "Verloren"',
               x: 912,
               y: 669.5,
               connections: [
                  { anchor: 0, direction: "from", connectedToId: "9775752f-d69b-4fd2-9232-6bc4c377bd92" },
                  { anchor: 2, direction: "to", connectedToId: "85824bad-03cf-47b5-a2b7-7f691419fa7f" },
               ],
            },
            {
               id: "68e5723f-1985-4d87-ac52-0230430c7d49",
               node: "i/o",
               text: 'Ausgabe: "Gewonnen"',
               x: 510,
               y: 669.5,
               connections: [
                  { anchor: 0, direction: "from", connectedToId: "9775752f-d69b-4fd2-9232-6bc4c377bd92" },
                  { anchor: 2, direction: "to", connectedToId: "85824bad-03cf-47b5-a2b7-7f691419fa7f" },
               ],
            },
            {
               id: "9775752f-d69b-4fd2-9232-6bc4c377bd92",
               node: "decision",
               text: " Seite == Tipp? ",
               x: 719,
               y: 603.5,
               connections: [
                  { anchor: 0, direction: "from", connectedToId: "812ce303-a1a3-46e1-84b4-ff2cdc5c819a" },
                  { anchor: 3, direction: "to", connectedToId: "68e5723f-1985-4d87-ac52-0230430c7d49" },
                  { anchor: 1, direction: "to", connectedToId: "9533930b-1a71-4e14-a207-24e6b356a595" },
               ],
            },
            {
               id: "812ce303-a1a3-46e1-84b4-ff2cdc5c819a",
               node: "i/o",
               text: "Ausgabe: Seite",
               x: 728,
               y: 526.5,
               connections: [
                  { anchor: 0, direction: "from", connectedToId: "9e067393-c167-4157-8104-10cfa4b2a8de" },
                  { anchor: 0, direction: "from", connectedToId: "43375730-48f0-4e07-8ba9-686672b8cb26" },
                  { anchor: 2, direction: "to", connectedToId: "9775752f-d69b-4fd2-9232-6bc4c377bd92" },
               ],
            },
            {
               id: "81862008-cf17-43d2-8864-6d39f5e0e457",
               node: "text",
               text: "Ja",
               x: 669,
               y: 355.5,
            },
            {
               id: "957feea9-a33f-4126-86cc-d7f88bdeb7fc",
               node: "text",
               text: "Nein",
               x: 898,
               y: 353.5,
            },
            {
               id: "25fcf5bb-c4d9-4973-830f-4ad4d4fcf62c",
               node: "text",
               text: "Ja",
               x: 642,
               y: 586.5,
            },
            {
               id: "6088b976-51fb-41e5-a0ec-8cb072963498",
               node: "text",
               text: "Nein",
               x: 930,
               y: 583.5,
            },
         ]
   },
   // Füge hier weitere Presets hinzu
];