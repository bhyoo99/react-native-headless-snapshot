import "../index"

import { getYoga } from "../yoga"

import * as React from "react"
import * as renderer from "react-test-renderer"
import { View } from "./host-components"

import treeToSVG from "../tree-to-svg"

describe("Counting nodes", () => {
    it("it is good with memory", () => {
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

      const component = renderer.create(jsx).toJSON()
      expect(component).toMatchSVGSnapshot(320, 480)

      expect(created).toHaveBeenCalledTimes(4)
      expect(destroyed).toHaveBeenCalledTimes(4)
      created.mockRestore()
      destroyed.mockRestore()
    })
})
