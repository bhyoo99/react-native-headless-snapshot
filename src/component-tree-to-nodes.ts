import type { Config } from "yoga-layout/load"
import componentToNode from "./component-to-node"
import { Component, Settings } from "./index"

const treeToNodes = (root: Component, settings: Settings, config?: Config) => recurseTree(root, settings, config)

export default treeToNodes

export const recurseTree = (component: Component, settings: Settings, config?: Config) => {
  const node = componentToNode(component, settings, config)

  if (component.type !== "Text" && component.children) {
    // Don't go into Text nodes
    for (let index = 0; index < component.children.length; index++) {
      const childComponent = component.children[index]
      if (typeof childComponent === "string") {
        throw new Error("Unexpected string child in non-Text node")
      }
      const childNode = recurseTree(childComponent, settings, config)
      node.insertChild(childNode, index)
    }
  }

  return node
}
