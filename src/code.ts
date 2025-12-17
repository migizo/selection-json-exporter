// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

const { XMLParser, XMLBuilder } = require("fast-xml-parser");

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {width: 320, height: 320});

let exportData: any[];
let rootData:any;
let xmlString: String;
const converter = new XMLBuilder({
    processEntities:false,
    format: true,
    ignoreAttributes: false,
    // commentPropName: "comment"
});

function updateSelection()
{
    const selection = figma.currentPage.selection;
    exportData = [];
    for (const node of selection) {
        // 位置やサイズを持つノード（SceneNodeなど）のみを処理
        if ('x' in node && 'width' in node) {
            exportData.push({node: 
              {
                "@_name": node.name,
                "@_type": node.type,
                "@_x": node.x,
                "@_y": node.y,
                "@_width": node.width,
                "@_height": node.height
            }
            });
        }
    }
    rootData = {"root": exportData};
    xmlString = converter.build(rootData);
    figma.ui.postMessage({ type: 'selectionChanged', num: selection.length, convertedData: xmlString});
}
updateSelection();

figma.on("selectionchange", () => { 
  updateSelection();
});

// message from ui
figma.ui.onmessage =  (msg: {type: string}) => {
  if (msg.type === 'export') {
    figma.ui.postMessage({ type: 'EXPORT_REQUEST', convertedData: xmlString });
  } 
  else if (msg.type === 'copy') {
    figma.ui.postMessage({ type: 'COPY_REQUEST', convertedData: xmlString });
  }
  else if (msg.type === 'EXPORT_RESPONSE') {
    console.log("exported.");
    figma.closePlugin();
  } 
  else if (msg.type === 'cancel') {
    figma.closePlugin();
  } else {
    console.log("received undefined msg.");
  }
}
