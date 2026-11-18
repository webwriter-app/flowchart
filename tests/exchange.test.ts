/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import "../src/widgets/webwriter-flowchart";
import { dataOf, frame, make, reset, until } from "./helpers";
import { flowMmd as fixture } from "./fixtures/flow";

mocha.setup(getMochaConfig());

const file = (text: string, name = "chart.mmd") => new File([text], name, { type: "" });
const Widget = () => customElements.get("webwriter-flowchart") as any;
const types = (w: any) => w.graphNodes.map((n: any) => n.node);
const arrowCount = (w: any) => w.graphNodes.reduce((sum: number, n: any) => sum + (n.connections ?? []).filter((c: any) => c.direction === "to").length, 0);

for (const edit of [false, true]) {
  describe(`<webwriter-flowchart> exchange in ${edit ? "edit" : "read"} mode`, function () {
    afterEach(reset);

    it("declares its conversions", function () {
      assert.hasAllKeys(Widget().convertFrom, [".mmd", "ol", "ul"]);
      assert.hasAllKeys(Widget().convertTo, [".mmd", "image/png", "img", "ol"]);
    });

    it("imports a Mermaid flowchart", async function () {
      const w = await make({ edit });
      const apply = await Widget().convertFrom[".mmd"].call(w, file(fixture));
      assert.lengthOf(w.graphNodes, 2, "nothing changes before apply");
      apply();
      assert.deepEqual(types(w), ["start", "op", "decision", "i/o", "sub", "end"]);
      assert.equal(arrowCount(w), 6);
      const decision = w.graphNodes[2];
      assert.equal(decision.text.trim(), "Is it even?");
      assert.deepEqual(decision.connections.filter((c: any) => c.direction === "to").map((c: any) => c.text), ["Yes", "No"]);
      assert.equal(w.graphNodes[3].text, 'Print "even"');
      assert.isAbove(w.graphNodes[5].y, w.graphNodes[3].y, "the end lies below its predecessor");
      await until(() => dataOf(w).graphNodes?.length === 6, "import written");
      assert.lengthOf(w.arrows, 6);
    });

    it("refuses files that are not a flowchart", async function () {
      const w = await make({ edit });
      for (const text of ["hello", "sequenceDiagram\n A->>B: hi", "flowchart TD\n subgraph x\n A-->B\n end", "flowchart TD\n", "flowchart TD\n A[open"]) {
        let message = "";
        try { await Widget().convertFrom[".mmd"].call(w, file(text)); } catch (error) { message = (error as Error).message; }
        assert.isNotEmpty(message, text);
      }
      assert.lengthOf(w.graphNodes, 2, "the widget is unchanged");
    });

    it("keeps the chart through a Mermaid round trip", async function () {
      const w = await make({ edit });
      Widget().convertFrom[".mmd"].call(w, file(fixture)).then((apply: () => void) => apply());
      await until(() => w.graphNodes.length === 6, "import");
      const exported: File = Widget().convertTo[".mmd"].call(w);
      assert.equal(exported.name, "flowchart.mmd");
      const text = await exported.text();
      assert.match(text, /^flowchart TD/);
      const before = w.graphNodes.map((n: any) => [n.node, n.text.trim()]);
      const labels = w.graphNodes.flatMap((n: any) => n.connections.filter((c: any) => c.direction === "to").map((c: any) => c.text ?? ""));
      const apply = await Widget().convertFrom[".mmd"].call(w, exported);
      apply();
      assert.deepEqual(w.graphNodes.map((n: any) => [n.node, n.text.trim()]), before);
      assert.deepEqual(w.graphNodes.flatMap((n: any) => n.connections.filter((c: any) => c.direction === "to").map((c: any) => c.text ?? "")), labels);
    });

    it("clears recorded paths of tasks and keeps the tasks", async function () {
      const w = await make({ edit, data: { graphNodes: [{ id: "a", node: "start", text: "Start", x: 0, y: 0 }], taskList: [{ titel: "T", content: "c", sequence: [{ id: "a", order: 0, type: "node" }] }], helpList: [] } });
      const apply = await Widget().convertFrom[".mmd"].call(w, file(fixture));
      apply();
      assert.equal(w.taskList[0].titel, "T");
      assert.isUndefined(w.taskList[0].sequence);
    });

    it("converts a list to a chain and back", async function () {
      const w = await make({ edit });
      const fragment = document.createDocumentFragment();
      const list = document.createElement("ol");
      list.innerHTML = "<li>Wash</li><li> Cook </li><li></li>";
      fragment.append(list);
      assert.notEqual(Widget().convertFrom.ol.call(w, fragment), false);
      assert.deepEqual(types(w), ["start", "op", "op", "end"]);
      assert.equal(arrowCount(w), 3);
      const back: HTMLOListElement = Widget().convertTo.ol.call(w);
      assert.equal(back.localName, "ol");
      assert.deepEqual([...back.children].map((li) => li.textContent), [w.graphNodes[0].text, "Wash", "Cook", w.graphNodes[3].text]);
      assert.isFalse(Widget().convertFrom.ul.call(w, document.createDocumentFragment()), "no list, no conversion");
    });

    it("takes a ul as well", async function () {
      const w = await make({ edit });
      const fragment = document.createDocumentFragment();
      const list = document.createElement("ul");
      list.innerHTML = "<li>One</li><li>Two</li>";
      fragment.append(list);
      assert.notEqual(Widget().convertFrom.ul.call(w, fragment), false);
      assert.deepEqual(types(w), ["start", "op", "op", "end"]);
    });

    it("keeps a pipe and a quote in an arrow caption through a Mermaid round trip", async function () {
      const w = await make({ edit });
      const text = 'flowchart TD\n    A[One] -->|"a#124;b #quot;c#quot;"| B[Two]\n';
      Widget().convertFrom[".mmd"].call(w, file(text)).then((apply: () => void) => apply());
      await until(() => w.graphNodes.length === 2 && w.graphNodes[0].connections?.length, "import");
      const caption = (n: any) => n.connections.find((c: any) => c.direction === "to").text;
      assert.equal(caption(w.graphNodes[0]), 'a|b "c"');
      const exported: File = Widget().convertTo[".mmd"].call(w);
      const apply = await Widget().convertFrom[".mmd"].call(w, exported);
      apply();
      assert.equal(caption(w.graphNodes[0]), 'a|b "c"');
    });

    it("keeps its signals readable after it is disconnected", async function () {
      const w = await make({ edit });
      const { selected, pathCorrect } = w.signals;
      w.remove();
      assert.equal(selected.get(), "");
      assert.isFalse(pathCorrect.get());
    });

    it("exports a PNG and an image", async function () {
      const w = await make({ edit });
      const png: File = await Widget().convertTo["image/png"].call(w);
      assert.equal(png.type, "image/png");
      const head = new Uint8Array(await png.slice(0, 4).arrayBuffer());
      assert.deepEqual([...head], [0x89, 0x50, 0x4e, 0x47]);
      const image: HTMLImageElement = Widget().convertTo.img.call(w);
      assert.match(image.src, /^data:image\/png;base64,/);
      assert.isNotEmpty(image.alt);
      assert.lengthOf(w.graphNodes, 2);
    });

    it("exports nothing for an empty chart", async function () {
      const w = await make({ edit, data: { graphNodes: [], taskList: [], helpList: [] } });
      assert.isNull(Widget().convertTo[".mmd"].call(w));
      assert.isNull(await Widget().convertTo["image/png"].call(w));
      assert.isNull(Widget().convertTo.img.call(w));
      assert.isNull(Widget().convertTo.ol.call(w));
    });

    it("publishes the selected node and the path check", async function () {
      const w = await make({ edit });
      const { selected, pathCorrect } = w.signals;
      assert.strictEqual(w.signals.selected, selected, "the signal instance is stable");
      assert.equal(selected.get(), "");
      w.selectedNode = w.graphNodes[1];
      await until(() => selected.get() === "Step", "selected node");
      w.selectedNode = undefined;
      await until(() => selected.get() === "", "selection cleared");
      assert.isFalse(pathCorrect.get());
      w.showSolutionWithMessage("ok", true);
      assert.isTrue(pathCorrect.get());
      w.showSolutionWithMessage("no", false);
      assert.isFalse(pathCorrect.get());
    });

    it("runs its actions", async function () {
      const w = await make({ edit });
      const actions = Widget().actions;
      assert.equal(actions.clearAll.intent, "danger");
      assert.isString(actions.fitToView.label(w));
      w.fitToView();
      w.clearAll();
      await until(() => dataOf(w).graphNodes?.length === 0, "chart cleared");
      await frame();
    });
  });
}

mocha.run();
