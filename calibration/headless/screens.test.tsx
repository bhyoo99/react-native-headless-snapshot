import { screen } from "@testing-library/react-native"
import { Stack } from "expo-router"
import { renderRouter } from "expo-router/testing-library"
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs"
import { layoutTree, type LayoutFrame, setDevice } from "jest-snapshots-svg"
import { join } from "path"
import { Platform, View } from "react-native"

import { screenVariants } from "../fixtures/screens"

const referenceDir = join(__dirname, "../reference")
const resultsDir = join(__dirname, "../results")

const find = (frame: LayoutFrame, id: string): LayoutFrame | undefined =>
  frame.props?.nativeID === id ? frame : frame.children.map(child => find(child, id)).find(Boolean)

const cases = readdirSync(referenceDir)
  .filter(profile => profile.startsWith(Platform.OS + "-"))
  .flatMap(profile => screenVariants
    .filter(variant => existsSync(join(referenceDir, profile, `screen-${variant.name}.json`)))
    .map(variant => ({ profile, variant })))

it.each(cases.length ? cases : [null])("lays out screen %o", async testCase => {
  if (!testCase) {
    return
  }
  const { profile, variant } = testCase
  const reference = JSON.parse(readFileSync(join(referenceDir, profile, `screen-${variant.name}.json`), "utf8"))
  const size = Platform.OS === "android" ? reference.screen : reference.window
  const device = setDevice({
    platform: Platform.OS === "android" ? "android" : "ios",
    width: size.width,
    height: size.height,
    scale: reference.pixelRatio,
    insets: reference.insets,
  })
  await renderRouter({
    _layout: () => <Stack screenOptions={{ headerShown: false, animation: "none" }} />,
    index: () => (
      <>
        <Stack.Screen options={variant.options} />
        <View nativeID="screen-content" style={{ flex: 1 }} />
      </>
    ),
  })
  const content = find(layoutTree(screen.toJSON(), { device }), "screen-content") as LayoutFrame
  const offset = Platform.OS === "android" ? reference.insets.top : 0
  mkdirSync(join(resultsDir, profile), { recursive: true })
  writeFileSync(join(resultsDir, profile, `screen-${variant.name}.json`), JSON.stringify({
    type: "View",
    x: content.x,
    y: content.y - offset,
    width: content.width,
    height: content.height,
    children: [],
  }, null, 2) + "\n")
})
