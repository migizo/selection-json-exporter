
export function convertTextProps(node: SceneNode) {
  const props: any = {};

  // https://developers.figma.com/docs/plugins/api/TextNode/
  if (node.type == "TEXT") {
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
    props["align"] = hAlignMap[node.textAlignHorizontal];
    props["textAlignV"] = vAlignMap[node.textAlignVertical];

    props["fontSize"] = node.fontSize;
    props["fontFamily"] =
      (typeof node.fontName === "object")
        ? node.fontName.family
        : "";
    props["fontStyle"] = (typeof node.fontName === "object")
      ? node.fontName.style
      : "";

    function getUnitSuffix(unit: any) {
      if (unit === "PERCENT") return "%";
      else if (unit === "PIXELS") return "px";
      return "";
    }

    // mix
    // https://developers.figma.com/docs/plugins/working-with-text/
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