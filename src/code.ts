// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

import { convertAppearanceProps } from './convertAppearanceProps'
import { convertTextProps } from './convertTextProps'
import { convertEffectProps } from './convertEffectProps'

const { XMLParser, XMLBuilder } = require("fast-xml-parser");

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 320, height: 320 });

let rootData: any;
let xmlString: String;
const converter = new XMLBuilder({
  processEntities: false,
  format: true,
  ignoreAttributes: false,
  // commentPropName: "comment"
});

function convertLayoutProps(node: SceneNode) {
  const props: any = {};
  // 位置やサイズを持つノード（SceneNodeなど）のみを処理
  if ('x' in node && 'width' in node) {
    props["x"] = node.x; // pos in parent
    props["y"] = node.y; // pos in parent
    props["width"] = node.width;
    props["height"] = node.height;
  }
  return props;
}

function prefixKeysWithoutChildObject(obj: any) {
  if (typeof obj !== "object") {
    return;
  }

  for (const key of Object.keys(obj)) {
    const value:any = obj[key];

    if (value === null) continue;

          // 子を再帰探索
    if (typeof value === "object") {
      prefixKeysWithoutChildObject(value);
    }
    // 子Objectを持たない場合にprefix付与
    else if (key.startsWith("@_") === false) {

      obj[`@_${key}`] = value;
      console.log(key + ", " + `@_${key}`);
      delete obj[key];
    }

  }
}

function updateSelection() {
  const selection = figma.currentPage.selection;
  let exportData = [];
  for (const node of selection) {
    let tmpNode =
    {
      "name": node.name,
      "type": node.type,
    };
    tmpNode = Object.assign(tmpNode, convertLayoutProps(node), convertAppearanceProps(node), convertTextProps(node), convertEffectProps(node));
    exportData.push({
      node: tmpNode
    });
  }

  prefixKeysWithoutChildObject(exportData);
  rootData = { "root": exportData };
  xmlString = converter.build(rootData);
  figma.ui.postMessage({ type: 'UPDATE_SELECTION', num: selection.length, convertedData: xmlString });
}
updateSelection();

figma.on("selectionchange", () => {
  updateSelection();
});

// message from ui
figma.ui.onmessage = (msg: { type: string }) => {
  if (msg.type === 'export') {
    figma.ui.postMessage({ type: 'EXPORT', convertedData: xmlString });
  }
  else if (msg.type === 'copy') {
    figma.ui.postMessage({ type: 'COPY', convertedData: xmlString });
  }
  else if (msg.type === 'response') {
    console.log("received response");
  }
  else if (msg.type === 'quit') {
    figma.closePlugin();
  }
  else {
    console.log("received undefined msg.");
  }
}
