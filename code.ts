// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

let exportData: any[];

function updateSelection()
{
    const selection = figma.currentPage.selection;
    exportData = [];
    for (const node of selection) {
        // 位置やサイズを持つノード（SceneNodeなど）のみを処理
        if ('x' in node && 'width' in node) {
            exportData.push({
                name: node.name,
                type: node.type,
                x: node.x,
                y: node.y,
                width: node.width,
                height: node.height
            });
        }
    }
    figma.ui.postMessage({ type: 'selectionChanged', num: selection.length});
}
updateSelection();

figma.on("selectionchange", () => { 
  updateSelection();
});

// message from ui
figma.ui.onmessage =  (msg: {type: string}) => {
  if (msg.type === 'export') {
    const jsonString = JSON.stringify(exportData, null, 2); 
    figma.ui.postMessage({ type: 'EXPORT_REQUEST', jsonData: jsonString });
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
