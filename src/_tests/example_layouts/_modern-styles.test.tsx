import "../../index"

import { Text, View } from "../host-components"
import { renderToJSON } from "../render-json"

const block = (backgroundColor: string, style = {}) =>
  <View style={{ width: 50, height: 50, backgroundColor, ...style }} />

it("Renders gap, rowGap and columnGap", async () => {
  const jsx =
    <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", rowGap: 20, columnGap: 10, padding: 10 }}>
      {block("powderblue")}
      {block("skyblue")}
      {block("steelblue")}
      {block("powderblue")}
      {block("skyblue")}
      {block("steelblue")}
    </View>

  expect(await renderToJSON(jsx)).toMatchSVGSnapshot(220, 200)
})

it("Renders wrapped rows packed with alignContent", async () => {
  const jsx =
    <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", alignContent: "center", gap: 10 }}>
      {block("powderblue")}
      {block("skyblue")}
      {block("steelblue")}
      {block("powderblue")}
    </View>

  expect(await renderToJSON(jsx)).toMatchSVGSnapshot(170, 300)
})

it("Renders space-evenly and percentage sizes", async () => {
  const jsx =
    <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
      {block("powderblue", { width: "20%" })}
      {block("skyblue", { width: "20%" })}
    </View>

  expect(await renderToJSON(jsx)).toMatchSVGSnapshot(300, 100)
})

it("Renders aspectRatio as a number and as a string", async () => {
  const jsx =
    <View style={{ flex: 1, alignItems: "flex-start", gap: 10 }}>
      <View style={{ width: 100, aspectRatio: 2, backgroundColor: "powderblue" }} />
      <View style={{ width: 160, aspectRatio: "16 / 9", backgroundColor: "skyblue" }} />
    </View>

  expect(await renderToJSON(jsx)).toMatchSVGSnapshot(200, 200)
})

it("Leaves out views with display none", async () => {
  const jsx =
    <View style={{ flex: 1, flexDirection: "row" }}>
      {block("powderblue")}
      <View style={{ width: 50, height: 50, backgroundColor: "red", display: "none" }}>
        <Text>Hidden</Text>
      </View>
      {block("steelblue")}
    </View>

  expect(await renderToJSON(jsx)).toMatchSVGSnapshot(200, 50)
})

it("Renders start, end and inset edges", async () => {
  const jsx =
    <View style={{ flex: 1, paddingStart: 10, paddingEnd: 30 }}>
      <View style={{ height: 20, marginHorizontal: 5, backgroundColor: "powderblue" }} />
      <View style={{ position: "absolute", insetInline: 40, insetBlockEnd: 0, height: 20, backgroundColor: "skyblue" }} />
    </View>

  expect(await renderToJSON(jsx)).toMatchSVGSnapshot(200, 100)
})
