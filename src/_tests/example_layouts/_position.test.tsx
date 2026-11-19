import "../../index"

import { View } from "../host-components"
import { renderToJSON } from "../render-json"

it("Renders views on top position", async () => {
  const jsx =
    <View style={{ flex: 1 }}>
      <View style={{
        position: "absolute",
        top: 10,
        left: 10,
        right: 10,
        height: 100,
      }} />
      <View style={{
        position: "absolute",
        top: 20,
        left: 20,
        right: 20,
        height: 80,
      }} />
    </View>
  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480, { wireframe: true })
})

it("Renders views on bottom position", async () => {
  const jsx =
    <View style={{ flex: 1 }}>
      <View style={{
        position: "absolute",
        left: 10,
        right: 10,
        bottom: 10,
        height: 100,
      }} />
      <View style={{
        position: "absolute",
        left: 20,
        right: 20,
        bottom: 20,
        height: 80,
      }} />
    </View>
  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480, { wireframe: true })
})

it("Renders views on left position", async () => {
  const jsx =
    <View style={{ flex: 1 }}>
      <View style={{
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        width: 100,
      }} />
    </View>
  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480, { wireframe: true })
})
