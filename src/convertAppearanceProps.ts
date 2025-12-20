import { rgbToHex, vToDenormalize } from './Util'

function pickGradientColors(stops: readonly ColorStop[]) {
    const start = stops[0];
    const end = stops[stops.length - 1];

    return {
        startColor: rgbToHex(start.color),
        endColor: rgbToHex(end.color),
        startOpa: vToDenormalize(start.color.a),
        endOpa: vToDenormalize(end.color.a),
    };
}

function convertPaint(paint: Paint, prefix: string) {
    const props: any = {};
    // props["alpha"]
    switch (paint.type) {
        case "SOLID":
            props[`${prefix}color`] = rgbToHex(paint.color);
            if (paint.opacity !== undefined) props[`${prefix}opa`] = vToDenormalize(paint.opacity);
            break;
        case "GRADIENT_LINEAR":
            const dir =
                Math.abs(paint.gradientTransform[0][1] - paint.gradientTransform[1][1]) > // y
                    Math.abs(paint.gradientTransform[0][0] - paint.gradientTransform[1][0])   // x
                    ? "VER"
                    : "HOR";
            props[`${prefix}grad_dir`] = dir;
        // break;
        case "GRADIENT_RADIAL":
        case "GRADIENT_ANGULAR":
        case "GRADIENT_DIAMOND":
            const grad = pickGradientColors(paint.gradientStops);
            props[`${prefix}color`] = grad.startColor;
            props[`${prefix}grad_color`] = grad.endColor;
            break;
        case "IMAGE":
            props[`${prefix}img_src`] = paint.imageHash; // TODO: IDしか取れないので対処
            break;
    }
    return props;
}

export function convertAppearanceProps(node: SceneNode) {
    const props: any = {};
    if ("fills" in node && node.fills !== figma.mixed) {
        for (const fill of node.fills) {
            Object.assign(props, convertPaint(fill, "bg_"));
        }
    }
    if ("strokes" in node) {
        for (const stroke of node.strokes) {
            Object.assign(props, convertPaint(stroke, "border_"));

        }
    }
    return props;
}