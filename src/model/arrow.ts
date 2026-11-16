import { GraphNode } from "./graph-node";

export interface Arrow {
   id: string;
   from: GraphNode;
   to: GraphNode;
   points: { x: number; y: number }[];
   text?: string;
}