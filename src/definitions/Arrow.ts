import { GraphNode } from "./GraphNode";

export interface Arrow {
   id: string;
   from: GraphNode;
   to: GraphNode;
   points?: { x: number; y: number }[];
   text?: string;
}