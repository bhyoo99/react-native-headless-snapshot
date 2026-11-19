import "../../index"

import { fontForStyle } from "../../font-loader"
import { escapeText } from "../../svg/util"
import { Text, View } from "../host-components"
import { renderToJSON } from "../render-json"

it.each([
  ["300", "Light"],
  ["normal", "Regular"],
  ["500", "Medium"],
  ["600", "SemiBold"],
  ["bold", "Bold"],
  ["800", "ExtraBold"],
])("maps fontWeight %s to Proza Libre %s", (fontWeight, subfamilyName) => {
  const font = fontForStyle({ fontFamily: "Proza Libre", fontWeight, fontStyle: "normal" })
  expect(font.subfamilyName).toEqual(subfamilyName)
})

it("Embeds the bold font that bold text uses", async () => {
  const jsx =
    <View style={{ width: 200, height: 50 }}>
      <Text style={{ fontWeight: "bold" }}>Bold</Text>
    </View>

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(200, 50)
})

it("Escapes markup characters in text: <b> & ©", async () => {
  const jsx =
    <View style={{ width: 200, height: 50 }}>
      <Text>{"a < b & c"}</Text>
    </View>

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(200, 50)
})

it("Keeps XML character references when escaping", () => {
  expect(escapeText("a < b & c &#xF101; &amp; &nbsp;")).toEqual("a &lt; b &amp; c &#xF101; &amp; &amp;nbsp;")
})
