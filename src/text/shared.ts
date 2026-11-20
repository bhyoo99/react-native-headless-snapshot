import { LineBreaker } from "linebreak"

export interface FontRange {
  start: number
  end: number
  font: any
}

export const fontRanges = (text: string, start: number, end: number, fonts: any[]): FontRange[] => {
  const ranges: FontRange[] = []
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

export const trimTrailingSpaces = (text: string, start: number, end: number) => {
  let trimmed = end
  while (trimmed > start && /\s/.test(text[trimmed - 1])) {
    trimmed--
  }
  return trimmed
}

export const breakLines = (
  text: string,
  layoutWidth: number,
  measure: (start: number, end: number) => number,
): Array<{ start: number, end: number }> => {
  const lines: Array<{ start: number, end: number }> = []
  let lineStart = 0
  let lastFit = -1
  for (const { position, required } of breakOpportunities(text)) {
    const fits = measure(lineStart, trimTrailingSpaces(text, lineStart, position)) <= layoutWidth
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
