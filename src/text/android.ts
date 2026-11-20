import { LineBreaker } from "linebreak"

import type { TextWithAttributedStyle } from "../extract-text"
import { fallbackFontsFor, isVariationInstance, resolveFont, withVariation } from "../font-loader"
import type { MeasuredLine, MeasuredText, Paragraph } from "./types"

interface FontMetricsInt {
  top: number
  ascent: number
  descent: number
  bottom: number
}

interface Run {
  start: number
  end: number
  style: any
  font: any
  sizePx: number
  letterSpacingPx: number
  lineHeightPx?: number
  metrics: FontMetricsInt
  primaryMetrics: FontMetricsInt
  fallback: boolean
  hinted: boolean
}

const MEASURE_MODE_EXACTLY = 1
const MEASURE_MODE_AT_MOST = 2

const fontMetricsInt = (font: any, sizePx: number): FontMetricsInt => {
  const toPx = (units: number) => units * sizePx / font.unitsPerEm
  return {
    top: Math.floor(-toPx(font.bbox.maxY)),
    ascent: Math.round(-toPx(font.ascent)),
    descent: Math.round(-toPx(font.descent)),
    bottom: Math.ceil(-toPx(font.bbox.minY)),
  }
}

const isAutohinted = (font: any) => {
  const tables = font.directory?.tables ?? {}
  return Boolean(tables.CFF2 || (tables.glyf && !tables.fpgm && !tables.prep))
}

const fontRanges = (text: string, start: number, end: number, fonts: any[]) => {
  const ranges: Array<{ start: number, end: number, font: any }> = []
  let index = start
  while (index < end) {
    const codePoint = text.codePointAt(index) as number
    const length = codePoint > 0xffff ? 2 : 1
    const font = /\s/.test(text[index])
      ? fonts[0]
      : fonts.find(candidate => candidate.hasGlyphForCodePoint(codePoint)) ?? fonts[0]
    const last = ranges[ranges.length - 1]
    if (last && last.font === font) {
      last.end = index + length
    } else {
      ranges.push({ start: index, end: index + length, font })
    }
    index += length
  }
  return ranges
}

const toRuns = ({ text, attributedStyles }: TextWithAttributedStyle, scale: number): Run[] =>
  attributedStyles.flatMap(({ start, end, style }) => {
    const sizePx = Math.ceil(style.fontSize * scale)
    const fonts = [
      resolveFont(style, "android"),
      ...fallbackFontsFor("android").map(font => withVariation(font, style.fontWeight, style.fontStyle)),
    ]
    const primaryMetrics = fontMetricsInt(fonts[0], sizePx)
    return fontRanges(text, start, end, fonts).map(range => ({
      start: range.start,
      end: range.end,
      style,
      font: range.font,
      sizePx,
      letterSpacingPx: (style.letterSpacing ?? 0) * scale,
      lineHeightPx: style.lineHeight != null ? Math.ceil(style.lineHeight * scale) : undefined,
      metrics: fontMetricsInt(range.font, sizePx),
      primaryMetrics,
      fallback: range.font !== fonts[0],
      hinted: isAutohinted(range.font) && !isVariationInstance(range.font),
    }))
  })

const advanceCache = new WeakMap<object, Map<string, number>>()

const shapedAdvance = (run: Run, piece: string): number => {
  let cache = advanceCache.get(run.font)
  if (!cache) {
    cache = new Map()
    advanceCache.set(run.font, cache)
  }
  const key = run.sizePx + "|" + (run.hinted ? "h|" : "|") + piece
  let advance = cache.get(key)
  if (advance === undefined) {
    const unitsToPx = run.sizePx / run.font.unitsPerEm
    const shaped = run.font.layout(piece)
    advance = (shaped.positions as Array<{ xAdvance: number }>).reduce((sum, position, index) => {
      if (!run.hinted) {
        return sum + Math.floor(position.xAdvance * unitsToPx * 256) / 256
      }
      const glyphAdvance = shaped.glyphs[index].advanceWidth
      const rounded = Math.floor((Math.round(glyphAdvance * unitsToPx * 64) + 32) / 64)
      return sum + rounded + (position.xAdvance - glyphAdvance) * unitsToPx
    }, 0)
    cache.set(key, advance)
  }
  return advance
}

const clusterCount = (text: string) => Array.from(text).length

const measureRange = (text: string, runs: Run[], start: number, end: number): number => {
  let width = 0
  let firstSpacing: number | undefined
  let lastSpacing = 0
  for (const run of runs) {
    const from = Math.max(start, run.start)
    const to = Math.min(end, run.end)
    if (from >= to) {
      continue
    }
    for (const piece of text.slice(from, to).split(/( +)/)) {
      if (!piece) {
        continue
      }
      const pieces = piece.startsWith(" ") ? Array.from(piece) : [piece]
      for (const part of pieces) {
        width += shapedAdvance(run, part) + run.letterSpacingPx * clusterCount(part)
      }
    }
    firstSpacing = firstSpacing ?? run.letterSpacingPx
    lastSpacing = run.letterSpacingPx
  }
  return width - ((firstSpacing ?? 0) + lastSpacing) / 2
}

const breakOpportunities = (text: string): Array<{ position: number, required: boolean }> => {
  const breaker = new LineBreaker(text)
  const breaks: Array<{ position: number, required: boolean }> = []
  let next = breaker.nextBreak()
  while (next) {
    breaks.push({ position: next.position, required: next.required })
    next = breaker.nextBreak()
  }
  return breaks
}

const trimTrailingSpaces = (text: string, start: number, end: number) => {
  let trimmed = end
  while (trimmed > start && /\s/.test(text[trimmed - 1])) {
    trimmed--
  }
  return trimmed
}

const breakLines = (text: string, runs: Run[], layoutWidth: number): Array<{ start: number, end: number }> => {
  const lines: Array<{ start: number, end: number }> = []
  let lineStart = 0
  let lastFit = -1
  for (const { position, required } of breakOpportunities(text)) {
    const fits = measureRange(text, runs, lineStart, trimTrailingSpaces(text, lineStart, position)) <= layoutWidth
    if (!fits && lastFit > lineStart) {
      lines.push({ start: lineStart, end: lastFit })
      lineStart = lastFit
    }
    lastFit = position
    if (required) {
      lines.push({ start: lineStart, end: position })
      lineStart = position
    }
  }
  if (lineStart < text.length || lines.length === 0) {
    lines.push({ start: lineStart, end: text.length })
  }
  return lines
}

const lineMetrics = (runs: Run[], start: number, end: number): FontMetricsInt & { lineHeightPx?: number } => {
  const inLine = runs.filter(run => run.start < Math.max(end, start + 1) && run.end > start)
  const used = inLine.length ? inLine : [runs[runs.length - 1]]
  const ascent = Math.min(...used.flatMap(run => [run.metrics.ascent, run.primaryMetrics.ascent]))
  const descent = Math.max(...used.flatMap(run => [run.metrics.descent, run.primaryMetrics.descent]))
  return {
    top: Math.min(ascent, ...used.map(run => run.primaryMetrics.top)),
    ascent,
    descent,
    bottom: Math.max(descent, ...used.map(run => run.primaryMetrics.bottom)),
    lineHeightPx: used.map(run => run.lineHeightPx).filter(value => value !== undefined).pop(),
  }
}

export const measureAndroid = (
  styledText: TextWithAttributedStyle,
  width: number,
  widthMode: number,
  paragraph: Paragraph,
  scale: number,
): MeasuredText => {
  const { text } = styledText
  const runs = toRuns(styledText, scale)
  if (runs.length === 0) {
    return { width: 0, height: 0, lines: [] }
  }

  const availablePx = width * scale
  const hardLines = text.split("\n")
  let offset = 0
  const desiredPx = Math.max(...hardLines.map(line => {
    const lineWidth = measureRange(text, runs, offset, offset + line.length)
    offset += line.length + 1
    return lineWidth
  }))
  const desiredCeil = Math.ceil(desiredPx)
  const hasLineHeight = runs.some(run => run.lineHeightPx !== undefined)
  const boring = hardLines.length === 1 && !hasLineHeight
    && (widthMode !== MEASURE_MODE_EXACTLY && widthMode !== MEASURE_MODE_AT_MOST || desiredCeil <= Math.floor(availablePx))

  let layoutWidth: number
  let ranges: Array<{ start: number, end: number }>
  if (boring) {
    layoutWidth = widthMode === MEASURE_MODE_EXACTLY ? Math.ceil(availablePx) : desiredCeil
    ranges = [{ start: 0, end: text.length }]
  } else {
    layoutWidth = widthMode === MEASURE_MODE_EXACTLY ? Math.ceil(availablePx)
      : widthMode === MEASURE_MODE_AT_MOST ? Math.min(desiredCeil, Math.floor(availablePx))
      : desiredCeil
    ranges = breakLines(text, runs, layoutWidth)
  }

  const maxLines = paragraph.numberOfLines && paragraph.numberOfLines > 0 ? paragraph.numberOfLines : Infinity
  const truncated = ranges.length > maxLines
  const shown = ranges.slice(0, Math.min(ranges.length, maxLines))

  let topPx = 0
  const lines: MeasuredLine[] = shown.map((range, index) => {
    const metrics = lineMetrics(runs, range.start, range.end)
    let { top, ascent, descent, bottom } = metrics
    if (metrics.lineHeightPx !== undefined) {
      const leading = metrics.lineHeightPx - (descent - ascent)
      ascent -= Math.ceil(leading / 2)
      descent += Math.floor(leading / 2)
      if (range.start === 0) {
        top = ascent
      }
      if (range.end === text.length) {
        bottom = descent
      }
    }
    const above = index === 0 && paragraph.includeFontPadding ? top : ascent
    const below = index === shown.length - 1 && paragraph.includeFontPadding ? bottom : descent
    const ellipsized = truncated && index === shown.length - 1
    let end = range.end
    if (ellipsized) {
      const lastRun = runs.find(run => run.start <= end - 1 && run.end >= end) ?? runs[runs.length - 1]
      const ellipsisWidth = shapedAdvance(lastRun, "\u2026")
      while (end > range.start && measureRange(text, runs, range.start, end) + ellipsisWidth > layoutWidth) {
        end--
      }
    }
    const line: MeasuredLine = {
      start: range.start,
      end,
      top: topPx / scale,
      height: (below - above) / scale,
      baseline: (topPx - above) / scale,
      width: measureRange(text, runs, range.start, trimTrailingSpaces(text, range.start, end)) / scale,
      ellipsized,
    }
    topPx += below - above
    return line
  })

  return { width: layoutWidth / scale, height: topPx / scale, lines }
}
