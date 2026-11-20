import * as fontkit from "fontkit"
import * as fs from "fs"

const weights = {
  normal: "400",
  bold: "700"
}

export interface FontStyle {
  fontFamily?: string,
  fontWeight?: string,
  fontStyle?: string,
  postscriptName?: string
}
const fonts = {}
const fontFallbacks = {}
const builtInDefaultFont = "Proza Libre"
let userDefaultFont: string | undefined

export type FontPlatform = "ios" | "android"
const systemFonts: Partial<Record<FontPlatform, any>> = {}
interface FallbackFace {
  weight: number
  font: any
}
const fallbackFamilies: Record<FontPlatform, Array<{ family: string, faces: FallbackFace[] }>> = { ios: [], android: [] }
const variationCache = new WeakMap<object, Map<string, any>>()
const svgFonts: { [key: string]: { path: string, style: FontStyle } } = {}
const usedFonts: string[] = []

export const getDefaultFont = () => userDefaultFont ?? builtInDefaultFont
export const getUserDefaultFont = () => userDefaultFont
export const setDefaultFont = (fontName: string) => userDefaultFont = fontName
export const getSvgFonts = () => svgFonts

export const registerFontUsed = (
  fontFamily: string,
  fontWeight: string = "normal",
  fontStyle: string = "normal") => {
  const key = keyFor({ fontFamily, fontWeight, fontStyle })
  if (!usedFonts.includes(key)) {
    usedFonts.push(key)
  }
}
export const getUsedFontKeys = () => usedFonts
export const resetUsedFonts = () => {
  usedFonts.length = 0
}

const numberWeight = weight => weights[weight] || weight

const keyFor = ({ fontFamily, fontWeight, fontStyle }) =>
  `${fontFamily} (weight: ${numberWeight(fontWeight)} style: ${fontStyle})`

interface NameMatch { match: string, value: string }

const weightNames = [
  { match: "thin", value: "100" },
  { match: "hairline", value: "100" },
  { match: "extralight", value: "200" },
  { match: "ultralight", value: "200" },
  { match: "semilight", value: "300" },
  { match: "light", value: "300" },
  { match: "normal", value: "400" },
  { match: "regular", value: "400" },
  { match: "medium", value: "500" },
  { match: "semibold", value: "600" },
  { match: "demibold", value: "600" },
  { match: "extrabold", value: "800" },
  { match: "ultrabold", value: "800" },
  { match: "bold", value: "700" },
  { match: "black", value: "900" },
  { match: "heavy", value: "900" },
  { match: "100", value: "100" },
  { match: "200", value: "200" },
  { match: "300", value: "300" },
  { match: "400", value: "400" },
  { match: "500", value: "500" },
  { match: "600", value: "600" },
  { match: "700", value: "700" },
  { match: "800", value: "800" },
  { match: "900", value: "900" },
]

const italicNames = [
  { match: "italic", value: "italic" },
  { match: "oblique", value: "italic" },
]

const matchNames = (target: string, names: NameMatch[], defaultValue: string): string => {
  const normalized = (target || "").toLowerCase().replace(/[\s_-]/g, "")
  const match = names.find(name => normalized.includes(name.match))
  return match ? match.value : defaultValue
}

const getFontStyle = (font, style): FontStyle => {
  const fontFamily = style.fontFamily || font.familyName
  const fontWeight = style.fontWeight || matchNames(font.subfamilyName, weightNames, "400")
  const fontStyle = style.fontStyle || matchNames(font.subfamilyName, italicNames, "normal")

  return { fontFamily, fontWeight, fontStyle, postscriptName: style.postscriptName }
}

const getFontKey = (font, style) => {
  const { fontFamily, fontWeight, fontStyle } = getFontStyle(font, style)
  const key = keyFor({ fontFamily, fontWeight, fontStyle })

  if (!fontFamily || !fontWeight || !fontStyle) {
    throw new Error(`Could not find styles for font: ${key}`)
  }

  return key
}

const addFont = (font, style: FontStyle) => {
  const key = getFontKey(font, style)
  fonts[key] = font
}

export const loadFont = (fontFile, style: FontStyle = {}) => {
  const font = fontkit.create(fontFile, style.postscriptName)
  if (font.fonts) {
    font.fonts.forEach(f => addFont(f, { fontFamily: style.fontFamily }))
  } else {
    addFont(font, style)
  }
}

export const addFontToSvg = (fontPath: string, style: FontStyle = {}) => {
  const resolvedPath = require.resolve(fontPath)
  const fontFile = fs.readFileSync(resolvedPath)
  const font = fontkit.create(fontFile, style.postscriptName)
  const key = getFontKey(font, style)
  svgFonts[key] = { path: resolvedPath, style: getFontStyle(font, style) }
  if (font.fonts) {
    font.fonts.forEach(f => addFont(f, { fontFamily: style.fontFamily }))
  } else {
    addFont(font, style)
  }
}

export const addFontFallback = (fontFamily: string, fallback: string) => {
  fontFallbacks[fontFamily] = fallback
}

export const fontForStyle = style => {
  const key = keyFor({ ...style, fontFamily: style.fontFamily ?? getDefaultFont() })
  if (!fonts[key]) {
    throw new Error(`No font defined for ${key}, load it with loadFont() or addFontToSvg()`)
  }
  return fonts[key]
}

export const loadSystemFont = (platform: FontPlatform, fontFile, options: { postscriptName?: string } = {}) => {
  systemFonts[platform] = fontkit.create(fontFile, options.postscriptName)
}

export const loadFallbackFont = (
  platform: FontPlatform,
  fontFile,
  options: { postscriptName?: string, fontWeight?: string } = {},
) => {
  const font = fontkit.create(fontFile, options.postscriptName)
  const weight = Number(numberWeight(options.fontWeight ?? String(font["OS/2"]?.usWeightClass ?? 400)))
  const families = fallbackFamilies[platform]
  const existing = families.find(entry => entry.family === font.familyName)
  if (existing) {
    existing.faces.push({ weight, font })
  } else {
    families.push({ family: font.familyName, faces: [{ weight, font }] })
  }
}

const variationInstances = new WeakSet<object>()

export const isVariationInstance = (font: object) => variationInstances.has(font)

const clampAxis = (axis, value: number) => Math.min(axis.max, Math.max(axis.min, value))

export const withVariation = (font, fontWeight, fontStyle, opticalSize?: number) => {
  const axes = font.variationAxes || {}
  if (!axes.wght && !axes.ital && !(axes.opsz && opticalSize !== undefined)) {
    return font
  }
  const settings: Record<string, number> = {}
  if (axes.opsz && opticalSize !== undefined) {
    settings.opsz = clampAxis(axes.opsz, opticalSize)
  }
  if (axes.wght) {
    settings.wght = clampAxis(axes.wght, Number(numberWeight(fontWeight ?? "normal")))
  }
  if (axes.ital) {
    settings.ital = fontStyle === "italic" ? 1 : 0
  }
  if (Object.entries(settings).every(([tag, value]) => axes[tag].default === value)) {
    return font
  }
  const key = JSON.stringify(settings)
  let cache = variationCache.get(font)
  if (!cache) {
    cache = new Map()
    variationCache.set(font, cache)
  }
  if (!cache.has(key)) {
    const instance = font.getVariation(settings)
    variationInstances.add(instance)
    cache.set(key, instance)
  }
  return cache.get(key)
}

const opticalSizeFor = (style, platform?: FontPlatform) => platform === "ios" ? style.fontSize : undefined

export const resolveFont = (style, platform?: FontPlatform) => {
  const system = platform && systemFonts[platform]
  if (!style.fontFamily && !userDefaultFont && system) {
    return withVariation(system, style.fontWeight, style.fontStyle, opticalSizeFor(style, platform))
  }
  return fontForStyle(style)
}

export const fallbackFontsFor = (platform: FontPlatform, style) => {
  const target = Number(numberWeight(style.fontWeight ?? "normal"))
  return fallbackFamilies[platform].map(({ faces }) => {
    const face = faces.reduce((best, candidate) => {
      const distance = Math.abs(candidate.weight - target)
      const bestDistance = Math.abs(best.weight - target)
      return distance < bestDistance || (distance === bestDistance && candidate.weight > best.weight) ? candidate : best
    })
    return withVariation(face.font, style.fontWeight, style.fontStyle, opticalSizeFor(style, platform))
  })
}

const trackingCache = new WeakMap<object, { sizes: number[], values: number[] } | null>()

const readTracking = (font): { sizes: number[], values: number[] } | null => {
  const table = font.directory?.tables?.trak
  const buffer = font.stream?.buffer
  if (!table || !buffer) {
    return null
  }
  const view = new DataView(buffer.buffer, buffer.byteOffset + table.offset, table.length)
  const horizontal = view.getUint16(6)
  if (!horizontal) {
    return null
  }
  const trackCount = view.getUint16(horizontal)
  const sizeCount = view.getUint16(horizontal + 2)
  const sizeOffset = view.getUint32(horizontal + 4)
  const sizes = Array.from({ length: sizeCount }, (_, index) => view.getInt32(sizeOffset + index * 4) / 65536)
  for (let track = 0; track < trackCount; track++) {
    const entry = horizontal + 8 + track * 8
    if (view.getInt32(entry) === 0) {
      const valuesOffset = view.getUint16(entry + 6)
      return { sizes, values: Array.from({ length: sizeCount }, (_, index) => view.getInt16(valuesOffset + index * 2)) }
    }
  }
  return null
}

export const trackingAt = (font, pointSize: number): number => {
  const key = font.stream ?? font
  if (!trackingCache.has(key)) {
    trackingCache.set(key, readTracking(font))
  }
  const tracking = trackingCache.get(key)
  if (!tracking) {
    return 0
  }
  const { sizes, values } = tracking
  if (pointSize <= sizes[0]) {
    return values[0]
  }
  for (let index = 1; index < sizes.length; index++) {
    if (pointSize <= sizes[index]) {
      const fraction = (pointSize - sizes[index - 1]) / (sizes[index] - sizes[index - 1])
      return values[index - 1] + fraction * (values[index] - values[index - 1])
    }
  }
  return values[values.length - 1]
}

export const fontWithFallbacks = (fontFamily: string): string => (
  fontFallbacks[fontFamily] ? `'${fontFamily}', ${fontFallbacks[fontFamily]}` : `'${fontFamily}'`
)

// Default font family to provide for jest snapshots testing.
addFontToSvg("./font/proza-libre/ProzaLibre-Bold.ttf")
addFontToSvg("./font/proza-libre/ProzaLibre-BoldItalic.ttf")
addFontToSvg("./font/proza-libre/ProzaLibre-ExtraBold.ttf")
addFontToSvg("./font/proza-libre/ProzaLibre-ExtraBoldItalic.ttf")
addFontToSvg("./font/proza-libre/ProzaLibre-Italic.ttf")
addFontToSvg("./font/proza-libre/ProzaLibre-Light.ttf")
addFontToSvg("./font/proza-libre/ProzaLibre-LightItalic.ttf")
addFontToSvg("./font/proza-libre/ProzaLibre-Medium.ttf")
addFontToSvg("./font/proza-libre/ProzaLibre-MediumItalic.ttf")
addFontToSvg("./font/proza-libre/ProzaLibre-Regular.ttf")
addFontToSvg("./font/proza-libre/ProzaLibre-SemiBold.ttf")
addFontToSvg("./font/proza-libre/ProzaLibre-SemiBoldItalic.ttf")
