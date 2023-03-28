// --------------- Definitionen ---------------

export interface GraphNodeData {
    node: 'start' | 'op' | 'case' | 'end' ;
    text?: string;
    x: number;
    y: number;
    connections?: { anchor: number; connectedTo: GraphNodeData }[];
  }
  
 export interface Arrow {
    from: GraphNodeData;
    to: GraphNodeData;
    isSelected?: boolean;
  }