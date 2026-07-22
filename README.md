# Flowchart (`@webwriter/flowchart@2.0.9`)
[License: MIT](LICENSE) | Version: 2.0.9

Create programming flowcharts with interactive tasks. Use standardized Elements such as loops and Branchings.

## Snippets
[Snippets](https://webwriter.app/docs/snippets/snippets/) are examples and templates using the package's widgets.

| Name | Import Path |
| :--: | :---------: |
| Erklaerung | `@webwriter/flowchart/snippets/Erklaerung.html` |
| For Schleife | `@webwriter/flowchart/snippets/For-Schleife.html` |
| If Else | `@webwriter/flowchart/snippets/If-Else.html` |
| Switch | `@webwriter/flowchart/snippets/Switch.html` |
| Kontextbeispiel | `@webwriter/flowchart/snippets/Kontextbeispiel.html` |



## `FlowchartWidget` (`<webwriter-flowchart>`)


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
| `localize` | - | - | `LOCALIZE` | ✗ |
| `graphNodes` (`graphNodes`) | `GraphNode[]` | Current list of graph nodes (programmatic API). | `[]` | ✓ |
| `arrows` (`arrows`) | `Arrow[]` | Current list of arrows between nodes (programmatic API). | `[]` | ✗ |
| `getGraphNodes` | - | Get the current nodes. | - | ✗ |
| `getArrows` | - | Get the current arrows. | - | ✗ |
| `taskList` (`taskList`) | `ItemList[]` | Tasks shown in the task menu. | `[]` | ✓ |
| `helpList` (`helpList`) | `ItemList[]` | Hints shown in the help menu. | `[]` | ✓ |
| `height` (`height`) | `number` | Canvas height (px). | `400` | ✓ |
| `zoomLevel` (`zoomLevel`) | `number` | Current zoom percentage (50–200). | `100` | ✓ |
| `canvasOffsetX` (`canvasOffsetX`) | `number` | Horizontal pan offset (world units). | `0` | ✓ |
| `canvasOffsetY` (`canvasOffsetY`) | `number` | Vertical pan offset (world units). | `0` | ✓ |
| `disableStudentEdit` (`disableStudentEdit`) | `boolean` | Disables interactive editing (adding/dragging/deleting). | `false` | ✓ |
| `disableStudentPan` (`disableStudentPan`) | `boolean` | Disables panning/zooming interactions. | `false` | ✓ |
| `font` (`font`) | `string` | Font family used for labels. | `'Courier New'` | ✓ |
| `fontSize` (`fontSize`) | `number` | Font size used for labels. | `16` | ✓ |
| `theme` (`theme`) | `string` | Color theme name. | `'standard'` | ✓ |
| `fullscreen` (`fullscreen`) | `boolean` | Whether the widget is currently in fullscreen mode. | `false` | ✗ |
| `getSelectedSequence` | - | Get the currently selected path sequence. | - | ✗ |
| `getActiveSequenceButton` | - | Get the active sequence button. | - | ✗ |
| `setActiveSequenceButton` | - | Set the active sequence button. | - | ✗ |
| `isSelectingSequence` | - | Set path-selection mode. | - | ✗ |
| `solutionMessage` (`solutionMessage`) | `string` | Message shown in the solution prompt. | `''` | ✗ |
| `showSolution` (`showSolution`) | `boolean` | Whether the solution prompt is visible. | `false` | ✗ |
| `setSelectedSequence` | - | Programmatically set the selected path sequence.<br>Overwrites the internal `selectedSequence` with the provided ordered descriptors. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `isEditable` | Returns whether the widget is currently in an editable state<br>based on the `contenteditable` attribute. | -
| `selectSequence` | Toggle path-selection mode for solution checking.<br>When turning off the mode, clears the current selected sequence and any selected<br>node/arrow/rectangle, then triggers a redraw. Also toggles the `active` class on<br>the `#select-button` element (if present). | -
| `checkSolution` | Compare the currently selected path sequence with a task's expected sequence.<br>If length and element-wise id/type match, shows a success message; otherwise<br>shows a failure message. Uses `showSolutionWithMessage()` to display the result. | `task: ItemList`

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## Custom CSS properties
| Name | Description |
| :--: | :---------: |
| --scaled-grid-size | Spacing between grid dots (derived from zoom). |
| --scaled-grid-dot-size | Dot radius for the background grid (derived from zoom). |
| --offset-x | Internal canvas left offset (managed by the widget). |
| --offset-y | Internal canvas top offset (managed by the widget). |
| --widget-height | Workspace height in pixels. |

*[Custom CSS properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties) offer defined customization of the widget's style.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| options | Styles the settings sidebar (tool menu). |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, or events.*


---
*Generated with @webwriter/build@1.9.1*