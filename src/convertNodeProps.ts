import { convertAppearanceProps } from './convertAppearanceProps'
import { convertTextProps } from './convertTextProps'
import { convertEffectProps } from './convertEffectProps'

function convertRectangleProps(node: SceneNode) {
  const props: any = {};
  // 位置やサイズを持つノード（SceneNodeなど）のみを処理
  if ('x' in node && 'width' in node) {
    props["x"] = node.x; // pos in parent
    props["y"] = node.y; // pos in parent
    props["width"] = node.width;
    props["height"] = node.height;
  }


  if ('cornerRadius' in node && node.cornerRadius !== figma.mixed) {
    props["radius"] = node.cornerRadius;
  }
  else if ('topLeftRadius' in node) {
    props["radius"] = node.topLeftRadius;
    // topRight
    // bottomLeft
    // bottomRight
  }

  return props;
}

export function convertNodeProps(node: SceneNode | ComponentNode) {
  let props: any = {};
  props["name"] = node.name;
  props["type"] = node.type;
  props = Object.assign(props, convertRectangleProps(node), convertAppearanceProps(node), convertTextProps(node), convertEffectProps(node));

  if ('children' in node) {
    const children = [];
    for (const child of node.children) {
      children.push(convertNodeProps(child));
    }
    props["node"] = children;
  }
  else {
    // props = Object.assign(props, convertLayoutProps(node), convertAppearanceProps(node), convertTextProps(node), convertEffectProps(node));
  }

        // variant.getCSSAsync().then((res)=>{
      //   console.log("Properties:",  res);
      // });

  return props;
}

export async function convertComponentsAsync() {
  let componentsRoot: Object[] = [];

  await figma.loadAllPagesAsync();

  // component set
  const componentSets = figma.root.findAll(
    node => node.type === "COMPONENT_SET"
  ) as ComponentSetNode[];

  componentSets.forEach(set => {
    // console.log("ComponentSet:", set.name);

    set.children.forEach(variant => {
      componentsRoot.push(convertNodeProps(variant));
    });
  });

  // component
  const components = figma.root.findAll(node => node.type === "COMPONENT") as ComponentNode[];
  components.forEach(c => {
    // console.log({
    //   id: c.id,
    //   name: c.name,
    //   description: c.description,
    //   width: c.width,
    //   height: c.height,
    // });
    componentsRoot.push(convertNodeProps(c));
    // c.children.forEach(node => {
    //   console.log(node.name);
    // });
  });

  return componentsRoot;
}
