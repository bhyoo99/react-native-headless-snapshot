import "../index"

import { act } from "react"
import { create } from "react-test-renderer"
import { createRoot } from "test-renderer"
import { toRootComponent } from "../to-root-component"
import { View } from "./host-components"

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).IS_REACT_NATIVE_TEST_ENVIRONMENT = true

const twoBlocks = (
  <>
    <View style={{ width: 50, height: 50, backgroundColor: "skyblue" }} />
    <View style={{ width: 80, height: 30, backgroundColor: "steelblue" }} />
  </>
)

const block = { type: "View", props: { style: { width: 10, height: 10 } }, children: null }

describe("toRootComponent", () => {
  it("keeps a single element", () => {
    expect(toRootComponent(block)).toBe(block)
  })

  it("unwraps a container with one element child", () => {
    expect(toRootComponent({ type: "", props: {}, children: [block] })).toBe(block)
  })

  it("keeps a container with several children", () => {
    const container = { type: "", props: {}, children: [block, block] }
    expect(toRootComponent(container)).toBe(container)
  })

  it("wraps an array of roots in a container", () => {
    expect(toRootComponent([block, block])).toEqual({ type: "", props: {}, children: [block, block] })
  })

  it("calls toJSON on renderer instances", () => {
    expect(toRootComponent({ toJSON: () => block })).toBe(block)
  })
})

describe("renderers", () => {
  it("renders the container of test-renderer", async () => {
    const root = createRoot()
    await act(async () => {
      root.render(twoBlocks)
    })
    expect(root.container).toMatchSVGSnapshot(200, 100)
  })

  it("renders the array returned by react-test-renderer", async () => {
    let renderer
    await act(async () => {
      renderer = create(twoBlocks)
    })
    expect(renderer.toJSON()).toMatchSVGSnapshot(200, 100)
  })
})
