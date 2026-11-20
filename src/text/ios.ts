import type { TextWithAttributedStyle } from "../extract-text"
import { fallbackFontsFor, resolveFont, trackingAt } from "../font-loader"
import { breakLines, fontRanges, trimTrailingSpaces } from "./shared"
import type { MeasuredLine, MeasuredText, Paragraph } from "./types"

interface Run {
  start: number
  end: number
  style: any
  font: any
  size: number
  letterSpacing: number
  tracking: number
  ascender: number
  descender: number
  lineHeight?: number
}

const MEASURE_MODE_UNDEFINED = 0
const PIXEL_GRID_EPSILON = 0.001

const toRuns = ({ text, attributedStyles }: TextWithAttributedStyle): Run[] =>
  attributedStyles.flatMap(({ start, end, style }) => {
    const size = style.fontSize
    const fonts = [resolveFont(style, "ios"), ...fallbackFontsFor("ios", style)]
    return fontRanges(text, start, end, fonts).map(range => ({
      start: range.start,
      end: range.end,
      style,
      font: range.font,
      size,
      letterSpacing: style.letterSpacing ?? 0,
      tracking: trackingAt(range.font, size) * size / range.font.unitsPerEm,
      ascender: range.font.ascent * size / range.font.unitsPerEm,
      descender: -range.font.descent * size / range.font.unitsPerEm,
      lineHeight: style.lineHeight ?? undefined,
    }))
  })

const advanceCache = new WeakMap<object, Map<string, number>>()

const shapedAdvance = (run: Run, piece: string): number => {
  let cache = advanceCache.get(run.font)
  if (!cache) {
    cache = new Map()
    advanceCache.set(run.font, cache)
  }
  const key = run.size + "|" + piece
  let advance = cache.get(key)
  if (advance === undefined) {
    const space = run.font.glyphForCodePoint(32)
    const shaped = run.font.layout(piece)
    const units = shaped.glyphs.reduce((sum, glyph, index) => {
      const position = shaped.positions[index].xAdvance
      if (glyph.codePoints.includes(32) && glyph.id !== space.id) {
        return sum + space.advanceWidth + position - glyph.advanceWidth
      }
      return sum + position
    }, 0)
    advance = units * run.size / run.font.unitsPerEm + run.tracking * shaped.glyphs.length
    cache.set(key, advance)
  }
  return advance
}

const measureRange = (text: string, runs: Run[], start: number, end: number): number => {
  let width = 0
  for (const run of runs) {
    const from = Math.max(start, run.start)
    const to = Math.min(end, run.end)
    if (from >= to) {
      continue
    }
    const piece = text.slice(from, to)
    width += shapedAdvance(run, piece) + run.letterSpacing * Array.from(piece).length
  }
  return width
}

const lineBox = (runs: Run[], start: number, end: number) => {
  const inLine = runs.filter(run => run.start < Math.max(end, start + 1) && run.end > start)
  const used = inLine.length ? inLine : [runs[runs.length - 1]]
  const ascender = Math.max(...used.map(run => run.ascender))
  const descender = Math.max(...used.map(run => run.descender))
  const lineHeight = used.map(run => run.lineHeight).filter(value => value !== undefined).pop()
  if (lineHeight === undefined) {
    return { height: ascender + descender, baseline: ascender }
  }
  const natural = ascender + descender
  const offset = lineHeight >= natural ? (lineHeight - natural) / 2 : 0
  return { height: lineHeight, baseline: lineHeight - descender - offset }
}

const roundToPixelGrid = (value: number, scale: number) =>
  Math.ceil((value + PIXEL_GRID_EPSILON) * scale) / scale

export const measureIOS = (
  styledText: TextWithAttributedStyle,
  width: number,
  widthMode: number,
  paragraph: Paragraph,
  scale: number,
): MeasuredText => {
  const { text } = styledText
  const runs = toRuns(styledText)
  if (runs.length === 0) {
    return { width: 0, height: 0, lines: [] }
  }

  const containerWidth = widthMode === MEASURE_MODE_UNDEFINED ? Infinity : width
  const ranges = breakLines(text, containerWidth + 1e-9, (from, to) => measureRange(text, runs, from, to))
  const maxLines = paragraph.numberOfLines && paragraph.numberOfLines > 0 ? paragraph.numberOfLines : Infinity
  const shown = ranges.slice(0, Math.min(ranges.length, maxLines))
  const didWrap = shown.some(range => range.end < text.length && text[range.end - 1] !== "\n")

  let top = 0
  const lines: MeasuredLine[] = shown.map((range, index) => {
    const box = lineBox(runs, range.start, range.end)
    const line: MeasuredLine = {
      start: range.start,
      end: range.end,
      top,
      height: box.height,
      baseline: top + box.baseline,
      width: measureRange(text, runs, range.start, trimTrailingSpaces(text, range.start, range.end)),
      ellipsized: ranges.length > shown.length && index === shown.length - 1,
    }
    top += box.height
    return line
  })

  const usedWidth = didWrap ? containerWidth : Math.max(0, ...lines.map(line => line.width))
  let measuredWidth = roundToPixelGrid(usedWidth, scale)
  if (widthMode !== MEASURE_MODE_UNDEFINED) {
    measuredWidth = Math.min(measuredWidth, width)
  }
  return { width: measuredWidth, height: roundToPixelGrid(top, scale), lines }
}
