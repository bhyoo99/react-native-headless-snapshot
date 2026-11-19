import { textLines } from "./component-to-node"

import { styleFromComponent } from "./component-to-node"
import { RenderedComponent, Settings } from "./index"
import text from "./svg/Text"
import view from "./svg/View"
import viewWireframe from "./svg/ViewWireframe"
import wsp from "./whitespace"

const nodeToSVG = (indent: number, node: RenderedComponent, settings: Settings) => {
  const { layout } = node
  const style = styleFromComponent(node) || {}
  // TODO: Enable this
  // if (!style.backgroundColor && sidesEqual(borderWidths) && borderWidths[0] === 0) {
  //   return ""
  // }

  let svgText: string
  if (node[textLines] && node[textLines].length > 0) {
    svgText = text(layout.left, layout.top, layout.width, layout.height, node[textLines])
  } else if (!settings.wireframe) {
    svgText = view(layout, style)
  } else {
    svgText = viewWireframe(layout, style)
  }

  return "\n"
    + wsp(indent)
    + svgText
}

export default nodeToSVG
