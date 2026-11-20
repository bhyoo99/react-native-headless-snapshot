import { TextWithAttributedStyle } from "../extract-text"
import type { MeasuredLine } from "../text/types"
import { fontWithFallbacks, getDefaultFont } from "../font-loader"
import { lineBaseline, lineFontSize, lineHeight } from "../text-layout"
import { $, escapeText } from "./util"

const textStyles = style => ({
  "font-family": fontWithFallbacks(style.fontFamily ?? getDefaultFont()),
  "font-weight": style.fontWeight,
  "font-style": style.fontStyle,
  "font-size": style.fontSize,
})

const textAligns = {
  left: 0,
  center: 0.5,
  right: 1,
}

const textAnchors = {
  left: "start",
  center: "middle",
  right: "end",
}

type DrawnLine = TextWithAttributedStyle & { metrics?: MeasuredLine }

const measuredText = (x, y, width, lines: DrawnLine[], textAlign: string): string =>
  $("text", { x, y }, lines.map(line => {
    const metrics = line.metrics as MeasuredLine
    const lineX = x + (width - metrics.width) * (textAligns[textAlign] ?? 0)
    return line.attributedStyles.map(({ start, end, style }, i) => {
      const last = i === line.attributedStyles.length - 1
      const body = last ? line.text.slice(start, end).replace(/\s*$/, "") : line.text.slice(start, end)
      return $("tspan", {
        x: i === 0 ? lineX : undefined,
        y: i === 0 ? y + metrics.baseline : undefined,
        fill: style.color,
        ...textStyles(style),
      }, escapeText(last && metrics.ellipsized ? body + "\u2026" : body))
    }).join("\n")
  }).join("\n"))

export default (x, y, width, height, lines: DrawnLine[]): string => {
  const { textAlign = "left" as string } = lines[0].attributedStyles[0].style
  if (lines[0].metrics) {
    return measuredText(x, y, width, lines, textAlign)
  }
  const originX = x + width * textAligns[textAlign]

  const { textLines } = lines.reduce((accum, line) => {
    const { text, attributedStyles } = line
    const originY = accum.y + lineBaseline(line) + (lineHeight(line) - lineFontSize(line)) / 2

    const tspans = attributedStyles.map(({ start, end, style }, i) => (
      $("tspan", {
        x: i === 0 ? originX : undefined,
        y: i === 0 ? originY : undefined,
        fill: style.color,
        ...textStyles(style),
      }, escapeText(i === attributedStyles.length - 1
        ? text.slice(start, end).replace(/\s*$/, "")
        : text.slice(start, end)
      ))
    ))

    return {
      y: accum.y + lineHeight(line),
      textLines: accum.textLines.concat(tspans.join("\n"))
    }
  }, {
    y,
    textLines: []
  } as { y: number, textLines: string[] })

  return $("text", {
    x,
    y,
    "text-anchor": textAlign !== "left" ? textAnchors[textAlign as string] : undefined,
  }, textLines.join("\n"))
}
