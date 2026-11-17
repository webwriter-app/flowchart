/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import "../src/widgets/webwriter-flowchart";
import {
  NODES, dataOf, frame, key, make, reset, until,
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

mocha.run();
