// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

import { convertNodeProps, convertComponentsAsync } from './convertNodeProps'
import { convertStylesAsync } from './convertStyles'

const { XMLParser, XMLBuilder } = require("fast-xml-parser");

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 320, height: 320 });

let xmlString: String;
const converter = new XMLBuilder({
  format: true,
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // oneListGroup: false, // 配列無しにするかどうか
  // arrayNodeName: "node",
  processEntities: false,
  commentPropName: "comment"
});

function prefixKeysWithoutChildObject(obj: any) {
  if (typeof obj !== "object") {
    return;
  }

  for (const key of Object.keys(obj)) {
    const value: any = obj[key];

    if (value === null) continue;

    // 子を再帰探索
    if (typeof value === "object") {
      prefixKeysWithoutChildObject(value);
    }
    // 子Objectを持たない場合にprefix付与
    else if (key.startsWith("@_") === false) {

      obj[`@_${key}`] = value;
      delete obj[key];
    }
  }
}

async function convertRoot()
{
  const selection = figma.currentPage.selection;
  let nodeTree = [];
  for (const node of selection) {
    let tmpNode = convertNodeProps(node);
    nodeTree.push(tmpNode);
  }

  let styles = await convertStylesAsync();
  let components = await convertComponentsAsync();
  
    let root = { "root": 
      {"nodes": {"node": nodeTree}, "styles": {"style": styles}, "components": {"component": components}}
    };

    return root;
}

function updateSelection() {
  const selection = figma.currentPage.selection;

  convertRoot().then((res)=>{
    prefixKeysWithoutChildObject(res);
    xmlString = converter.build(res);
    figma.ui.postMessage({ type: 'UPDATE_SELECTION', num: selection.length, convertedData: xmlString });
  });
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
