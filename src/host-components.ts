import * as fs from "fs"
import * as path from "path"

import { flattenStyles } from "./flatten-styles"
import type { Component, Settings } from "./index"

const ACTIVITY_INDICATOR_SIZES = { small: 20, large: 36 }

const SWITCH_SIZES = {
  ios: { width: 63, height: 28 },
  android: { width: 48, height: 48 },
}

const ANDROID_TEXT_INPUT_PADDING = { top: 13, bottom: 8, left: 4, right: 4 }

const ANDROID_TOOLBAR_HEIGHT = 56

const withStyle = (component: Component, before: object | null, after: object | null = null): Component => ({
  ...component,
  props: { ...component.props, style: [before, component.props?.style, after] },
})

const readImageSize = (file: string): { width: number, height: number } | undefined => {
  const data = fs.readFileSync(file)
  if (data.length > 24 && data.readUInt32BE(0) === 0x89504e47) {
    return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) }
  }
  if (data[0] === 0xff && data[1] === 0xd8) {
    let offset = 2
    while (offset < data.length) {
      const marker = data[offset + 1]
      const length = data.readUInt16BE(offset + 2)
      if (marker >= 0xc0 && marker <= 0xc2) {
        return { width: data.readUInt16BE(offset + 7), height: data.readUInt16BE(offset + 5) }
      }
      offset += 2 + length
    }
  }
  return undefined
}

const assetBaseDirectory = (): string | undefined => {
  let directory = process.cwd()
  while (true) {
    if (fs.existsSync(path.join(directory, "node_modules", "react-native", "package.json"))) {
      return path.join(directory, "node_modules", "react-native", "jest")
    }
    const parent = path.dirname(directory)
    if (parent === directory) {
      return undefined
    }
    directory = parent
  }
}

const assetSize = (testUri: string): { width: number, height: number } | undefined => {
  const base = assetBaseDirectory()
  if (!base) {
    return undefined
  }
  const file = path.resolve(base, testUri)
  const extension = path.extname(file)
  const stem = file.slice(0, file.length - extension.length)
  for (const scale of [1, 2, 3]) {
    const candidate = scale === 1 ? file : `${stem}@${scale}x${extension}`
    if (fs.existsSync(candidate)) {
      const size = readImageSize(candidate)
      return size && { width: size.width / scale, height: size.height / scale }
    }
  }
  return undefined
}

const imageSourceSize = (source: any): { width: number, height: number } | undefined => {
  const first = Array.isArray(source) ? source[0] : source
  if (!first || typeof first !== "object") {
    return undefined
  }
  if (first.width && first.height) {
    return { width: first.width, height: first.height }
  }
  return typeof first.testUri === "string" ? assetSize(first.testUri) : undefined
}

const androidTextInputPadding = (style: any, scale: number) => {
  const has = (...keys: string[]) => keys.some(key => style[key] != null)
  const px = (dp: number) => Math.trunc(dp * scale) / scale
  return {
    paddingTop: has("padding", "paddingVertical", "paddingTop") ? undefined : px(ANDROID_TEXT_INPUT_PADDING.top),
    paddingBottom: has("padding", "paddingVertical", "paddingBottom") ? undefined : px(ANDROID_TEXT_INPUT_PADDING.bottom),
    paddingLeft: has("padding", "paddingHorizontal", "paddingLeft", "paddingStart") ? undefined : px(ANDROID_TEXT_INPUT_PADDING.left),
    paddingRight: has("padding", "paddingHorizontal", "paddingRight", "paddingEnd") ? undefined : px(ANDROID_TEXT_INPUT_PADDING.right),
  }
}

const withoutUndefined = (style: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(style).filter(([, value]) => value !== undefined))

export const normalizeHostComponents = (component: Component, settings: Settings): Component => {
  if (!settings.platform) {
    return component
  }
  const platform = settings.platform
  const props = component.props ?? {}
  let normalized = component

  if (component.type === "RNSScreen") {
    const header = ((component.children ?? []) as Component[]).find(child => typeof child === "object" && child?.type === "RNSScreenStackHeaderConfig")
    const headerProps = header?.props ?? {}
    const pushedDown = platform === "android" && header && !headerProps.hidden && !headerProps.translucent
    const top = pushedDown ? (settings.insets?.top ?? 0) + ANDROID_TOOLBAR_HEIGHT : 0
    normalized = withStyle(component, null, { position: "absolute", left: 0, right: 0, top, bottom: 0 })
  } else if (component.type === "RNSScreenStackHeaderConfig") {
    normalized = withStyle(component, null, { position: "absolute", width: 0, height: 0, overflow: "hidden" })
  } else if (component.type === "RCTScrollView") {
    const horizontal = Boolean(props.horizontal)
    normalized = withStyle(component, { flexGrow: 1, flexShrink: 1, flexDirection: horizontal ? "row" : "column", overflow: "scroll" })
    const children = (component.children ?? []) as Component[]
    const contentIndex = children.length - 1
    normalized = {
      ...normalized,
      children: children.map((child, index) => index === contentIndex && typeof child === "object"
        ? withStyle(child, [horizontal ? { flexDirection: "row" } : null, props.contentContainerStyle])
        : child) as Component[],
    }
  } else if (component.type === "ActivityIndicator") {
    const size = typeof props.size === "number" ? props.size : ACTIVITY_INDICATOR_SIZES[props.size ?? "small"] ?? 20
    normalized = withStyle(component, { alignItems: "center", justifyContent: "center" }, null)
    normalized = withStyle(normalized, { width: size, height: size })
  } else if (component.type === "RCTSwitch" || component.type === "AndroidSwitch") {
    normalized = withStyle(component, SWITCH_SIZES[platform])
  } else if (component.type === "Image") {
    const size = imageSourceSize(props.source)
    if (size) {
      normalized = withStyle(component, size)
    }
  } else if (component.type === "TextInput" && platform === "android") {
    const style = flattenStyles(props.style) as any
    normalized = withStyle(component, null, withoutUndefined(androidTextInputPadding(style, settings.scale ?? 1)))
  } else if (component.type === "TextInput" && props.multiline === true) {
    const style = flattenStyles(props.style) as any
    if (style.padding == null && style.paddingVertical == null && style.paddingTop == null) {
      normalized = withStyle(component, { paddingTop: 5 })
    }
  }

  if (normalized.children && normalized.type !== "Text") {
    normalized = {
      ...normalized,
      children: (normalized.children as Array<Component | string>).map(child =>
        typeof child === "object" && child ? normalizeHostComponents(child, settings) : child) as Component[],
    }
  }
  return normalized
}
