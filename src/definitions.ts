// --------------- Definitionen ---------------

export interface GraphNodeData {
   node: string;
   text: string;
   x: number;
   y: number;
   connections?: { anchor: number; connectedTo: GraphNodeData }[];
}

export interface Arrow {
   from: GraphNodeData;
   to: GraphNodeData;
   points?: { x: number; y: number }[];
   isSelected?: boolean;
}