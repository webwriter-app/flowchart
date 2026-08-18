# Flowchart (`@webwriter/flowchart@2.1.1`)
[License: MIT](LICENSE) | Version: 2.1.1

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
| `allowStudentEdit` | `boolean` | Whether students may add, drag and delete elements. | - | ✗ |
| `disableStudentPan` (`disableStudentPan`) | `boolean` | Disables panning/zooming interactions. | `false` | ✓ |
| `allowStudentPan` | `boolean` | Whether students may pan and zoom the canvas. | - | ✗ |
| `font` (`font`) | `string` | Font family used for labels, spaces written as underscores. | `'Courier_New'` | ✓ |
| `fontSize` (`fontSize`) | `number` | Font size used for labels. | `16` | ✓ |
| `theme` (`theme`) | `string` | Color theme name. | `'standard'` | ✓ |
| `fullscreen` (`fullscreen`) | `boolean` | Whether the widget is currently in fullscreen mode. | `false` | ✗ |
| `getSelectedSequence` | - | Get the currently selected path sequence. | - | ✗ |
| `isSelectingSequence` | - | Set path-selection mode. | - | ✗ |
| `solutionMessage` (`solutionMessage`) | `string` | Message shown in the solution prompt. | `''` | ✗ |
| `showSolution` (`showSolution`) | `boolean` | Whether the solution prompt is visible. | `false` | ✗ |
| `setSelectedSequence` | - | Programmatically set the selected path sequence.<br>Overwrites the internal `selectedSequence` with the provided ordered descriptors. | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `isEditable` | Returns whether the widget is currently in an editable state<br>based on the `contenteditable` attribute. | -
| `selectSequence` | Toggle path-selection mode for solution checking.<br>When turning off the mode, clears the current selected sequence, ends a running<br>task recording and drops any selected node/arrow/rectangle, then triggers a redraw. | -
| `checkSolution` | Compare the currently selected path sequence with a task's expected sequence.<br>If length and element-wise id/type match, shows a success message; otherwise<br>shows a failure message. Uses `showSolutionWithMessage()` to display the result. | `task: ItemList`

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## Custom CSS properties
| Name | Description |
| :--: | :---------: |
| --offset-x | Internal canvas left offset (managed by the widget). |
| --offset-y | Internal canvas top offset (managed by the widget). |
| --widget-height | Workspace height in pixels. |

*[Custom CSS properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties) offer defined customization of the widget's style.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or CSS parts.*


---
*Generated with @webwriter/build@1.9.1*