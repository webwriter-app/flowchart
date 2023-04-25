// --------------- Definitionen ---------------

export interface GraphNode {
   id: string;
   node: string;
   text: string;
   x: number;
   y: number;
   connections?: { anchor: number; direction: string, connectedToId: string, text?: string }[];
}

export interface Arrow {
   id: string;
   from: GraphNode;
   to: GraphNode;
   points?: { x: number; y: number }[];
   text?: string;
   isSelected?: boolean;
}

export interface ItemList {
   titel: string;
   content: string;
}