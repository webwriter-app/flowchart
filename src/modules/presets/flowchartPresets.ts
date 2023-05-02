import { GraphNode } from "../../definitions/GraphNode";

// Presets von verschiedenen PAP-Sequenzen die erzeugt werden können
export const flowchartPresets: { name: string, graphNodes: GraphNode[] } [] = [
   {
      name: 'Beispiel',
      graphNodes: [
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
               { anchor: 2, direction: "to", connectedToId: "9e067393-c167-4157-8104-10cfa4b2a8de", text: 'Ja' },
               { anchor: 2, direction: "to", connectedToId: "43375730-48f0-4e07-8ba9-686672b8cb26", text: 'Nein' },
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
               { anchor: 3, direction: "to", connectedToId: "68e5723f-1985-4d87-ac52-0230430c7d49", text: 'Ja' },
               { anchor: 1, direction: "to", connectedToId: "9533930b-1a71-4e14-a207-24e6b356a595", text: 'Nein' }
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
      ]
   },
   {
      name: 'If/Else',
      graphNodes: [
         {
            id: '667f8666-a3d0-4fdb-a9ee-61b51ec9ff74',
            node: 'op',
            text: 'Sonst ____',
            x: 980,
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
            id: 'bcc936b5-66b3-4fe7-85c1-7131cad9f181',
            node: 'decision',
            text: ' Gilt ___ ? ',
            x: 695,
            y: 284.5,
            connections: [
               { anchor: 2, direction: 'to', connectedToId: 'a6175565-44eb-4198-a151-5ca5b8d4ae8c', text: 'Ja' },
               { anchor: 1, direction: 'to', connectedToId: '667f8666-a3d0-4fdb-a9ee-61b51ec9ff74', text: 'Nein' }
            ],
         },
      ],
   },
   {
      name: "For-Schleife",
      graphNodes: [
         {
            id: "3b165c79-4247-4031-8399-edbff74ecc9a",
            node: "start",
            text: "Start",
            x: 759,
            y: 140.5,
            connections: [
               { anchor: 2, direction: "to", connectedToId: "421574d8-e295-4bd8-bbe1-de4b0a6da8a2" }
            ],
         },
         {
            id: "421574d8-e295-4bd8-bbe1-de4b0a6da8a2",
            node: "op",
            text: "i = Anfangswert",
            x: 711,
            y: 240.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "3b165c79-4247-4031-8399-edbff74ecc9a" },
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
               { anchor: 1, direction: "to", connectedToId: "b837b0ca-3e70-44c1-b434-01e34800ccfc", text: 'falsch' },
               { anchor: 2, direction: "to", connectedToId: "6fe31b50-fbab-46b8-b0aa-8018a7418e3d", text: 'wahr' },
               { anchor: 3, direction: "from", connectedToId: "8816955c-00e6-4662-85cb-deaf2b8a8e22" },
            ],
         },
         {
            id: "b837b0ca-3e70-44c1-b434-01e34800ccfc",
            node: "i/o",
            text: "Ausgabe: 'Schleife beendet'",
            x: 972,
            y: 604.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "e7569340-e932-4ec9-a92f-5a3e0ebe51f1" },
               { anchor: 2, direction: "to", connectedToId: "1a4bc46-e04a-48e5-a4c5-686105d034b9" }
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
            id: "1a4bc46-e04a-48e5-a4c5-686105d034b9",
            node: "end",
            text: "Ende",
            x: 749,
            y: 704.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "b837b0ca-3e70-44c1-b434-01e34800ccfc" }
            ],
         },
      ]
   },
   {
      name: "Verschachtelte If-Else-Struktur",
      graphNodes: [
         {
            id: "ec60c044-966d-4913-ba51-3a51f3c11b2d",
            node: "start",
            text: "Start",
            x: 782,
            y: 177.5,
            connections: [
               { anchor: 2, direction: "to", connectedToId: "6bdb42d6-e539-451b-80ac-0aa37fee1957" }
            ],
         },
         {
            id: "6bdb42d6-e539-451b-80ac-0aa37fee1957",
            node: "i/o",
            text: "Eingabe: x = true, y = true",
            x: 676,
            y: 255.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "ec60c044-966d-4913-ba51-3a51f3c11b2d" },
               { anchor: 2, direction: "to", connectedToId: "90357b4b-cb8b-4cdc-bd0e-9f63d3d7e8c8" }
            ],
         },
         {
            id: "90357b4b-cb8b-4cdc-bd0e-9f63d3d7e8c8",
            node: "decision",
            text: " x = true?",
            x: 758,
            y: 368.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "6bdb42d6-e539-451b-80ac-0aa37fee1957" },
               { anchor: 1, direction: "to", connectedToId: "b2a81fea-9f6f-47c2-a424-e921afb548e7" },
               { anchor: 2, direction: "to", connectedToId: "8b4634a3-3d13-46ff-8052-a641e1dbd4b8" }
            ],
         },
         {
            id: "b2a81fea-9f6f-47c2-a424-e921afb548e7",
            node: "decision",
            text: " y = true?",
            x: 912,
            y: 409.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "90357b4b-cb8b-4cdc-bd0e-9f63d3d7e8c8" },
               { anchor: 1, direction: "to", connectedToId: "508afb60-e714-4617-a0fc-e46ba3e90216" },
               { anchor: 2, direction: "to", connectedToId: "8b259ac0-53f4-4317-a181-16b7ace8b295" }
            ],
         },
         {
            id: "508afb60-e714-4617-a0fc-e46ba3e90216",
            node: "sub",
            text: "Unterprogramm",
            x: 1092,
            y: 469.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "b2a81fea-9f6f-47c2-a424-e921afb548e7" },
               { anchor: 2, direction: "to", connectedToId: "a45879cc-69ad-4f09-a611-91960c43a745" }
            ],
         },
         {
            id: "8b259ac0-53f4-4317-a181-16b7ace8b295",
            node: "i/o",
            text: "Ausgabe: y = true",
            x: 878,
            y: 484.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "b2a81fea-9f6f-47c2-a424-e921afb548e7" },
               { anchor: 2, direction: "to", connectedToId: "8b4634a3-3d13-46ff-8052-a641e1dbd4b8" }
            ],
         },
         {
            id: "8b4634a3-3d13-46ff-8052-a641e1dbd4b8",
            node: "i/o",
            text: "Ausgabe: x = true",
            x: 725,
            y: 553.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "90357b4b-cb8b-4cdc-bd0e-9f63d3d7e8c8" },
               { anchor: 1, direction: "from", connectedToId: "8b259ac0-53f4-4317-a181-16b7ace8b295" },
               { anchor: 2, direction: "to", connectedToId: "a45879cc-69ad-4f09-a611-91960c43a745" }
            ],
         },
         {
            id: "a45879cc-69ad-4f09-a611-91960c43a745",
            node: "end",
            text: "Ende",
            x: 981,
            y: 693.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "8b4634a3-3d13-46ff-8052-a641e1dbd4b8" },
               { anchor: 0, direction: "from", connectedToId: "508afb60-e714-4617-a0fc-e46ba3e90216" }
            ],
         }
      ]
   },
   {
      name: "Switch",
      graphNodes: [
         {
            id: "cedd5e2c-6d3c-4047-baa9-a319c9506e0a",
            node: "start",
            text: "Start",
            x: 807,
            y: 165.5,
            connections: [{ anchor: 2, direction: 'to', connectedToId: '388566d6-b420-4565-852f-65a368f9af7e' }]
          },
          {
            id: "388566d6-b420-4565-852f-65a368f9af7e",
            node: "i/o",
            text: "Eingabe: x = 1",
            x: 764,
            y: 258.5,
            connections: [
              { anchor: 0, direction: 'from', connectedToId: 'cedd5e2c-6d3c-4047-baa9-a319c9506e0a' },
              { anchor: 2, direction: 'to', connectedToId: '7d0107b2-18d8-4156-bdbc-fb4275c1458c' }
            ]
          },
          {
            id: "7d0107b2-18d8-4156-bdbc-fb4275c1458c",
            node: "decision",
            text: "switch: x",
            x: 788,
            y: 343.5,
            connections: [
              { anchor: 0, direction: 'from', connectedToId: '388566d6-b420-4565-852f-65a368f9af7e' },
              { anchor: 2, direction: 'to', connectedToId: '527d963a-f89c-4c74-8acd-99899d9f1c8d' },
              { anchor: 2, direction: 'to', connectedToId: '985068da-17e3-4cbf-9552-25a42cbe8d92' },
              { anchor: 2, direction: 'to', connectedToId: '8464cd27-869f-4ac5-bea5-14dd58360d3b' }
            ]
          },
          {
            id: "8464cd27-869f-4ac5-bea5-14dd58360d3b",
            node: "op",
            text: "y = \"Zwei\"",
            x: 1027,
            y: 421.5,
            connections: [
              { anchor: 0, direction: 'from', connectedToId: '7d0107b2-18d8-4156-bdbc-fb4275c1458c' },
              { anchor: 2, direction: 'to', connectedToId: 'b9424689-e105-4870-ad62-8365a2175caf' }
            ]
          },
          {
            id: "527d963a-f89c-4c74-8acd-99899d9f1c8d",
            node: "op",
            text: "y = \"Null\"",
            x: 585,
            y: 421.5,
            connections: [
              { anchor: 0, direction: 'from', connectedToId: '7d0107b2-18d8-4156-bdbc-fb4275c1458c' },
              { anchor: 2, direction: 'to', connectedToId: 'b9424689-e105-4870-ad62-8365a2175caf' }
            ]
          },
          {
            id: "b9424689-e105-4870-ad62-8365a2175caf",
            node: "i/o",
            text: "Ausgabe: y",
            x: 786,
            y: 580.5,
            connections: [
              { anchor: 0, direction: 'from', connectedToId: '527d963a-f89c-4c74-8acd-99899d9f1c8d' },
              { anchor: 0, direction: 'from', connectedToId: '985068da-17e3-4cbf-9552-25a42cbe8d92' },
              { anchor: 0, direction: 'from', connectedToId: '8464cd27-869f-4ac5-bea5-14dd58360d3b' },
              { anchor: 2, direction: 'to', connectedToId: 'd56fbfac-55c6-4735-bd01-08ddf33c738d' }
            ]
          },
          {
            id: "d56fbfac-55c6-4735-bd01-08ddf33c738d",
            node: "end",
            text: "Ende",
            x: 815,
            y: 664.5,
            connections: [
              { anchor: 0, direction: 'from', connectedToId: 'b9424689-e105-4870-ad62-8365a2175caf' }
            ]
          },
          {
            id: "985068da-17e3-4cbf-9552-25a42cbe8d92",
            node: "op",
            text: "y = \"Eins\"",
            x: 786,
            y: 461.5,
            connections: [
              { anchor: 0, direction: 'from', connectedToId: '7d0107b2-18d8-4156-bdbc-fb4275c1458c' },
              { anchor: 2, direction: 'to', connectedToId: 'b9424689-e105-4870-ad62-8365a2175caf' }
            ]
          }
      ]
   },
   // Füge hier weitere Presets hinzu
];