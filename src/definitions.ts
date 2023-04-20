// --------------- Definitionen ---------------

export interface GraphNodeData {
   id: string;
   node: string;
   text: string;
   x: number;
   y: number;
   connections?: { anchor: number; direction: string, connectedToId: string }[];
}

export interface Arrow {
   from: GraphNodeData;
   to: GraphNodeData;
   points?: { x: number; y: number }[];
   isSelected?: boolean;
}

export interface ItemList {
   titel: string;
   content: string;
}