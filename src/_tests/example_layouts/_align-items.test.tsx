import "../../index"

import { View } from "../host-components"
import { renderToJSON } from "../render-json"

// https://facebook.github.io/react-native/docs/flexbox.html

it("Renders three vertically/horizontally centeredblocks", async () => {
  const jsx =
    <View style={{
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <View style={{ width: 50, height: 50, backgroundColor: "powderblue" }} />
      <View style={{ width: 50, height: 50, backgroundColor: "skyblue" }} />
      <View style={{ width: 50, height: 50, backgroundColor: "steelblue" }} />
    </View>

  const component = await renderToJSON(jsx)
  expect(component).toMatchSVGSnapshot(320, 480, { wireframe: true })
})
