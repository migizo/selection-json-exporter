import { convertPaint } from './convertAppearanceProps'

const hAlignMap = {
    LEFT: "left",
    CENTER: "center",
    RIGHT: "right",
    JUSTIFIED: "auto",
};
const vAlignMap = {
    TOP: "top",
    CENTER: "center",
    BOTTOM: "bottom",
};

        function getUnitSuffix(unit: any) {
            if (unit === "PERCENT") return "%";
            else if (unit === "PIXELS") return "px";
            return "";
        }
        
function covertFontProps(text: SceneNode | TextStyle) {
    const props: any = {};
    if (text.type == "TEXT") {
        props["fontSize"] = text.fontSize;
        props["fontFamily"] =
            (typeof text.fontName === "object")
                ? text.fontName.family
                : "";
        props["fontStyle"] = (typeof text.fontName === "object")
            ? text.fontName.style
            : "";
    }
    return props;
}

export function convertTextStyleProps(style: TextStyle)
{
    const props: any = {};
    Object.assign(props, covertFontProps(style));
    return props;
}

export function convertTextProps(node: SceneNode) {
    const props: any = {};

    // https://developers.figma.com/docs/plugins/api/TextNode/
    if (node.type == "TEXT") {
        props["align"] = hAlignMap[node.textAlignHorizontal];
        props["textAlignV"] = vAlignMap[node.textAlignVertical];
        Object.assign(props, covertFontProps(node));
        // props["fontSize"] = node.fontSize;
        // props["fontFamily"] =
        //     (typeof node.fontName === "object")
        //         ? node.fontName.family
        //         : "";
        // props["fontStyle"] = (typeof node.fontName === "object")
        //     ? node.fontName.style
        //     : "";



        // mix
        // https://developers.figma.com/docs/plugins/working-with-text/
        // https://developers.figma.com/docs/plugins/api/properties/TextNode-getstyledtextsegments/
        const segments = node.getStyledTextSegments(['fontName', 'indentation', 'letterSpacing', 'lineHeight']);
        for (const seg of segments) {
            let segProps: any = {};
            segProps["start"] = seg.start;
            segProps["end"] = seg.end;
            segProps["letterSpacing"] = seg.letterSpacing.value + getUnitSuffix(seg.letterSpacing.unit);
            if (seg.lineHeight.unit !== "AUTO") segProps["@_lineHeight"] = seg.lineHeight.value + getUnitSuffix(seg.lineHeight.unit);
            if (seg.indentation !== 0) segProps["@_indentation"] = seg.indentation;
            segProps["fontFamily"] = seg.fontName.family;
            segProps["fontStyle"] = seg.fontName.style;
            props["segment"] = segProps;
        }
    }
    return props;
}