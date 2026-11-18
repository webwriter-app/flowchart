/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import "../src/widgets/webwriter-flowchart";
import {
  NODES, block, dataOf, frame, key, make, mount, reset, until,
} from "./helpers";

mocha.setup(getMochaConfig());

for (const edit of [false, true]) {
  const mode = edit ? "edit" : "read";

  describe(`<webwriter-flowchart> in ${mode} mode`, function () {
    afterEach(reset);

    it("reads the data block into the widget", async function () {
      const w = await make({ edit });
      assert.deepEqual(w.graphNodes.map((n: any) => n.id), ["a", "b"]);
      assert.isDefined(w.arrows);
    });

    it("reports isEditable according to the mode", async function () {
      const w = await make({ edit });
      assert.equal(w.isEditable(), edit, `isEditable() is ${w.isEditable()}`);
    });

    it("adopts a change of the data block from outside", async function () {
      const w = await make({ edit });
      w.querySelector("script")!.textContent = JSON.stringify({ graphNodes: [NODES[0]], taskList: [{ titel: "T", content: "c" }], helpList: [] });
      await until(() => w.graphNodes.length === 1 && w.taskList.length === 1, "adopted data");
    });

    it("writes a change in the widget to the data block", async function () {
      const w = await make({ edit });
      w.helpList = [{ titel: "Hint", content: "h" }];
      await until(() => dataOf(w).helpList?.length === 1, "written hint");
      assert.deepEqual(dataOf(w).graphNodes.map((n: any) => n.id), ["a", "b"], "nodes kept");
      // in-place edits of a node reach the block with the next commit
      w.graphNodes[0].text = "Changed";
      w.graphNodes = [...w.graphNodes];
      await until(() => dataOf(w).graphNodes[0].text === "Changed", "in-place edit written");
      assert.equal(w.querySelectorAll(":scope > script").length, 1, "one data block");
    });

    it("keeps the authored shape of the block (slot, type)", async function () {
      const w = await make({ edit });
      w.taskList = [{ titel: "T", content: "c" }];
      await until(() => dataOf(w).taskList?.length === 1);
      const s = w.querySelector(":scope > script")!;
      assert.isTrue(s.getAttribute("type") === "application/json" && s.getAttribute("slot") === "data");
    });

    it("removes the selected node on Delete while focus is in the widget", async function () {
      const w = await make({ edit });
      w.selectedNode = w.graphNodes[1];
      const canvas = w.shadowRoot!.querySelector("canvas")!;
      canvas.focus();
      key(canvas, "Delete");
      await until(() => w.graphNodes.length === 1, "node removed");
      assert.deepEqual(w.graphNodes.map((n: any) => n.id), ["a"]);
      await until(() => dataOf(w).graphNodes?.length === 1, "removal written");
    });

    it("removes the selected node on Backspace", async function () {
      const w = await make({ edit });
      w.selectedNode = w.graphNodes[0];
      const canvas = w.shadowRoot!.querySelector("canvas")!;
      canvas.focus();
      key(canvas, "Backspace");
      await until(() => w.graphNodes.length === 1, "node removed");
      assert.deepEqual(w.graphNodes.map((n: any) => n.id), ["b"]);
    });

    it("leaves Delete with nothing selected to the page", async function () {
      const w = await make({ edit });
      const canvas = w.shadowRoot!.querySelector("canvas")!;
      canvas.focus();
      assert.isTrue(key(canvas, "Delete"), "the key was consumed although nothing is selected");
      w.selectedNode = w.graphNodes[1];
      assert.isFalse(key(canvas, "Delete"), "the key was not consumed although a node is selected");
      await until(() => w.graphNodes.length === 1, "node removed");
    });

    it("leaves the chart alone when Delete is pressed outside the widget", async function () {
      const w = await make({ edit });
      w.selectedNode = w.graphNodes[1];
      const outside = document.createElement("input");
      document.body.append(outside);
      outside.focus();
      key(outside, "Delete");
      key(document.body, "Backspace");
      key(document, "Delete");
      await frame(); await frame();
      outside.remove();
      assert.deepEqual(w.graphNodes.map((n: any) => n.id), ["a", "b"]);
    });

    it("leaves the chart alone when Delete is pressed while the text prompt is open", async function () {
      const w = await make({ edit });
      w.selectedNode = w.graphNodes[1];
      w.textPrompt = { type: "node", index: 0, value: "x" };
      await w.updateComplete;
      const canvas = w.shadowRoot!.querySelector("canvas")!;
      key(canvas, "Delete");
      await frame();
      assert.equal(w.graphNodes.length, 2);
    });

    it("leaves no key listener on window or document", async function () {
      const seen: EventTarget[] = [];
      const add = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function (this: EventTarget, type: string, ...rest: any[]) {
        if ((this === window || this === document) && type === "keydown") seen.push(this);
        return (add as any).call(this, type, ...rest);
      } as typeof add;
      try { const w = await make({ edit }); w.remove(); } finally { EventTarget.prototype.addEventListener = add; }
      assert.equal(seen.length, 0, `${seen.length} keydown listeners on window or document`);
    });
  });
}

describe("<webwriter-flowchart> settings", function () {
  afterEach(reset);

  it("keeps the authored attribute names", async function () {
    const w = await make({ attrs: 'zoomlevel="150" fontsize="20" font="Verdana" theme="pastel" disablestudentedit disablestudentpan' });
    assert.deepEqual([w.zoomLevel, w.fontSize, w.font, w.theme, w.disableStudentEdit, w.disableStudentPan], [150, 20, "Verdana", "pastel", true, true]);
    assert.isTrue(!w.allowStudentEdit && !w.allowStudentPan);
  });

  it("uses the defaults when no attribute is set", async function () {
    const w = await make();
    assert.deepEqual([w.zoomLevel, w.fontSize, w.font, w.theme, w.disableStudentEdit, w.disableStudentPan], [100, 16, "Courier_New", "standard", false, false]);
  });

  it("reflects a property write to the authored attribute", async function () {
    const w = await make();
    w.zoomLevel = 130; w.theme = "mono"; w.disableStudentPan = true; w.fontSize = 22;
    await w.updateComplete;
    assert.deepEqual([w.getAttribute("zoomlevel"), w.getAttribute("theme"), w.hasAttribute("disablestudentpan"), w.getAttribute("fontsize")], ["130", "mono", true, "22"]);
    w.disableStudentPan = false;
    await w.updateComplete;
    assert.isFalse(w.hasAttribute("disablestudentpan"));
  });

  it("keeps the zoom inside its limits", async function () {
    const w = await make();
    w.zoomLevel = 500; assert.equal(w.zoomLevel, 200, `high ${w.zoomLevel}`);
    w.zoomLevel = 10; assert.equal(w.zoomLevel, 50, `low ${w.zoomLevel}`);
  });

  it("carries the attributes and ranges in the editor options", async function () {
    const o = (await make()).options;
    assert.deepEqual(Object.keys(o).sort(), ["disableStudentEdit", "disableStudentPan", "font", "fontSize", "theme", "zoomLevel"]);
    assert.deepEqual([o.zoomLevel.attribute, o.zoomLevel.min, o.zoomLevel.max, o.zoomLevel.step], ["zoomlevel", 50, 200, 10]);
    assert.deepEqual([o.fontSize.attribute, o.fontSize.min, o.fontSize.max], ["fontsize", 8, 40]);
    assert.deepEqual(o.font.options.map((c: any) => c.value), ["Arial", "Courier_New", "Times_New_Roman", "Verdana"]);
    assert.deepEqual(o.theme.options.map((c: any) => c.value), ["standard", "pastel", "mono", "s/w"]);
    assert.isTrue(o.zoomLevel.label._ === "Zoom" && o.disableStudentEdit.label._ === "Disable student editing", "source labels");
  });
});

describe("<webwriter-flowchart> localization", function () {
  afterEach(() => { reset(); document.documentElement.removeAttribute("lang"); });

  it("follows the widget's language in the drawer labels", async function () {
    this.timeout(15000);
    const w = await make({ attrs: 'lang="de"' });
    let changed = 0;
    w.addEventListener("optionschange", () => changed++);
    await until(() => w.localize.getLocale() === "de", "german catalog");
    await until(() => w.options.font.label._ === "Schriftart", `german font label (got ${w.options.font.label._})`);
    assert.isTrue(w.options.theme.options.every((c: any) => c.label._), "theme choices labelled");
    assert.notEqual(w.msg("Fullscreen"), "Fullscreen", "catalog applies to msg");
    w.setAttribute("lang", "en");
    await until(() => w.localize.getLocale() === "en" && w.options.font.label._ === "Font", "back to english");
  });

  it("does not reflect lang from inheritance", async function () {
    this.timeout(15000);
    document.documentElement.lang = "fr";
    const w = await make();
    await until(() => w.localize.getLocale() === "fr", "inherited fr");
    assert.isFalse(w.hasAttribute("lang"));
  });
});

describe("<webwriter-flowchart> permissions and canvas", function () {
  afterEach(reset);

  it("shows the grab button according to edit mode and the student flags", async function () {
    const read = await make({ attrs: "disablestudentedit disablestudentpan" });
    assert.isNull(read.shadowRoot!.querySelector("#grab-button"), "no grab button for a locked reader");
    const edit = await make({ edit: true, attrs: "disablestudentedit disablestudentpan" });
    assert.isNotNull(edit.shadowRoot!.querySelector("#grab-button"), "grab button for the author");
    const open = await make();
    assert.isNotNull(open.shadowRoot!.querySelector("#grab-button"), "grab button when students may edit and pan");
  });

  it("re-renders when leaving read mode for edit mode", async function () {
    const w = await make({ attrs: "disablestudentedit disablestudentpan" });
    assert.isNull(w.shadowRoot!.querySelector("#grab-button"));
    w.setAttribute("contenteditable", "");
    document.designMode = "on";
    await until(() => w.shadowRoot!.querySelector("#grab-button"), "grab button after entering edit mode");
  });

  it("drops empty tasks and hints in edit mode", async function () {
    const w = await make({ edit: true, data: { graphNodes: NODES, taskList: [{ titel: "", content: "" }, { titel: "Keep", content: "" }], helpList: [{ titel: " ", content: "" }] } });
    await until(() => w.taskList.length === 1 && w.helpList.length === 0, "empty items removed");
  });

  it("zooms with the wheel for readers who may pan", async function () {
    const w = await make();
    const canvas = w.shadowRoot!.querySelector("canvas")!;
    canvas.focus();
    const r = canvas.getBoundingClientRect();
    canvas.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, clientX: r.left + 50, clientY: r.top + 50, bubbles: true, composed: true, cancelable: true }));
    await w.updateComplete;
    assert.equal(w.zoomLevel, 110, `zoom ${w.zoomLevel}`);
  });
});

describe("<webwriter-flowchart> keyboard", function () {
  afterEach(reset);

  const canvasOf = (w: any) => w.shadowRoot!.querySelector("canvas")! as HTMLCanvasElement;

  it("makes the canvas one labelled tab stop", async function () {
    const w = await make();
    const canvas = canvasOf(w);
    assert.equal(canvas.tabIndex, 0);
    assert.isNotEmpty(canvas.getAttribute("aria-label"));
    assert.isNotNull(w.shadowRoot!.querySelector("#canvas-help"));
  });

  it("walks from node to node with the arrow keys", async function () {
    const w = await make({ edit: true });
    const canvas = canvasOf(w);
    canvas.focus();
    key(canvas, "ArrowDown");
    assert.equal(w.selectedNode?.id, "a", "first node in reading order");
    key(canvas, "ArrowDown");
    assert.equal(w.selectedNode?.id, "b");
    key(canvas, "ArrowUp");
    assert.equal(w.selectedNode?.id, "a");
    assert.isNotEmpty(w.announcement);
  });

  it("only moves the focus ring for readers who may not edit", async function () {
    const w = await make({ attrs: "disablestudentedit" });
    const canvas = canvasOf(w);
    canvas.focus();
    key(canvas, "ArrowDown");
    assert.equal(w.keyboard.focusNode?.id, "a");
    assert.isUndefined(w.selectedNode);
  });

  it("adds the focused node to the path being selected", async function () {
    const w = await make({ attrs: "disablestudentedit" });
    const canvas = canvasOf(w);
    canvas.focus();
    w.selectSequence();
    key(canvas, "ArrowDown");
    key(canvas, "Enter");
    key(canvas, "ArrowDown");
    key(canvas, " ");
    assert.deepEqual(w.selectedSequence.map((step: any) => step.id), ["a", "b"]);
  });

  it("opens the caption prompt on Enter for authors", async function () {
    const w = await make({ edit: true });
    const canvas = canvasOf(w);
    canvas.focus();
    key(canvas, "ArrowDown");
    key(canvas, "Enter");
    assert.equal(w.textPrompt?.type, "node");
    assert.equal(w.textPrompt?.index, 0);
  });

  it("moves the node with Alt and the arrow keys and writes it to the block", async function () {
    const w = await make({ edit: true });
    const canvas = canvasOf(w);
    canvas.focus();
    key(canvas, "ArrowDown");
    key(canvas, "ArrowRight", { altKey: true });
    key(canvas, "ArrowDown", { altKey: true, shiftKey: true });
    assert.equal(w.graphNodes[0].x, 110);
    assert.equal(w.graphNodes[0].y, 110);
    await until(() => dataOf(w).graphNodes[0].x === 110, "move written");
  });

  it("connects two nodes with c, the arrow keys and Enter", async function () {
    const w = await make({ edit: true });
    const canvas = canvasOf(w);
    canvas.focus();
    key(canvas, "ArrowDown");
    key(canvas, "c");
    assert.isTrue(w.pointer.isDrawingArrow, "dashed arrow while choosing");
    key(canvas, "Enter");
    assert.equal(w.arrows.length, 1);
    assert.equal(w.arrows[0].from.id, "a");
    assert.equal(w.arrows[0].to.id, "b");
    assert.isFalse(w.pointer.isDrawingArrow);
    await until(() => dataOf(w).graphNodes[0].connections?.length === 1, "connection written");
    key(canvas, "a");
    assert.equal(w.selectedArrow?.id, w.arrows[0].id, "a selects the arrow");
    key(canvas, "Delete");
    await until(() => w.arrows.length === 0, "arrow removed");
  });

  it("cancels a connection with Escape", async function () {
    const w = await make({ edit: true });
    const canvas = canvasOf(w);
    canvas.focus();
    key(canvas, "ArrowDown");
    key(canvas, "c");
    key(canvas, "Escape");
    assert.isFalse(w.pointer.isDrawingArrow);
    assert.equal(w.arrows.length, 0);
  });

  it("pans with Shift and the arrow keys, zooms with plus and minus", async function () {
    const w = await make();
    const canvas = canvasOf(w);
    canvas.focus();
    key(canvas, "ArrowLeft", { shiftKey: true });
    assert.equal(w.canvasOffsetX, 60);
    key(canvas, "+");
    assert.equal(w.zoomLevel, 110);
    key(canvas, "-");
    key(canvas, "-");
    assert.equal(w.zoomLevel, 90);
  });

  it("leaves the keys alone when the reader may not pan", async function () {
    const w = await make({ attrs: "disablestudentpan disablestudentedit" });
    const canvas = canvasOf(w);
    canvas.focus();
    assert.isTrue(key(canvas, "+"), "plus was consumed");
    assert.equal(w.zoomLevel, 100);
  });
});

describe("<webwriter-flowchart> touch", function () {
  afterEach(reset);

  const touch = (canvas: HTMLCanvasElement, type: string, id: number, x: number, y: number) =>
    canvas.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: "touch", isPrimary: id === 1, clientX: x, clientY: y, button: 0, bubbles: true, composed: true, cancelable: true }));

  it("selects a node with a tap", async function () {
    const w = await make({ edit: true });
    const canvas = w.shadowRoot!.querySelector("canvas")! as HTMLCanvasElement;
    const r = canvas.getBoundingClientRect();
    const x = r.left + 110, y = r.top + 75;
    touch(canvas, "pointerdown", 1, x, y);
    touch(canvas, "pointerup", 1, x, y);
    canvas.dispatchEvent(new MouseEvent("click", { clientX: x, clientY: y, bubbles: true, composed: true }));
    assert.equal(w.selectedNode?.id, "a");
  });

  it("drags a node with one finger", async function () {
    const w = await make({ edit: true });
    const canvas = w.shadowRoot!.querySelector("canvas")! as HTMLCanvasElement;
    const r = canvas.getBoundingClientRect();
    const x = r.left + 110, y = r.top + 75;
    touch(canvas, "pointerdown", 1, x, y);
    touch(canvas, "pointermove", 1, x + 40, y + 30);
    touch(canvas, "pointerup", 1, x + 40, y + 30);
    assert.isAbove(w.graphNodes.find((n: any) => n.id === "a").x, 120);
  });

  it("zooms with two fingers", async function () {
    const w = await make();
    const canvas = w.shadowRoot!.querySelector("canvas")! as HTMLCanvasElement;
    const r = canvas.getBoundingClientRect();
    const cx = r.left + 200, cy = r.top + 150;
    touch(canvas, "pointerdown", 1, cx - 40, cy);
    touch(canvas, "pointerdown", 2, cx + 40, cy);
    touch(canvas, "pointermove", 1, cx - 80, cy);
    touch(canvas, "pointermove", 2, cx + 80, cy);
    touch(canvas, "pointerup", 1, cx - 80, cy);
    touch(canvas, "pointerup", 2, cx + 80, cy);
    assert.isAbove(w.zoomLevel, 100);
  });

  it("opens the node menu with a long press", async function () {
    const w = await make({ edit: true });
    const canvas = w.shadowRoot!.querySelector("canvas")! as HTMLCanvasElement;
    const r = canvas.getBoundingClientRect();
    touch(canvas, "pointerdown", 1, r.left + 110, r.top + 75);
    await until(() => w.contextMenuAt, "context menu after the long press");
    touch(canvas, "pointerup", 1, r.left + 110, r.top + 75);
  });

  it("keeps the buttons at least 24px high", async function () {
    const w = await make({ edit: true });
    for (const button of w.shadowRoot!.querySelectorAll(".action-menu sl-button, .flowchart-menu-content sl-button")) {
      const box = (button as HTMLElement).getBoundingClientRect();
      assert.isAtLeast(box.height, 24);
      assert.isAtLeast(box.width, 24);
    }
  });
});

describe("<webwriter-flowchart> layout, theme and print", function () {
  afterEach(reset);

  it("limits the host width", async function () {
    const w = await make();
    const style = getComputedStyle(w);
    assert.equal(style.minWidth, "300px");
    assert.equal(style.maxWidth, "2100px");
    assert.equal(style.boxSizing, "border-box");
  });

  it("includes arrow captions in the content bounds", async function () {
    const w = await make();
    const Widget = customElements.get("webwriter-flowchart") as any;
    const load = async (caption: string) => {
      const apply = await Widget.convertFrom[".mmd"].call(w, new File([`flowchart TD\n A[One] -->|"${caption}"| B[Two]\n`], "c.mmd"));
      apply();
      await frame(); await frame();
      return w.view.contentBounds();
    };
    const plain = await load("x");
    const long = await load("a very long caption that is wider than both nodes together, really");
    assert.isBelow(long.minX, plain.minX, "the caption widens the box to the left");
    assert.isAbove(long.maxX, plain.maxX, "and to the right");
  });

  it("fits the chart in reading mode when none of it lies in view", async function () {
    const far = [{ id: "far", node: "op", text: "Far", x: 2000, y: 80, connections: [] }];
    const w = await make({ data: { graphNodes: far, taskList: [], helpList: [] } });
    await until(() => w.canvasOffsetX !== 0, "fitted");
    const left = -w.canvasOffsetX;
    assert.isAtMost(left, 2000, "the node lies right of the view's left edge");
    assert.isAbove(left + w.canvas.clientWidth / (w.zoomLevel / 100), 2000, "and inside the view");
  });

  it("leaves the view of an author alone", async function () {
    const far = [{ id: "far", node: "op", text: "Far", x: 2000, y: 80, connections: [] }];
    const w = await make({ edit: true, data: { graphNodes: far, taskList: [], helpList: [] } });
    await frame(); await frame();
    assert.equal(w.canvasOffsetX, 0);
  });

  it("follows the document's text color and font, and its accent for the grid", async function () {
    reset();
    mount.innerHTML = `<div style="--ww-text-color: rgb(1, 2, 3); --ww-font-family: Georgia; --ww-theme-accent-1: rgb(10, 20, 30)"><webwriter-flowchart height="400">${block({ graphNodes: NODES, taskList: [], helpList: [] })}</webwriter-flowchart></div>`;
    const w = mount.querySelector("webwriter-flowchart") as any;
    await w.updateComplete;
    await until(() => w.canvas, "canvas");
    const style = getComputedStyle(w);
    assert.equal(style.color, "rgb(1, 2, 3)");
    assert.include(style.fontFamily, "Georgia");
    assert.equal(w.view.accent(1, "red"), "rgb(10, 20, 30)");
    assert.equal(getComputedStyle(w.shadowRoot!.querySelector(".workspace")!).getPropertyValue("--sl-font-sans").trim(), "Georgia");
  });

  it("falls back to the plain colors without a theme", async function () {
    const w = await make();
    assert.equal(w.view.accent(1, "#104e8b"), "#104e8b");
  });

  it("exposes the canvas and workspace as parts", async function () {
    const w = await make();
    assert.equal(w.shadowRoot!.querySelector("canvas")!.getAttribute("part"), "canvas");
    assert.equal(w.shadowRoot!.querySelector(".workspace")!.getAttribute("part"), "workspace");
  });

  it("draws the whole chart before printing and goes back afterwards", async function () {
    const w = await make({ data: { graphNodes: NODES, taskList: [{ titel: "Draw it", content: "Connect the steps" }], helpList: [] } });
    const before = w.canvas.width;
    window.dispatchEvent(new Event("beforeprint"));
    assert.isDefined(w.view.print);
    assert.notEqual(w.canvas.width, before, "canvas sized to the chart");
    assert.match(w.canvas.style.width, /px$/);
    window.dispatchEvent(new Event("afterprint"));
    assert.isUndefined(w.view.print);
    assert.equal(w.canvas.style.width, "100%");
    assert.equal(w.canvas.width, before);
  });

  it("prints the tasks and a note for an empty chart", async function () {
    const w = await make({ data: { graphNodes: [], taskList: [{ titel: "Draw it", content: "Connect the steps" }], helpList: [] } });
    assert.isNotNull(w.shadowRoot!.querySelector(".print-note"));
    assert.include(w.shadowRoot!.querySelector(".print-tasks")!.textContent, "Draw it");
    const full = await make();
    assert.isNull(full.shadowRoot!.querySelector(".print-note"));
    assert.isNull(full.shadowRoot!.querySelector(".print-tasks"));
  });

  it("removes its print listeners on disconnect", async function () {
    const w = await make();
    window.dispatchEvent(new Event("beforeprint"));
    w.remove();
    assert.isUndefined(w.view.print, "print state ends with the element");
  });

  it("offers the tasks and hints to readers who have some", async function () {
    const none = await make();
    assert.equal(none.shadowRoot!.querySelectorAll(".action-menu sl-button").length, 2, "grab, fullscreen");
    const some = await make({ data: { graphNodes: NODES, taskList: [{ titel: "T", content: "c" }], helpList: [{ titel: "H", content: "h" }] } });
    assert.equal(some.shadowRoot!.querySelectorAll(".action-menu sl-button").length, 4);
  });
});

mocha.run();
