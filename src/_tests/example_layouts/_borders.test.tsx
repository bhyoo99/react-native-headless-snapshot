import "../../index"

import { View } from "../host-components"
import { renderToJSON } from "../render-json"

// https://facebook.github.io/react-native/docs/flexbox.html

it("No border radius", async () => {
  const jsx = <View style={{ backgroundColor: "red", width: 100, height: 50 }} />

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Small border radius", async () => {
  const jsx = <View style={{ backgroundColor: "red", width: 100, height: 50, borderRadius: 10 }} />

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Border radius larger than height", async () => {
  const jsx = <View style={{ backgroundColor: "red", width: 100, height: 50, borderRadius: 1000 }} />

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Border radius larger than width", async () => {
  const jsx = <View style={{ backgroundColor: "red", width: 50, height: 100, borderRadius: 1000 }} />

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Varying border radii", async () => {
  const jsx = (
    <View
      style={{
        width: 100,
        height: 100,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 40,
        borderTopLeftRadius: 50,
        borderWidth: 10,
        borderColor: "blue",
        backgroundColor: "red"
      }}
    />
  )

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Varying border radii dashed", async () => {
  const jsx = (
    <View
      style={{
        width: 100,
        height: 100,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 40,
        borderTopLeftRadius: 50,
        borderWidth: 10,
        borderColor: "blue",
        borderStyle: "dashed",
        backgroundColor: "red"
      }}
    />
  )

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Varying border radii dotted", async () => {
  const jsx = (
    <View
      style={{
        width: 100,
        height: 100,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 40,
        borderTopLeftRadius: 50,
        borderWidth: 10,
        borderColor: "blue",
        borderStyle: "dotted",
        backgroundColor: "red"
      }}
    />
  )

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Varying border widths", async () => {
  const jsx = (
    <View
      style={{
        width: 100,
        height: 100,
        borderRadius: 30,
        borderTopWidth: 5,
        borderRightWidth: 10,
        borderBottomWidth: 15,
        borderLeftWidth: 20,
        borderColor: "blue",
        backgroundColor: "red"
      }}
    />
  )

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Varying border colors", async () => {
  const jsx = (
    <View
      style={{
        width: 100,
        height: 100,
        borderRadius: 30,
        borderWidth: 10,
        borderTopColor: "red",
        borderRightColor: "yellow",
        borderBottomColor: "green",
        borderLeftColor: "blue",
        backgroundColor: "black"
      }}
    />
  )

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Varying border colors dashed", async () => {
  const jsx = (
    <View
      style={{
        width: 100,
        height: 100,
        borderRadius: 30,
        borderWidth: 10,
        borderStyle: "dashed",
        borderTopColor: "red",
        borderRightColor: "yellow",
        borderBottomColor: "green",
        borderLeftColor: "blue",
        backgroundColor: "black"
      }}
    />
  )

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Varying border colors dotted", async () => {
  const jsx = (
    <View
      style={{
        width: 100,
        height: 100,
        borderRadius: 30,
        borderWidth: 10,
        borderStyle: "dotted",
        borderTopColor: "red",
        borderRightColor: "yellow",
        borderBottomColor: "green",
        borderLeftColor: "blue",
        backgroundColor: "black"
      }}
    />
  )

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Varying border colors and widths", async () => {
  const jsx = (
    <View
      style={{
        width: 100,
        height: 100,
        borderRadius: 30,
        borderTopWidth: 5,
        borderRightWidth: 10,
        borderBottomWidth: 15,
        borderLeftWidth: 20,
        borderTopColor: "red",
        borderRightColor: "yellow",
        borderBottomColor: "green",
        borderLeftColor: "blue",
        backgroundColor: "black"
      }}
    />
  )

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})

it("Varying border colors, radii and widths", async () => {
  const jsx = (
    <View
      style={{
        width: 100,
        height: 100,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 40,
        borderTopLeftRadius: 50,
        borderTopWidth: 5,
        borderRightWidth: 10,
        borderBottomWidth: 15,
        borderLeftWidth: 20,
        borderTopColor: "red",
        borderRightColor: "yellow",
        borderBottomColor: "green",
        borderLeftColor: "blue",
        backgroundColor: "black"
      }}
    />
  )

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480)
})
