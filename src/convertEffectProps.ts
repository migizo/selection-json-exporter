import { rgbToHex, vToDenormalize } from './Util'

function convertShadow(effect: Effect, prefix: string) {
    const props: any = {};
    if (effect.type == "DROP_SHADOW" || effect.type == "INNER_SHADOW") {
        props[`${prefix}shadow_color`] = rgbToHex(effect.color);
        props[`${prefix}shadow_opa`] = vToDenormalize(effect.color.a);
        props[`${prefix}shadow_width`] = Math.round(effect.radius)
        props[`${prefix}shadow_offset_x`] = Math.round(effect.offset.x);
        props[`${prefix}shadow_offset_y`] = Math.round(effect.offset.y);
    }
    return props;
}

function convertBlur(effect: Effect, prefix: string) {
    const props: any = {};
    if (effect.type == "LAYER_BLUR" || effect.type == "BACKGROUND_BLUR") {
                // radius(0–?) → opa(0–255) に簡易マッピング
            const opa = Math.min(255, Math.round(effect.radius * 4));
            props[`${prefix}blur_opa`] = opa;
    }
    return props;
}

function convertEffect(effect: Effect) {
    switch (effect.type) {
        case "DROP_SHADOW":
            return convertShadow(effect, "");
        case "INNER_SHADOW":
                        // return convertShadow(effect, "inner_");
            break;
        case "LAYER_BLUR":
            return convertBlur(effect, "bg_");
        case "BACKGROUND_BLUR":
            // return convertBlur(effect, "bg_");
            break;
    }
    return {};
}

export function convertEffectProps(node: SceneNode) {
    const props: any = {};
    if ("effects" in node) {
        for (const effect of node.effects) {
            Object.assign(props, convertEffect(effect));
        }
    }

    //   if ('x' in node && 'width' in node) {
    //     props["x"] = node.x; // pos in parent
    //     props["y"] = node.y; // pos in parent
    //     props["width"] = node.width;
    //     props["height"] = node.height;
    //   }
    return props;
}