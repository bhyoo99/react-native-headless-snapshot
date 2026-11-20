import type { Align, Config, Edge, Node, Yoga } from "yoga-layout/load"
import extractText, { textInputText } from "./extract-text"
import { flattenStyles } from "./flatten-styles"
import { Component, Settings } from "./index"
import { measureAndroid } from "./text/android"
import { measureIOS } from "./text/ios"
import { breakLines, measureLines, textSlice } from "./text-layout"
import { getYoga } from "./yoga"

export const textLines = Symbol("textLines")

const isNotEmpty = prop => typeof prop !== "undefined" && prop !== null

const edges = (yoga: Yoga): Array<[string, Edge]> => [
  ["", yoga.EDGE_ALL],
  ["Vertical", yoga.EDGE_VERTICAL],
  ["Horizontal", yoga.EDGE_HORIZONTAL],
  ["Top", yoga.EDGE_TOP],
  ["Bottom", yoga.EDGE_BOTTOM],
  ["Left", yoga.EDGE_LEFT],
  ["Right", yoga.EDGE_RIGHT],
  ["Start", yoga.EDGE_START],
  ["End", yoga.EDGE_END],
  ["Block", yoga.EDGE_VERTICAL],
  ["BlockStart", yoga.EDGE_TOP],
  ["BlockEnd", yoga.EDGE_BOTTOM],
  ["Inline", yoga.EDGE_HORIZONTAL],
  ["InlineStart", yoga.EDGE_START],
  ["InlineEnd", yoga.EDGE_END],
]

const positionEdges = (yoga: Yoga): Array<[string, Edge]> => [
  ["top", yoga.EDGE_TOP],
  ["bottom", yoga.EDGE_BOTTOM],
  ["left", yoga.EDGE_LEFT],
  ["right", yoga.EDGE_RIGHT],
  ["start", yoga.EDGE_START],
  ["end", yoga.EDGE_END],
  ...edges(yoga)
    .filter(([suffix]) => ["", "Block", "BlockStart", "BlockEnd", "Inline", "InlineStart", "InlineEnd"].includes(suffix))
    .map(([suffix, edge]): [string, Edge] => ["inset" + suffix, edge]),
]

const alignValues = (yoga: Yoga): Record<string, Align> => ({
  "auto": yoga.ALIGN_AUTO,
  "flex-start": yoga.ALIGN_FLEX_START,
  "flex-end": yoga.ALIGN_FLEX_END,
  "center": yoga.ALIGN_CENTER,
  "stretch": yoga.ALIGN_STRETCH,
  "baseline": yoga.ALIGN_BASELINE,
  "space-between": yoga.ALIGN_SPACE_BETWEEN,
  "space-around": yoga.ALIGN_SPACE_AROUND,
  "space-evenly": yoga.ALIGN_SPACE_EVENLY,
})

const setEnum = <T>(value: unknown, values: Record<string, T>, set: (value: T) => void) => {
  if (typeof value === "string" && Object.prototype.hasOwnProperty.call(values, value)) {
    set(values[value])
  }
}

const aspectRatioOf = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return value
  }
  if (typeof value === "string") {
    const [width, height = "1"] = value.split("/")
    return Number(width) / Number(height)
  }
  return undefined
}

const applyStyle = (yoga: Yoga, node: Node, style: any) => {
  if (isNotEmpty(style.width)) { node.setWidth(style.width) }
  if (isNotEmpty(style.height)) { node.setHeight(style.height) }
  if (isNotEmpty(style.minWidth)) { node.setMinWidth(style.minWidth) }
  if (isNotEmpty(style.minHeight)) { node.setMinHeight(style.minHeight) }
  if (isNotEmpty(style.maxWidth)) { node.setMaxWidth(style.maxWidth) }
  if (isNotEmpty(style.maxHeight)) { node.setMaxHeight(style.maxHeight) }

  for (const [suffix, edge] of edges(yoga)) {
    if (isNotEmpty(style["margin" + suffix])) { node.setMargin(edge, style["margin" + suffix]) }
    if (isNotEmpty(style["padding" + suffix])) { node.setPadding(edge, style["padding" + suffix]) }
    if (isNotEmpty(style["border" + suffix + "Width"])) { node.setBorder(edge, style["border" + suffix + "Width"]) }
  }
  for (const [key, edge] of positionEdges(yoga)) {
    if (isNotEmpty(style[key])) { node.setPosition(edge, style[key]) }
  }

  if (isNotEmpty(style.flex)) { node.setFlex(style.flex) }
  if (isNotEmpty(style.flexGrow)) { node.setFlexGrow(style.flexGrow) }
  if (isNotEmpty(style.flexShrink)) { node.setFlexShrink(style.flexShrink) }
  if (isNotEmpty(style.flexBasis)) { node.setFlexBasis(style.flexBasis) }

  const aspectRatio = aspectRatioOf(style.aspectRatio)
  if (aspectRatio !== undefined) { node.setAspectRatio(aspectRatio) }

  if (isNotEmpty(style.gap)) { node.setGap(yoga.GUTTER_ALL, style.gap) }
  if (isNotEmpty(style.rowGap)) { node.setGap(yoga.GUTTER_ROW, style.rowGap) }
  if (isNotEmpty(style.columnGap)) { node.setGap(yoga.GUTTER_COLUMN, style.columnGap) }

  setEnum(style.position, {
    absolute: yoga.POSITION_TYPE_ABSOLUTE,
    relative: yoga.POSITION_TYPE_RELATIVE,
    static: yoga.POSITION_TYPE_STATIC,
  }, value => node.setPositionType(value))
  setEnum(style.display, {
    flex: yoga.DISPLAY_FLEX,
    none: yoga.DISPLAY_NONE,
    contents: yoga.DISPLAY_CONTENTS,
  }, value => node.setDisplay(value))
  setEnum(style.overflow, {
    visible: yoga.OVERFLOW_VISIBLE,
    hidden: yoga.OVERFLOW_HIDDEN,
    scroll: yoga.OVERFLOW_SCROLL,
  }, value => node.setOverflow(value))
  setEnum(style.direction, {
    inherit: yoga.DIRECTION_INHERIT,
    ltr: yoga.DIRECTION_LTR,
    rtl: yoga.DIRECTION_RTL,
  }, value => node.setDirection(value))
  setEnum(style.boxSizing, {
    "border-box": yoga.BOX_SIZING_BORDER_BOX,
    "content-box": yoga.BOX_SIZING_CONTENT_BOX,
  }, value => node.setBoxSizing(value))
  setEnum(style.flexDirection, {
    "row": yoga.FLEX_DIRECTION_ROW,
    "column": yoga.FLEX_DIRECTION_COLUMN,
    "row-reverse": yoga.FLEX_DIRECTION_ROW_REVERSE,
    "column-reverse": yoga.FLEX_DIRECTION_COLUMN_REVERSE,
  }, value => node.setFlexDirection(value))
  setEnum(style.flexWrap, {
    "nowrap": yoga.WRAP_NO_WRAP,
    "wrap": yoga.WRAP_WRAP,
    "wrap-reverse": yoga.WRAP_WRAP_REVERSE,
  }, value => node.setFlexWrap(value))
  setEnum(style.justifyContent, {
    "flex-start": yoga.JUSTIFY_FLEX_START,
    "flex-end": yoga.JUSTIFY_FLEX_END,
    "center": yoga.JUSTIFY_CENTER,
    "space-between": yoga.JUSTIFY_SPACE_BETWEEN,
    "space-around": yoga.JUSTIFY_SPACE_AROUND,
    "space-evenly": yoga.JUSTIFY_SPACE_EVENLY,
  }, value => node.setJustifyContent(value))
  setEnum(style.alignItems, alignValues(yoga), value => node.setAlignItems(value))
  setEnum(style.alignSelf, alignValues(yoga), value => node.setAlignSelf(value))
  setEnum(style.alignContent, alignValues(yoga), value => node.setAlignContent(value))
}

const componentToNode = (component: Component, settings: Settings, config?: Config): Node => {
  const yoga = getYoga()
  const node = yoga.Node.create(config)

  if (component.props && component.props.style) {
    applyStyle(yoga, node, styleFromComponent(component))
  }

  if (component.type === "TextInput" && (settings.platform === "android" || settings.platform === "ios")) {
    const measure = settings.platform === "android" ? measureAndroid : measureIOS
    const { styledText, empty } = textInputText(component)
    const multiline = Boolean(component.props && component.props.multiline)
    const paragraph = { includeFontPadding: true }
    component[textLines] = null
    node.setMeasureFunc((width, widthMode) => {
      const measured = measure(styledText, width, multiline ? widthMode : 0, paragraph, settings.scale ?? 1)
      component[textLines] = empty ? null : measured.lines.map(line => ({
        ...textSlice(styledText, line.start, line.end),
        metrics: line,
      }))
      const measuredWidth = empty ? 0 : measured.width
      return { width: widthMode === 0 ? measuredWidth : Math.min(measuredWidth, width), height: measured.height }
    })
    return node
  }

  // We're in a node showing Text
  if (component && component.type === "Text") {
    const styledText = extractText(component)
    component[textLines] = null
    if (settings.platform === "android" || settings.platform === "ios") {
      const measure = settings.platform === "android" ? measureAndroid : measureIOS
      const rootStyle = (component.props && component.props.style && styleFromComponent(component)) || {}
      const paragraph = {
        numberOfLines: component.props && component.props.numberOfLines,
        includeFontPadding: rootStyle.includeFontPadding !== false,
      }
      node.setMeasureFunc((width, widthMode) => {
        const measured = measure(styledText, width, widthMode, paragraph, settings.scale ?? 1)
        component[textLines] = measured.lines.map(line => ({
          ...textSlice(styledText, line.start, line.end),
          metrics: line,
        }))
        return { width: measured.width, height: measured.height }
      })
    } else {
      node.setMeasureFunc(width => {
        const lines = breakLines(styledText, width)
        component[textLines] = lines
        return measureLines(lines)
      })
    }
  }

  return node
}

export const styleFromComponent = (component: Component) => {
  let style = component.props.style

  if (Array.isArray(style)) {
    style = flattenStyles(style)
  }

  return style
}

export default componentToNode
