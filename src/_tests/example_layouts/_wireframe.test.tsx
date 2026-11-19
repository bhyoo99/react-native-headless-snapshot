import "../../index"

import { View } from "../host-components"
import { renderToJSON } from "../render-json"

it("Simple wireframe", async () => {
  const jsx = <View style={{ width: 100, height: 50 }} />

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480, { wireframe: true })
})

it("Simple wireframe with background color", async () => {
  const jsx = <View style={{ width: 100, height: 50, backgroundColor: "red" }} />

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480, { wireframe: true })
})

it("Nested wireframe", async () => {
  const jsx =
    <View style={{ width: 100, height: 50, flexDirection: "row" }}>
      <View style={{ flex: 1, margin: 5 }} />
      <View style={{ flex: 1, margin: 5 }} />
      <View style={{ flex: 1, margin: 5 }} />
    </View>

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480, { wireframe: true })
})

it("Simple wireframe with border radius", async () => {
  const jsx = <View style={{ width: 100, height: 50, borderRadius: 20 }} />

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480, { wireframe: true })
})
