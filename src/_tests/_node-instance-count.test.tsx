import "../index"

import { getYoga } from "../yoga"

import { View } from "./host-components"
import { renderToJSON } from "./render-json"

describe("Counting nodes", () => {
    it("it is good with memory", async () => {
      const yoga = getYoga()
      const created = jest.spyOn(yoga.Node, "createDefault")
      const destroyed = jest.spyOn(yoga.Node, "destroy")

      const jsx =
        <View style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <View style={{width: 50, height: 50, backgroundColor: "powderblue"}} />
        < View style={{width: 50, height: 50, backgroundColor: "skyblue"}} />
        <View style={{width: 50, height: 50, backgroundColor: "steelblue"}} />
      </View>

      const component = await renderToJSON(jsx)
      expect(component).toMatchSVGSnapshot(320, 480)

      expect(created).toHaveBeenCalledTimes(4)
      expect(destroyed).toHaveBeenCalledTimes(4)
      created.mockRestore()
      destroyed.mockRestore()
    })
})
