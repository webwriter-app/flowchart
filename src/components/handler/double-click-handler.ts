
export function handleGraphNodeDoubleClick( clickedNodeIndex: number, showPrompt: (type: 'node' | 'arrow', index: number) => void ) {
  
  showPrompt('node', clickedNodeIndex);

}

export function handleArrowDoubleClick( selectedArrowIndex: number, showPrompt: (type: 'node' | 'arrow', index: number) => void ) {
  
  showPrompt('arrow', selectedArrowIndex);
  
}
