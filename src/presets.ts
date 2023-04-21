/**
 * Hier sind die verschiedenen vorgespeicherten Informationen hinterlegt.
 * 
 * defaultHelpItems: Standardtipps zur Bedingung der Anwendung.
 * 
 * flowchartPresets: Presets von vorgefertigten Beispielen für verschiedene PAP Sequenzen.
 * 
 */

import { GraphNodeData, ItemList } from "./definitions";

 
export const defaultHelpItems: ItemList[] = [
   {
      titel: 'Verbindungen zeichnen',
      content: 'Klicke ein Element an. Es sollen verschiedene Ankerpunkte erscheinen. Fahre mit der Maus über einen dieser Ankerpunkte. Wenn dieser hervorgehoben wird, ziehe an diesem und führe die Linie zu dem gewünschten Knoten. Die Verbindungsstelle wird anhand des am nächsten liegenden Ankerpunkt gewählt. '
   },
   {
      titel: 'Vorgefertige Beispiele',
      content: 'Klicke oben rechts den Button links neben den ? an. Nun werden dir verschiedene Presets von PAP-Sequenzen angezeigt, welche du dir erzeugen lassen kannst. '
   }
];

// Presets von verschiedenen PAP-Sequenzen die erzeugt werden können
export const flowchartPresets: { name: string, graphElements: GraphNodeData[] } [] = [
   {
      name: 'Beispiel',
      graphElements: [
         {
            id: "0ac439b0-7b5e-4648-989d-61712e63ee57",
            node: "start",
            text: "Start",
            x: 769,
            y: 86.5,
            connections: [
               { anchor: 2, direction: "to", connectedToId: "4fcfbda4-65e6-489b-825e-0641d358c087" }
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
               { anchor: 2, direction: "to", connectedToId: "04893012-47f7-4e75-93b9-cbe58910e18a" }
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
               { anchor: 2, direction: "to", connectedToId: "812ce303-a1a3-46e1-84b4-ff2cdc5c819a" }
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
               { anchor: 2, direction: "to", connectedToId: "812ce303-a1a3-46e1-84b4-ff2cdc5c819a" }
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
               { anchor: 0, direction: "from", connectedToId: "9533930b-1a71-4e14-a207-24e6b356a595" }
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
               { anchor: 2, direction: "to", connectedToId: "85824bad-03cf-47b5-a2b7-7f691419fa7f" }
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
               { anchor: 2, direction: "to", connectedToId: "85824bad-03cf-47b5-a2b7-7f691419fa7f" }
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
               { anchor: 1, direction: "to", connectedToId: "9533930b-1a71-4e14-a207-24e6b356a595" }
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
               { anchor: 2, direction: "to", connectedToId: "9775752f-d69b-4fd2-9232-6bc4c377bd92" }
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
   {
      name: 'If/Else',
      graphElements: [
         {
            id: '667f8666-a3d0-4fdb-a9ee-61b51ec9ff74',
            node: 'op',
            text: 'Sonst ____',
            x: 944,
            y: 284.5,
            connections: [
               { anchor: 3, direction: 'from', connectedToId: 'bcc936b5-66b3-4fe7-85c1-7131cad9f181' }
            ],
         },
         {
            id: 'a6175565-44eb-4198-a151-5ca5b8d4ae8c',
            node: 'op',
            text: 'Dann ___',
            x: 714,
            y: 430.5,
            connections: [
               { anchor: 0, direction: 'from', connectedToId: 'bcc936b5-66b3-4fe7-85c1-7131cad9f181' }
            ],
         },
         {
            id: '8096199c-7395-43d3-a3f3-38e32668e856',
            node: 'text',
            text: 'Ja',
            x: 713,
            y: 358.5,
         },
         {
            id: '22d7f57f-4666-4f00-b613-0c47aadd91ea',
            node: 'text',
            text: 'Nein',
            x: 858,
            y: 271.5,
         },
         {
            id: 'bcc936b5-66b3-4fe7-85c1-7131cad9f181',
            node: 'decision',
            text: ' Gilt ___ ? ',
            x: 695,
            y: 284.5,
            connections: [
               { anchor: 2, direction: 'to', connectedToId: 'a6175565-44eb-4198-a151-5ca5b8d4ae8c' },
               { anchor: 1, direction: 'to', connectedToId: '667f8666-a3d0-4fdb-a9ee-61b51ec9ff74' }
            ],
         },
      ],
   },
   {
      name: "For-Schleife",
      graphElements: [
         {
            id: "421574d8-e295-4bd8-bbe1-de4b0a6da8a2",
            node: "op",
            text: "i = Anfangswert",
            x: 711,
            y: 240.5,
            connections: [
               { anchor: 2, direction: "to", connectedToId: "e7569340-e932-4ec9-a92f-5a3e0ebe51f1" }
            ],
         },
         {
            id: "6fe31b50-fbab-46b8-b0aa-8018a7418e3d",
            node: "op",
            text: "i = i + Schrittwert",
            x: 692,
            y: 439.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "e7569340-e932-4ec9-a92f-5a3e0ebe51f1" },
               { anchor: 2, direction: "to", connectedToId: "88d004c1-5e41-4314-b035-fbb100e8698e" }
            ],
         },
         {
            id: "8816955c-00e6-4662-85cb-deaf2b8a8e22",
            node: "connector",
            text: "",
            x: 583,
            y: 445.5,
            connections: [ 
               { anchor: 2, direction: "from", connectedToId: "88d004c1-5e41-4314-b035-fbb100e8698e" },
               { anchor: 0, direction: "to", connectedToId: "e7569340-e932-4ec9-a92f-5a3e0ebe51f1" }
            ],
         },
         {
            id: "e7569340-e932-4ec9-a92f-5a3e0ebe51f1",
            node: "decision",
            text: " i < Endwert? ",
            x: 716,
            y: 339.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "421574d8-e295-4bd8-bbe1-de4b0a6da8a2" },
               { anchor: 1, direction: "to", connectedToId: "b837b0ca-3e70-44c1-b434-01e34800ccfc" },
               { anchor: 2, direction: "to", connectedToId: "6fe31b50-fbab-46b8-b0aa-8018a7418e3d" },
               { anchor: 3, direction: "from", connectedToId: "8816955c-00e6-4662-85cb-deaf2b8a8e22" },
            ],
         },
         {
            id: "b837b0ca-3e70-44c1-b434-01e34800ccfc",
            node: "connector",
            text: "",
            x: 972,
            y: 604.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "e7569340-e932-4ec9-a92f-5a3e0ebe51f1" }
            ],
         },
         {
            id: "88d004c1-5e41-4314-b035-fbb100e8698e",
            node: "op",
            text: "Anweisungen...",
            x: 716,
            y: 530.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "6fe31b50-fbab-46b8-b0aa-8018a7418e3d" },
               { anchor: 2, direction: "to", connectedToId: "8816955c-00e6-4662-85cb-deaf2b8a8e22" }
            ],
         },
         {
            id: "fd354cb2-1bc5-4dfd-ab1f-63ca4746e286",
            node: "text",
            text: "wahr",
            x: 733,
            y: 385.5,
         },
         {
            id: "55c1a076-f4fa-4126-828b-ef21d7415d0a",
            node: "text",
            text: "falsch",
            x: 890,
            y: 322.5,
         },
      ]
   },
   // Füge hier weitere Presets hinzu
];