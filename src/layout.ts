import componentTreeToNodeTree from "./component-tree-to-nodes"
import { type DeviceProfile, getDevice, resolveDevice } from "./device"
import { resetUsedFonts } from "./font-loader"
import { normalizeHostComponents } from "./host-components"
import type { Component, RenderedComponent, Settings } from "./index"
import renderedComponentTree from "./reapply-layouts-to-components"
import { toRootComponent } from "./to-root-component"
import { getYoga } from "./yoga"

export interface LayoutOptions {
  width?: number
  height?: number
  scale?: number
  platform?: "ios" | "android"
  device?: DeviceProfile | string
}

export const settingsFor = (options: LayoutOptions & { wireframe?: boolean }): Settings => {
  const device = options.device ? resolveDevice(options.device) : getDevice()
  const width = options.width ?? device?.width
  const height = options.height ?? device?.height
  if (width === undefined || height === undefined) {
    throw new Error("Pass a width and height, a device, or call setDevice() first")
  }
  return {
    width,
    height,
    wireframe: options.wireframe ?? false,
    scale: options.scale ?? device?.scale,
    platform: options.platform ?? device?.platform,
    insets: device?.insets,
  }
}

export interface LayoutFrame {
  type: string
  props: any
  x: number
  y: number
  width: number
  height: number
  children: LayoutFrame[]
}

export const computeLayout = (input: Component, settings: Settings): RenderedComponent => {
  const root = normalizeHostComponents(input, settings)
  const yoga = getYoga()
  const config = yoga.Config.create()
  config.setErrata(yoga.ERRATA_ALL)
  config.setPointScaleFactor(settings.scale ?? 1)
  resetUsedFonts()
  const rootNode = componentTreeToNodeTree(root, settings, config)
  try {
    rootNode.calculateLayout(settings.width, settings.height, yoga.DIRECTION_LTR)
    return renderedComponentTree(root, rootNode)
  } finally {
    rootNode.freeRecursive()
    config.free()
  }
}

const toFrame = (component: RenderedComponent, originX: number, originY: number): LayoutFrame => {
  const x = originX + component.layout.left
  const y = originY + component.layout.top
  return {
    type: component.type,
    props: component.props,
    x,
    y,
    width: component.layout.width,
    height: component.layout.height,
    children: component.children.map(child => toFrame(child, x, y)),
  }
}

export const layoutTree = (received: unknown, options: LayoutOptions): LayoutFrame => {
  const root = toRootComponent(received)
  if (!root || !root.props || typeof root.type !== "string") {
    throw new Error("layoutTree needs a rendered component tree")
  }
  return toFrame(computeLayout(root, settingsFor(options)), 0, 0)
}
