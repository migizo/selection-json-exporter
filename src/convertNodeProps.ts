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

function convertTriggerProps(trigger: Trigger) {
  let props: any = {};
  switch (trigger.type) {
    case 'ON_CLICK':
    case 'ON_HOVER':
    case 'ON_PRESS':
    case 'ON_DRAG':
    case 'AFTER_TIMEOUT':
    case 'MOUSE_UP':
    case 'MOUSE_DOWN':
    case 'MOUSE_ENTER':
    case 'MOUSE_LEAVE':
    case 'ON_KEY_DOWN':
    case 'ON_MEDIA_HIT':
    case 'ON_MEDIA_END':
    default:
      break;
  }
  return props;
}

function convertActionProps(action: Action) {
  let props: any = {};
  switch (action.type) {
    case 'BACK':
    case 'CLOSE':
      break;
    case 'URL':
    case 'UPDATE_MEDIA_RUNTIME':
    case 'SET_VARIABLE':
    case 'SET_VARIABLE_MODE':
    case 'CONDITIONAL':
    case 'NODE':
    default:
      break;
  }
  return props;
}

export function convertNodeProps(node: SceneNode | ComponentNode) {
  let props: any = {};
  props["name"] = node.name;
  props["type"] = node.type;
  props = Object.assign(props, convertRectangleProps(node), convertAppearanceProps(node), convertTextProps(node), convertEffectProps(node));

  // TODO: prototype途中
  if ('reactions' in node) {
    let reactionsArray: any[] = [];
    for (const reaction of node.reactions) {
      if (reaction.trigger) {
        // let triggerProps = convertTriggerProps(reaction.trigger);
      }
      if (reaction.actions) {
        //       const actionsArray:any[] = [];

        for (const action of reaction.actions) {
          let actionProps = convertActionProps(action);
          // actionsArray.push({ "type": action.type });
        }
        //       reactionsArray.push({ "trigger": reaction.trigger, "actions": { "action": actionsArray } });
      }
    }
    //   if (reactionsArray.length > 0) {
    //     props["reaction"] = { "reaction": reactionsArray };
    // }
  }

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

  // await figma.loadAllPagesAsync();

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
