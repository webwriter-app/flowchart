import { GraphNode } from "../../definitions/GraphNode";

// Presets von verschiedenen PAP-Sequenzen die erzeugt werden können
export const flowchartPresets: { name: string, graphNodes: GraphNode[] }[] = [
   {
      name: 'Erklärung',
      graphNodes: [
         {
            id: "934afd42-3af8-40af-8610-5d14477b80da",
            node: "start",
            text: "Verbindungen zeichnen",
            x: 405.1875,
            y: 175.05,
            connections: [
               { anchor: 2, direction: "to", connectedToId: "792a96bf-dcf1-41c1-baa3-93c47ac782c8", arrowID: "ccb9bba4-05d9-45af-9558-edac1247b076" }
            ],
         },
         {
            id: "792a96bf-dcf1-41c1-baa3-93c47ac782c8",
            node: "op",
            text: "Klicke auf mich",
            x: 433.9921875,
            y: 271.05,
            connections: [
               { anchor: 2, direction: "to", connectedToId: "e57a0477-7e45-428e-9307-0094061d1b3f", arrowID: "bee49b48-2f53-4ab0-a779-81df7e2b2c7b", text: "Ziehe gedrückt an einen der blauen Dreiecke" },
               { anchor: 0, direction: "from", connectedToId: "934afd42-3af8-40af-8610-5d14477b80da", arrowID: "ccb9bba4-05d9-45af-9558-edac1247b076" }
            ],
         },
         {
            id: "15200e39-e02e-4ff0-b0ac-4f8fd7b5dd95",
            node: "op",
            text: "Doppelklick auf mich",
            x: 862.9921875,
            y: 368.05,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "7e243f06-eb23-49e2-ae23-ebfb40a176dd", arrowID: "8cfe2c54-e8b8-475a-8a38-ff41c56222f1" },
               { anchor: 2, direction: "to", connectedToId: "4aadfbfb-bebb-4df0-b900-3003d1900239", arrowID: "828321f6-0d5f-47cc-ac6a-c0c9c53d7f7e", text: "oder auf mich" }
            ],
         },
         {
            id: "4aadfbfb-bebb-4df0-b900-3003d1900239",
            node: "end",
            text: "Ende",
            x: 939.8046875,
            y: 504.05,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "15200e39-e02e-4ff0-b0ac-4f8fd7b5dd95", arrowID: "828321f6-0d5f-47cc-ac6a-c0c9c53d7f7e", text: "oder auf mich" }
            ],
         },
         {
            id: "e57a0477-7e45-428e-9307-0094061d1b3f",
            node: "op",
            text: "Lass über einen Knoten los",
            x: 381.18359375,
            y: 407.04999999999995,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "792a96bf-dcf1-41c1-baa3-93c47ac782c8", arrowID: "bee49b48-2f53-4ab0-a779-81df7e2b2c7b", text: "Ziehe gedrückt an einen der blauen Dreiecke" },
               { anchor: 2, direction: "to", connectedToId: "36873d1b-c5d4-4211-af14-5029282aaf0c", arrowID: "ff886b25-fae0-4b84-84e5-5f0beeae063b", text: "Die Andockstelle ist der nähste Mittelpunkt einer Kante" }
            ],
         },
         {
            id: "36873d1b-c5d4-4211-af14-5029282aaf0c",
            node: "op",
            text: "Der Pfeil kann wieder versetzt werden",
            x: 337.9765625,
            y: 536.05,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "e57a0477-7e45-428e-9307-0094061d1b3f", arrowID: "ff886b25-fae0-4b84-84e5-5f0beeae063b", text: "Die Andockstelle ist der nähste Mittelpunkt einer Kante" },
               { anchor: 2, direction: "to", connectedToId: "dcf3f326-10db-438a-ad1e-90396c3f0934", arrowID: "af47c696-41a4-4925-b607-4d57183649b1", text: "Klick auf mich und zieh an dem Kreis an der Spitze" }
            ],
         },
         {
            id: "dcf3f326-10db-438a-ad1e-90396c3f0934",
            node: "end",
            text: "Ende",
            x: 486.80078125,
            y: 660.05,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "36873d1b-c5d4-4211-af14-5029282aaf0c", arrowID: "af47c696-41a4-4925-b607-4d57183649b1", text: "Klick auf mich und zieh an dem Kreis an der Spitze" }
            ],
         },
         {
            id: "bb863aa7-dbd7-451c-90fd-7f19acccc4c1",
            node: "end",
            text: "Ende",
            x: 1359.40234375,
            y: 554.05,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "eb26f75e-984c-4732-9d8b-862781a5d200", arrowID: "5d1f2b6d-2fdb-44e8-991f-2da692a9315d" }
            ],
         },
         {
            id: "7e243f06-eb23-49e2-ae23-ebfb40a176dd",
            node: "start",
            text: "Textändern",
            x: 911,
            y: 271.05,
            connections: [
               { anchor: 2, direction: "to", connectedToId: "15200e39-e02e-4ff0-b0ac-4f8fd7b5dd95", arrowID: "8cfe2c54-e8b8-475a-8a38-ff41c56222f1" }
            ],
         },
         {
            id: "ec6b0499-8f21-414b-9cac-38a54282ae23",
            node: "start",
            text: "Löschen",
            x: 1345,
            y: 212.05,
            connections: [
               { anchor: 2, direction: "to", connectedToId: "2c01e895-ea28-4b6b-a419-24e8ac96c3aa", arrowID: "733f7b82-bfcc-4d08-8815-e17642a098b0" }
            ],
         },
         {
            id: "eb26f75e-984c-4732-9d8b-862781a5d200",
            node: "op",
            text: "'Alles löschen' mithilfe dem Mülleimer-Button",
            x: 1162.5703125,
            y: 457.05,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "2c01e895-ea28-4b6b-a419-24e8ac96c3aa", arrowID: "1cad71b2-99e9-4882-9815-d9bf169e86ea", text: "oder über die Tasten: 'esc' und 'backspace'" },
               { anchor: 2, direction: "to", connectedToId: "bb863aa7-dbd7-451c-90fd-7f19acccc4c1", arrowID: "5d1f2b6d-2fdb-44e8-991f-2da692a9315d" }
            ],
         },
         {
            id: "2c01e895-ea28-4b6b-a419-24e8ac96c3aa",
            node: "op",
            text: "Rechtsklick auf ein Element",
            x: 1248.984375,
            y: 312.05,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "ec6b0499-8f21-414b-9cac-38a54282ae23", arrowID: "733f7b82-bfcc-4d08-8815-e17642a098b0" },
               { anchor: 2, direction: "to", connectedToId: "eb26f75e-984c-4732-9d8b-862781a5d200", arrowID: "1cad71b2-99e9-4882-9815-d9bf169e86ea", text: "oder über die Tasten: 'esc' und 'backspace'" }
            ],
         },
      ]
   },
   {
      name: 'Beispiel',
      graphNodes: [
         {
            id: "0ac439b0-7b5e-4648-989d-61712e63ee57",
            node: "start",
            text: "Start",
            x: 771.20703125,
            y: 86.5,
            connections: [
               { anchor: 2, direction: "to", connectedToId: "4fcfbda4-65e6-489b-825e-0641d358c087", arrowID: "3c5085aa-97c0-421c-a675-77137e94cc4f" }
            ],
         },
         {
            id: "4fcfbda4-65e6-489b-825e-0641d358c087",
            node: "i/o",
            text: 'Eingabe: Tipp = "Kopf" oder "Zahl"',
            x: 631.984375,
            y: 154.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "0ac439b0-7b5e-4648-989d-61712e63ee57", arrowID: "3c5085aa-97c0-421c-a675-77137e94cc4f" },
               { anchor: 2, direction: "to", connectedToId: "04893012-47f7-4e75-93b9-cbe58910e18a", arrowID: "38e7d384-2d33-4687-a04b-6d24342bc800" }
            ],
         },
         {
            id: "04893012-47f7-4e75-93b9-cbe58910e18a",
            node: "op",
            text: "Zufallszahl = (zufällig 0 oder 1)",
            x: 636.78515625,
            y: 240.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "4fcfbda4-65e6-489b-825e-0641d358c087", arrowID: "38e7d384-2d33-4687-a04b-6d24342bc800" },
               { anchor: 2, direction: "to", connectedToId: "7f76385a-caf3-4c65-a72e-665b50ef9787", arrowID: "93fb262a-07e8-4222-85a2-a136c470fbbf" },
            ],
         },
         {
            id: "7f76385a-caf3-4c65-a72e-665b50ef9787",
            node: "decision",
            text: " Zufallszahl == 0? ",
            x: 703.99609375,
            y: 316.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "04893012-47f7-4e75-93b9-cbe58910e18a", arrowID: "93fb262a-07e8-4222-85a2-a136c470fbbf" },
               { anchor: 2, direction: "to", connectedToId: "9e067393-c167-4157-8104-10cfa4b2a8de", arrowID: "f442c8e9-f150-4832-a4d4-adc2b2b642a5", text: 'Ja' },
               { anchor: 2, direction: "to", connectedToId: "43375730-48f0-4e07-8ba9-686672b8cb26", arrowID: "bbd1481f-ff76-457f-b284-07f18da3157f", text: 'Nein' },
            ],
         },
         {
            id: "9e067393-c167-4157-8104-10cfa4b2a8de",
            node: "op",
            text: 'Seite = "Kopf"',
            x: 550,
            y: 422.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "7f76385a-caf3-4c65-a72e-665b50ef9787", arrowID: "f442c8e9-f150-4832-a4d4-adc2b2b642a5" },
               { anchor: 2, direction: "to", connectedToId: "812ce303-a1a3-46e1-84b4-ff2cdc5c819a", arrowID: "30da2c8d-cbec-4275-aff3-213ae6708d76" }
            ],
         },
         {
            id: "43375730-48f0-4e07-8ba9-686672b8cb26",
            node: "op",
            text: 'Seite = "Zahl"',
            x: 920,
            y: 422.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "7f76385a-caf3-4c65-a72e-665b50ef9787", arrowID: "bbd1481f-ff76-457f-b284-07f18da3157f" },
               { anchor: 2, direction: "to", connectedToId: "812ce303-a1a3-46e1-84b4-ff2cdc5c819a", arrowID: "9f305332-8597-4f27-a4a7-3230dc964fd6" }
            ],
         },
         {
            id: "85824bad-03cf-47b5-a2b7-7f691419fa7f",
            node: "end",
            text: "Ende",
            x: 773,
            y: 772.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "68e5723f-1985-4d87-ac52-0230430c7d49", arrowID: "1c4755ef-779c-43cf-aef6-b55d7261ca75" },
               { anchor: 0, direction: "from", connectedToId: "9533930b-1a71-4e14-a207-24e6b356a595", arrowID: "eb28d590-70f6-469f-8671-651df874973" }
            ],
         },
         {
            id: "9533930b-1a71-4e14-a207-24e6b356a595",
            node: "i/o",
            text: 'Ausgabe: "Verloren"',
            x: 912,
            y: 669.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "9775752f-d69b-4fd2-9232-6bc4c377bd92", arrowID: "03b3bd42-3af5-4abf-9a35-2a834d4040a2" },
               { anchor: 2, direction: "to", connectedToId: "85824bad-03cf-47b5-a2b7-7f691419fa7f", arrowID: "eb28d590-70f6-469f-8671-651df874973" }
            ],
         },
         {
            id: "68e5723f-1985-4d87-ac52-0230430c7d49",
            node: "i/o",
            text: 'Ausgabe: "Gewonnen"',
            x: 510,
            y: 669.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "9775752f-d69b-4fd2-9232-6bc4c377bd92", arrowID: "f6e38902-0924-4ddd-98f4-0456ae941380" },
               { anchor: 2, direction: "to", connectedToId: "85824bad-03cf-47b5-a2b7-7f691419fa7f", arrowID: "1c4755ef-779c-43cf-aef6-b55d7261ca75" }
            ],
         },
         {
            id: "9775752f-d69b-4fd2-9232-6bc4c377bd92",
            node: "decision",
            text: " Seite == Tipp? ",
            x: 718.3984375,
            y: 603.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "812ce303-a1a3-46e1-84b4-ff2cdc5c819a", arrowID: "9d82445b-ae5a-419c-b582-4cb9e3a5dcee" },
               { anchor: 3, direction: "to", connectedToId: "68e5723f-1985-4d87-ac52-0230430c7d49", arrowID: "f6e38902-0924-4ddd-98f4-0456ae941380", text: 'Ja' },
               { anchor: 1, direction: "to", connectedToId: "9533930b-1a71-4e14-a207-24e6b356a595", arrowID: "03b3bd42-3af5-4abf-9a35-2a834d4040a2", text: 'Nein' }
            ],
         },
         {
            id: "812ce303-a1a3-46e1-84b4-ff2cdc5c819a",
            node: "i/o",
            text: "Ausgabe: Seite",
            x: 728,
            y: 526.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "9e067393-c167-4157-8104-10cfa4b2a8de", arrowID: "30da2c8d-cbec-4275-aff3-213ae6708d76" },
               { anchor: 0, direction: "from", connectedToId: "43375730-48f0-4e07-8ba9-686672b8cb26", arrowID: "9f305332-8597-4f27-a4a7-3230dc964fd6" },
               { anchor: 2, direction: "to", connectedToId: "9775752f-d69b-4fd2-9232-6bc4c377bd92", arrowID: "9d82445b-ae5a-419c-b582-4cb9e3a5dcee" }
            ],
         },
      ]
   },
   {
      name: 'If/Else',
      graphNodes: [
         {
            id: "75919796-642c-40b1-a713-d8574e31e6cd",
            node: "start",
            text: "Start",
            x: 743.60546875,
            y: 200.55,
            connections: [
               { anchor: 2, direction: 'to', connectedToId: 'f44d8c5d-6ce0-431f-af5c-f1f940c2dfde', arrowID: '848af778-8c42-4cea-9a76-29c13b5f2f71' }
            ],
         },
         {
            id: 'f44d8c5d-6ce0-431f-af5c-f1f940c2dfde',
            node: 'decision',
            text: ' Gilt ___ ? ',
            x: 710,
            y: 303.5,
            connections: [
               { anchor: 0, direction: 'from', connectedToId: '75919796-642c-40b1-a713-d8574e31e6cd', arrowID: '848af778-8c42-4cea-9a76-29c13b5f2f71' },
               { anchor: 2, direction: 'to', connectedToId: 'a6175565-44eb-4198-a151-5ca5b8d4ae8c', arrowID: 'ccc82f2d-1279-42ce-9842-221e353db7a9', text: 'Ja' },
               { anchor: 1, direction: 'to', connectedToId: '667f8666-a3d0-4fdb-a9ee-61b51ec9ff74', arrowID: '6a45121c-dad6-4c08-9c8c-eac3ba02cb42', text: 'Nein' }
            ],
         },
         {
            id: 'a6175565-44eb-4198-a151-5ca5b8d4ae8c',
            node: 'op',
            text: 'Dann ___',
            x: 728.203125,
            y: 434.5,
            connections: [
               { anchor: 0, direction: 'from', connectedToId: 'f44d8c5d-6ce0-431f-af5c-f1f940c2dfde', arrowID: 'ccc82f2d-1279-42ce-9842-221e353db7a9' },
               { anchor: 2, direction: 'to', connectedToId: 'd481a9f7-6c2b-44b4-a203-884b3ae39fe9', arrowID: '30db7a47-b534-4374-ba1f-09b83b988efe' },
            ],
         },
         {
            id: '667f8666-a3d0-4fdb-a9ee-61b51ec9ff74',
            node: 'op',
            text: 'Sonst ____',
            x: 921,
            y: 434.5,
            connections: [
               { anchor: 0, direction: 'from', connectedToId: 'f44d8c5d-6ce0-431f-af5c-f1f940c2dfde', arrowID: '6a45121c-dad6-4c08-9c8c-eac3ba02cb42' },
               { anchor: 2, direction: 'to', connectedToId: 'd481a9f7-6c2b-44b4-a203-884b3ae39fe9', arrowID: 'ff5cf9a9-b47a-48c3-b623-6d750064cb86' },
            ],
         },
         {
            id: 'd481a9f7-6c2b-44b4-a203-884b3ae39fe9',
            node: 'end',
            text: 'Ende',
            x: 747.40625,
            y: 590.55,
            connections: [
               { anchor: 0, direction: 'from', connectedToId: 'a6175565-44eb-4198-a151-5ca5b8d4ae8c', arrowID: '30db7a47-b534-4374-ba1f-09b83b988efe' },
               { anchor: 0, direction: 'from', connectedToId: '667f8666-a3d0-4fdb-a9ee-61b51ec9ff74', arrowID: 'ff5cf9a9-b47a-48c3-b623-6d750064cb86' },
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
            y: 160.5,
            connections: [
               { anchor: 2, direction: "to", connectedToId: "421574d8-e295-4bd8-bbe1-de4b0a6da8a2", arrowID: "62d41051-18a1-46df-ab4e-b15768a8d5e2" }
            ],
         },
         {
            id: "421574d8-e295-4bd8-bbe1-de4b0a6da8a2",
            node: "op",
            text: "i = Anfangswert",
            x: 711,
            y: 240.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "3b165c79-4247-4031-8399-edbff74ecc9a", arrowID: "62d41051-18a1-46df-ab4e-b15768a8d5e2" },
               { anchor: 2, direction: "to", connectedToId: "e7569340-e932-4ec9-a92f-5a3e0ebe51f1", arrowID: "48bc5ec3-0d8b-4099-a3c9-d9fdce4bd14d" }
            ],
         },
         {
            id: "6fe31b50-fbab-46b8-b0aa-8018a7418e3d",
            node: "op",
            text: "i = i + Schrittwert",
            x: 692,
            y: 439.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "e7569340-e932-4ec9-a92f-5a3e0ebe51f1", arrowID: "257ee9b0-5af3-461e-ada2-4a2b4b99b6e7" },
               { anchor: 2, direction: "to", connectedToId: "88d004c1-5e41-4314-b035-fbb100e8698e", arrowID: "667a45e7-1dbe-4d1a-b0e6-bb4686d13c21" }
            ],
         },
         {
            id: "8816955c-00e6-4662-85cb-deaf2b8a8e22",
            node: "connector",
            text: "",
            x: 583,
            y: 445.5,
            connections: [
               { anchor: 2, direction: "from", connectedToId: "88d004c1-5e41-4314-b035-fbb100e8698e", arrowID: "e8ea5574-e40a-44ca-8bb4-b4b3086a7893" },
               { anchor: 0, direction: "to", connectedToId: "e7569340-e932-4ec9-a92f-5a3e0ebe51f1", arrowID: "4701408e-fa7c-4bf5-9f3c-f99765452584" }
            ],
         },
         {
            id: "e7569340-e932-4ec9-a92f-5a3e0ebe51f1",
            node: "decision",
            text: " i < Endwert? ",
            x: 716,
            y: 339.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "421574d8-e295-4bd8-bbe1-de4b0a6da8a2", arrowID: "48bc5ec3-0d8b-4099-a3c9-d9fdce4bd14d" },
               { anchor: 1, direction: "to", connectedToId: "b837b0ca-3e70-44c1-b434-01e34800ccfc", arrowID: "2d352d30-cba1-4590-9e27-f96f7c340bea", text: 'falsch' },
               { anchor: 2, direction: "to", connectedToId: "6fe31b50-fbab-46b8-b0aa-8018a7418e3d", arrowID: "257ee9b0-5af3-461e-ada2-4a2b4b99b6e7", text: 'wahr' },
               { anchor: 3, direction: "from", connectedToId: "8816955c-00e6-4662-85cb-deaf2b8a8e22", arrowID: "4701408e-fa7c-4bf5-9f3c-f99765452584" },
            ],
         },
         {
            id: "b837b0ca-3e70-44c1-b434-01e34800ccfc",
            node: "i/o",
            text: "Ausgabe: 'Schleife beendet'",
            x: 971,
            y: 530.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "e7569340-e932-4ec9-a92f-5a3e0ebe51f1", arrowID: "2d352d30-cba1-4590-9e27-f96f7c340bea" },
               { anchor: 2, direction: "to", connectedToId: "1a4bc46-e04a-48e5-a4c5-686105d034b9", arrowID: "fff0dd9a-2f80-43f5-af98-42c2a6c0441e" }
            ],
         },
         {
            id: "88d004c1-5e41-4314-b035-fbb100e8698e",
            node: "op",
            text: "Anweisungen...",
            x: 716,
            y: 530.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "6fe31b50-fbab-46b8-b0aa-8018a7418e3d", arrowID: "667a45e7-1dbe-4d1a-b0e6-bb4686d13c21" },
               { anchor: 2, direction: "to", connectedToId: "8816955c-00e6-4662-85cb-deaf2b8a8e22", arrowID: "e8ea5574-e40a-44ca-8bb4-b4b3086a7893" }
            ],
         },
         {
            id: "1a4bc46-e04a-48e5-a4c5-686105d034b9",
            node: "end",
            text: "Ende",
            x: 764.0078125,
            y: 679.5,
            connections: [
               { anchor: 0, direction: "from", connectedToId: "b837b0ca-3e70-44c1-b434-01e34800ccfc", arrowID: "fff0dd9a-2f80-43f5-af98-42c2a6c0441e" }
            ],
         },
      ]
   },
   {
      name: "Switch",
      graphNodes: [
         {
            id: "cedd5e2c-6d3c-4047-baa9-a319c9506e0a",
            node: "start",
            text: "Start",
            x: 810.19921875,
            y: 168.5,
            connections: [{ anchor: 2, direction: 'to', connectedToId: '388566d6-b420-4565-852f-65a368f9af7e', arrowID: '5bbe51b5-8b45-4454-a995-561067cb0d8a' }]
         },
         {
            id: "388566d6-b420-4565-852f-65a368f9af7e",
            node: "i/o",
            text: "Eingabe: x",
            x: 786.1953125,
            y: 256.5,
            connections: [
               { anchor: 0, direction: 'from', connectedToId: 'cedd5e2c-6d3c-4047-baa9-a319c9506e0a', arrowID: '5bbe51b5-8b45-4454-a995-561067cb0d8a' },
               { anchor: 2, direction: 'to', connectedToId: '7d0107b2-18d8-4156-bdbc-fb4275c1458c', arrowID: '05277994-ff3f-4690-a204-c803146e54c1' }
            ]
         },
         {
            id: "7d0107b2-18d8-4156-bdbc-fb4275c1458c",
            node: "decision",
            text: "switch: x",
            x: 790.99609375,
            y: 331.5,
            connections: [
               { anchor: 0, direction: 'from', connectedToId: '388566d6-b420-4565-852f-65a368f9af7e', arrowID: '05277994-ff3f-4690-a204-c803146e54c1' },
               { anchor: 2, direction: 'to', connectedToId: '527d963a-f89c-4c74-8acd-99899d9f1c8d', arrowID: 'e02784b8-86de-4d1d-96f6-390d7a3ce9e0', text: 'x == 0?' },
               { anchor: 2, direction: 'to', connectedToId: '985068da-17e3-4cbf-9552-25a42cbe8d92', arrowID: 'c6ff955e-71b5-434b-b77d-1da16d9abb67', text: 'x == 1?' },
               { anchor: 2, direction: 'to', connectedToId: '8464cd27-869f-4ac5-bea5-14dd58360d3b', arrowID: 'a7788c1e-2512-4add-bb66-84905e323e40', text: 'default' },
            ]
         },
         {
            id: "527d963a-f89c-4c74-8acd-99899d9f1c8d",
            node: "op",
            text: "y = \"Null\"",
            x: 585,
            y: 421.5,
            connections: [
               { anchor: 0, direction: 'from', connectedToId: '7d0107b2-18d8-4156-bdbc-fb4275c1458c', arrowID: 'e02784b8-86de-4d1d-96f6-390d7a3ce9e0', text: 'x == 0?' },
               { anchor: 2, direction: 'to', connectedToId: 'b9424689-e105-4870-ad62-8365a2175caf', arrowID: 'f10a521e-1049-4cbe-80f9-31baafebba1f' }
            ]
         },
         {
            id: "985068da-17e3-4cbf-9552-25a42cbe8d92",
            node: "op",
            text: "y = \"Eins\"",
            x: 786,
            y: 461.5,
            connections: [
               { anchor: 0, direction: 'from', connectedToId: '7d0107b2-18d8-4156-bdbc-fb4275c1458c', arrowID: 'c6ff955e-71b5-434b-b77d-1da16d9abb67', text: 'x == 1?' },
               { anchor: 2, direction: 'to', connectedToId: 'b9424689-e105-4870-ad62-8365a2175caf', arrowID: '6bf9c923-f04a-4450-ad78-37eec2d9c2a1' }
            ]
         },
         {
            id: "8464cd27-869f-4ac5-bea5-14dd58360d3b",
            node: "op",
            text: 'y = "x ist nicht 0 oder 1"',
            x: 985,
            y: 421.5,
            connections: [
               { anchor: 0, direction: 'from', connectedToId: '7d0107b2-18d8-4156-bdbc-fb4275c1458c', arrowID: 'a7788c1e-2512-4add-bb66-84905e323e40', text: 'default' },
               { anchor: 2, direction: 'to', connectedToId: 'b9424689-e105-4870-ad62-8365a2175caf', arrowID: '948813e3-73e3-4c92-8d6c-327ec44c0b69' }
            ]
         },
         {
            id: "b9424689-e105-4870-ad62-8365a2175caf",
            node: "i/o",
            text: "Ausgabe: y",
            x: 786,
            y: 580.5,
            connections: [
               { anchor: 0, direction: 'from', connectedToId: '527d963a-f89c-4c74-8acd-99899d9f1c8d', arrowID: 'f10a521e-1049-4cbe-80f9-31baafebba1f' },
               { anchor: 0, direction: 'from', connectedToId: '985068da-17e3-4cbf-9552-25a42cbe8d92', arrowID: '6bf9c923-f04a-4450-ad78-37eec2d9c2a1' },
               { anchor: 0, direction: 'from', connectedToId: '8464cd27-869f-4ac5-bea5-14dd58360d3b', arrowID: '948813e3-73e3-4c92-8d6c-327ec44c0b69' },
               { anchor: 2, direction: 'to', connectedToId: 'd56fbfac-55c6-4735-bd01-08ddf33c738d', arrowID: 'f50e0063-1db7-46e0-9f9e-a4ffe126b6a6' }
            ]
         },
         {
            id: "d56fbfac-55c6-4735-bd01-08ddf33c738d",
            node: "end",
            text: "Ende",
            x: 815,
            y: 664.5,
            connections: [
               { anchor: 0, direction: 'from', connectedToId: 'b9424689-e105-4870-ad62-8365a2175caf', arrowID: 'f50e0063-1db7-46e0-9f9e-a4ffe126b6a6' }
            ]
         }
      ]
   },
   // Füge hier weitere Presets hinzu
];