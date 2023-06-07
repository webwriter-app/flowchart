export interface ItemList {
   titel: string;
   content: string;
   sequence?: { id: string; order: number; type: string }[];
}