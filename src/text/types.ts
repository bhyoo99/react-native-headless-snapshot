export interface Paragraph {
  numberOfLines?: number
  includeFontPadding: boolean
}

export interface MeasuredLine {
  start: number
  end: number
  top: number
  height: number
  baseline: number
  width: number
  ellipsized: boolean
}

export interface MeasuredText {
  width: number
  height: number
  lines: MeasuredLine[]
}
