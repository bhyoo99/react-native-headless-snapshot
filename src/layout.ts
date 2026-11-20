import componentTreeToNodeTree from "./component-tree-to-nodes"
import { resetUsedFonts } from "./font-loader"
import type { Component, RenderedComponent, Settings } from "./index"
import renderedComponentTree from "./reapply-layouts-to-components"
import { toRootComponent } from "./to-root-component"
import { getYoga } from "./yoga"

export interface LayoutOptions {
  width: number
  height: number
  scale?: number
  platform?: "ios" | "android"
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

export const computeLayout = (root: Component, settings: Settings): RenderedComponent => {
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
  return toFrame(computeLayout(root, { wireframe: false, ...options }), 0, 0)
}
