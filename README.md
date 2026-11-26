# Flowchart (`@webwriter/flowchart@3.1.0`)
[License: MIT](LICENSE) | Version: 3.1.0

Create programming flowcharts with interactive tasks using standardized symbols for steps, loops, and branches.

## Snippets
[Snippets](https://webwriter.app/docs/snippets/snippets/) are examples and templates using the package's widgets.

| Name | Import Path |
| :--: | :---------: |
| Erklaerung | `@webwriter/flowchart/snippets/Erklaerung.html` |
| For Schleife | `@webwriter/flowchart/snippets/For-Schleife.html` |
| If Else | `@webwriter/flowchart/snippets/If-Else.html` |
| Switch | `@webwriter/flowchart/snippets/Switch.html` |
| Kontextbeispiel | `@webwriter/flowchart/snippets/Kontextbeispiel.html` |



## `WebwriterFlowchart` (`<webwriter-flowchart>`)


### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/flowchart/widgets/webwriter-flowchart.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/flowchart/widgets/webwriter-flowchart.js"></script>
<webwriter-flowchart></webwriter-flowchart>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/flowchart
```

```html
<link href="@webwriter/flowchart/widgets/webwriter-flowchart.css" rel="stylesheet">
<script type="module" src="@webwriter/flowchart/widgets/webwriter-flowchart.js"></script>
<webwriter-flowchart></webwriter-flowchart>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `WebwriterFlowchart.actions` | `object` | - | `{ deleteSelection: { label: { _: 'Delete' }, shortcut: ['Delete', 'Backspace'], hidden: true }, fitToView: { label: (widget: DrawerTexts) => widget.msg('Fit to view') }, clearAll: { label: (widget: DrawerTexts) => widget.msg('Clear chart'), intent: 'danger' as const, confirm: (widget: DrawerTexts) => widget.msg('Are you sure, that you want to delete everything?'), }, }` | ✗ |
| `WebwriterFlowchart.convertFrom` | `object` | - | `{ '.mmd': importMermaid, ol: importList, ul: importList }` | ✗ |
| `WebwriterFlowchart.convertTo` | `object` | - | `{ '.mmd': exportMermaid, 'image/png': exportPng, img: exportImage, ol: exportList }` | ✗ |
| `localize` | - | - | - | ✗ |
| `msg` | - | - | - | ✗ |
| `graphNodes` | `GraphNode[]` | Current list of graph nodes (programmatic API). | `[]` | ✗ |
| `signals` | `object` | Values other widgets can read through `#id[name]`. | `{ pathCorrect: computed(() => this.#pathCorrect.get()), selected: computed(() => this.#selected.get()), }` | ✗ |
| `arrows` (`arrows`) | `Arrow[]` | Current list of arrows between nodes (programmatic API). | `[]` | ✗ |
| `getGraphNodes` | - | Get the current nodes. | - | ✗ |
| `getArrows` | - | Get the current arrows. | - | ✗ |
| `taskList` | `ItemList[]` | Tasks shown in the task menu. | `[]` | ✗ |
| `helpList` | `ItemList[]` | Hints shown in the help menu. | `[]` | ✗ |
| `height` (`height`) | `number` | Canvas height (px). | `400` | ✓ |
| `canvasOffsetX` (`canvasOffsetX`) | `number` | Horizontal pan offset (world units). | `0` | ✓ |
| `canvasOffsetY` (`canvasOffsetY`) | `number` | Vertical pan offset (world units). | `0` | ✓ |
| `allowStudentEdit` | `boolean` | Whether students may add, drag and delete elements. | - | ✗ |
| `allowStudentPan` | `boolean` | Whether students may pan and zoom the canvas. | - | ✗ |
| `fullscreen` (`fullscreen`) | `boolean` | Whether the widget is currently in fullscreen mode. | `false` | ✗ |
| `getSelectedSequence` | - | Get the currently selected path sequence. | - | ✗ |
| `isSelectingSequence` | - | Set path-selection mode. | - | ✗ |
| `solutionMessage` (`solutionMessage`) | `string` | Message shown in the solution prompt. | `''` | ✗ |
| `showSolution` (`showSolution`) | `boolean` | Whether the solution prompt is visible. | `false` | ✗ |
| `setSelectedSequence` | - | Programmatically set the selected path sequence. | - | ✗ |
| `zoomLevel` | `number` | Current zoom percentage (50–200). | - | ✗ |
| `font` | `string` | Font family used for labels, spaces written as underscores. | - | ✗ |
| `fontSize` | `number` | Font size used for labels. | - | ✗ |
| `theme` | `string` | Color theme name. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `isEditable` | Returns whether the widget is currently in an editable state<br>based on the `contenteditable` attribute. | -
| `selectSequence` | Toggle path-selection mode for solution checking.<br>When turning off the mode, clears the current selected sequence, ends a running<br>task recording and drops any selected node/arrow/rectangle, then triggers a redraw. | -
| `checkSolution` | Compare the selected path with the task's recorded one and show the verdict. | `task: ItemList`
| `addTask` | Append a new task with default title and content to the task list. | -
| `addHelp` | Append a new hint with default title and content to the help list. | -
| `addGraphNode` | Adds a new graph node of the given type at the current viewport center.<br>The node is appended to `graphNodes` and the canvas is redrawn. | `node: 'start'|'end'|'op'|'decision'|'connector'|'i/o'|'sub'|'text'`, `text: string`
| `fitToView` | Zoom and pan so that the whole chart is in view. | -
| `deleteSelection` | Removes the selected node(s) or arrow. Runs from Delete and Backspace while focus is in the widget (not in a text field or dialog).<br>With nothing selected it declines the key, which then goes on to the page. | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## Slots
| Name | Description | Content Type |
| :--: | :---------: | :----------: |
| `data` | Direct application/json block stores flowchart nodes, tasks, and hints. Keyboard: the canvas is one tab stop. Arrow keys move between nodes; Enter adds the node to the path being selected, or edits its caption; `a` walks along the arrows of the node (Enter edits the arrow's caption); `c` starts a connection, the arrow keys pick the target and Enter creates it; Alt+arrows move the node (Alt+Shift for large steps); Shift+arrows pan; `+` and `-` zoom; `0` fits the chart; Escape cancels or clears the selection; Delete removes the selection. Touch: tap selects, drag moves, a long press opens the node menu, a double tap edits a caption, two fingers pan and zoom. Print: the whole chart is printed fitted to the page, without grid, controls and selection, followed by the task list. A chart without nodes prints a short note. Files and conversions: a Mermaid flowchart (`.mmd`) is imported and exported (lossy: positions, tasks, hints and colors are not part of Mermaid; on import the nodes are laid out in layers, subgraphs are refused, a second arrow between two nodes and arrows from a node to itself are dropped, and a recorded path of a task is cleared); the chart is exported as a PNG picture (`image/png`) or as an `img` element with a PNG data URL; an `ol` or `ul` becomes a chain of process steps between a start and an end, and the chart becomes an `ol` of its captions in reading order (branches and loops are flattened). | - |

*[Slots](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots) define how the content of the widget is rendered.*

## Custom CSS properties
| Name | Description |
| :--: | :---------: |
| --ww-text-color | Text color of the controls and dialogs. Defaults to the inherited color. |
| --ww-font-family | Font of the controls and dialogs. Defaults to the inherited font. |
| --ww-theme-accent-1 | Color of the canvas grid, the keyboard focus ring and the focus outline. Defaults to #104e8b. |
| --offset-x | Internal canvas left offset (managed by the widget). |
| --offset-y | Internal canvas top offset (managed by the widget). |
| --widget-height | Workspace height in pixels. |

*[Custom CSS properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties) offer defined customization of the widget's style.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| canvas | The drawing surface with the chart. |
| workspace | The area that holds the canvas and the overlay controls. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public events.*


---
*Generated with @webwriter/build@1.15.0*
