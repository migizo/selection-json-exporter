import { convertPaint } from './convertAppearanceProps'
import { convertTextStyleProps } from './convertTextProps'
import { convertEffect } from './convertEffectProps'

function prepareProps(stylesRoot: any[], style: any) {
    let props = stylesRoot.find(i => "name" in i && i.name === style.name);
    if (props === undefined) {
        props = { "name": style.name };
        stylesRoot.push(props);
    }
    return props;
}

function convertPaintStyles(stylesRoot: any[], styles: PaintStyle[]) {
    styles.forEach(style => {
        let props = prepareProps(stylesRoot, style);
        props["id"] = style.id;
        // props["description"] = style.description;

        // とりあえずひとつのみ対応
        if (style.paints.length > 0) { Object.assign(props, convertPaint(style.paints[0], "")); }
        // style.paints.forEach(paint => {
        //     convertPaint(paint, ""); // prefix...?
        // });
    });

}

function convertTextStyles(stylesRoot: any[], styles: TextStyle[]) {
    styles.forEach(style => {
        let props = prepareProps(stylesRoot, style);
        props["id"] = style.id;
        // props["description"] = style.description;

        Object.assign(props, convertTextStyleProps(style));
    });
}

function convertEffectStyles(stylesRoot: any[], styles: EffectStyle[]) {
    styles.forEach(style => {
        let props = prepareProps(stylesRoot, style);
        props["id"] = style.id;
        // props["description"] = style.description;

        if ("effects" in style.effects) { // TODO: 複数どうやって対応させるか
            for (const effect of style.effects) {
                Object.assign(props, convertEffect(effect));
            }
        }
    });
}

export async function convertStylesAsync() {
    let stylesRoot: Object[] = [];

    await figma.getLocalPaintStylesAsync().then((styles) => {
        convertPaintStyles(stylesRoot, styles);
    });
    await figma.getLocalTextStylesAsync().then((styles) => {
        convertTextStyles(stylesRoot, styles);
    });
    await figma.getLocalEffectStylesAsync().then((styles) => {
        convertEffectStyles(stylesRoot, styles);
    });

    return stylesRoot;
}