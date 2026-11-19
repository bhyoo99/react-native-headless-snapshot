import "../../index"

import * as fs from "fs"
import * as path from "path"
import { Text, View } from "../host-components"
import { renderToJSON } from "../render-json"

import { addFontFallback, loadFont, setDefaultFont } from "../../index"

loadFont(fs.readFileSync(path.join(__dirname, "../Arimo/Arimo-Regular.ttf")))
loadFont(fs.readFileSync(path.join(__dirname, "../Arimo/Arimo-Bold.ttf")))
loadFont(fs.readFileSync(path.join(__dirname, "../Arimo/Arimo-Italic.ttf")))
loadFont(fs.readFileSync(path.join(__dirname, "../Arimo/Arimo-BoldItalic.ttf")))
addFontFallback("Arimo", "'Helvetica', 'Arial', sans-serif")

it("Renders a line of text", async () => {
  const jsx =
    <View style={{ width: 100 }}>
      <Text style={{ fontFamily: "Arimo" }}>Hello world</Text>
    </View>

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Renders multiple lines of text", async () => {
  const jsx =
    <View style={{ width: 100 }}>
      <Text style={{ fontFamily: "Arimo" }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eleifend congue faucibus. In
        {" "}eget tortor in odio luctus eleifend. Nullam pretium justo nisi, nec volutpat turpis
        {" "}tempor et.
      </Text>
    </View>

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Renders text with forced break", async () => {
  const jsx =
    <View style={{ width: 100 }}>
      <Text style={{ fontFamily: "Arimo" }}>Hello{"\n"}world</Text>
    </View>

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Renders multiple lines of text with multiple styles", async () => {
  const jsx =
    <View style={{ width: 100 }}>
      <Text style={{ fontFamily: "Arimo" }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        {" "}<Text style={{ fontStyle: "italic" }}>Sed eleifend congue faucibus.</Text>
        {" "}In eget tortor in odio luctus eleifend. Nullam pretium justo nisi, nec volutpat turpis tempor et.
      </Text>
    </View>

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Renders multiple lines of text with text align", async () => {
  const jsx =
    <View style={{ width: 100 }}>
      <View>
        <Text style={{ fontFamily: "Arimo", textAlign: "left" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </Text>
      </View>
      <View>
        <Text style={{ fontFamily: "Arimo", textAlign: "center" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </Text>
      </View>
      <View>
        <Text style={{ fontFamily: "Arimo", textAlign: "right" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </Text>
      </View>
    </View>

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Renders text with different sizes", async () => {
  const jsx =
    <View style={{ width: 500 }}>
      <View>
        <Text style={{ fontFamily: "Arimo", fontSize: 16, lineHeight: 32 }}>
          Hello <Text style={{ fontSize: 20 }}>World</Text>
        </Text>
      </View>
    </View>

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Renders text with different colors", async () => {
  const jsx =
    <View style={{ width: 500 }}>
      <View>
        <Text style={{ fontFamily: "Arimo" }}>
          Hello <Text style={{ color: "red" }}>World</Text>
        </Text>
      </View>
    </View>

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Renders text in the correct place when positioned with flex", async () => {
  const jsx =
    <View style={{ width: 500, height: 500, alignItems: "center", justifyContent: "center" }}>
      <Text>
        Test
      </Text>
    </View>

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Renders text using the specified default font", async () => {
  setDefaultFont("Arimo")

  const jsx =
    <View style={{ width: 320, height: 480 }}>
      <Text>
        Test setDefaultFont
      </Text>
    </View>

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Does not break if a Text tag is empty", async () => {
  const jsx =
    <View style={{ width: 320, height: 480 }}>
      <Text />
    </View>

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})
