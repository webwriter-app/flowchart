export interface GraphNode {
   id: string;
   node: string;
   text: string;
   x: number;
   y: number;
   connections?: { anchor: number; direction: string, connectedToId: string, arrowID: string, text?: string }[];
}