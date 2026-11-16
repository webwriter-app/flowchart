/** One step of a recorded path: a node or an arrow in order. */
export type SequenceStep = { id: string; order: number; type: string };

export interface ItemList {
   titel: string;
   content: string;
   sequence?: SequenceStep[];
}