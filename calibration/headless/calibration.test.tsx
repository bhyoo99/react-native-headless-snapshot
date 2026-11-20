import { render, screen } from "@testing-library/react-native"
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs"
import { layoutTree, loadFallbackFont, loadFont, loadSystemFont, type LayoutFrame } from "jest-snapshots-svg"
import { join } from "path"
import { Platform, View } from "react-native"

import { fixtures } from "../fixtures"

const fonts = {
  "Arimo-Regular": "Arimo-Regular.ttf",
  "Arimo-Bold": "Arimo-Bold.ttf",
  "NotoSansKR-Regular": "NotoSansKR-Regular.otf",
  "NotoSansKR-Bold": "NotoSansKR-Bold.otf",
}
for (const [fontFamily, file] of Object.entries(fonts)) {
  loadFont(readFileSync(join(__dirname, "../assets/fonts", file)), { fontFamily, fontWeight: "normal", fontStyle: "normal" })
}

const androidFonts = join(__dirname, "../system-fonts/android")
const hasSystemFonts = Platform.OS === "android"
  ? existsSync(join(androidFonts, "Roboto-Regular.ttf"))
  : existsSync(join(__dirname, "../system-fonts/ios/SFUI.ttf"))
if (hasSystemFonts) {
  loadSystemFont("android", readFileSync(join(androidFonts, "Roboto-Regular.ttf")))
  loadFallbackFont("android", readFileSync(join(androidFonts, "NotoSansCJK-Regular.ttc")), { postscriptName: "NotoSansCJKKR-Regular" })
}

const iosFonts = join(__dirname, "../system-fonts/ios")
if (existsSync(join(iosFonts, "SFUI.ttf"))) {
  loadSystemFont("ios", readFileSync(join(iosFonts, "SFUI.ttf")))
  for (const weight of ["UltraLight", "Thin", "Light", "Regular", "Medium", "SemiBold", "Bold"]) {
    loadFallbackFont("ios", readFileSync(join(iosFonts, "AppleSDGothicNeo.ttc")), { postscriptName: `.AppleSDGothicNeoI-${weight}` })
  }
}

const referenceDir = join(__dirname, "../reference")
const resultsDir = join(__dirname, "../results")
const profiles = existsSync(referenceDir)
  ? readdirSync(referenceDir).filter(name => name.startsWith(Platform.OS + "-"))
  : []

const toFrame = (frame: LayoutFrame): object => ({
  type: frame.type,
  id: frame.props?.nativeID,
  x: frame.x,
  y: frame.y,
  width: frame.width,
  height: frame.height,
  children: frame.children.map(toFrame),
})

const cases = profiles.flatMap(profile => fixtures
  .filter(fixture => existsSync(join(referenceDir, profile, fixture.name + ".json")))
  .filter(fixture => hasSystemFonts || !fixture.needsSystemFonts)
  .map(fixture => ({ profile, fixture })))

it.each(cases.length ? cases : [null])("lays out %o", async testCase => {
  if (!testCase) {
    return
  }
  const { profile, fixture } = testCase
  const reference = JSON.parse(readFileSync(join(referenceDir, profile, fixture.name + ".json"), "utf8"))
  await render(<View style={{ width: fixture.width, height: fixture.height }}>{fixture.render()}</View>)
  const frame = layoutTree(screen.toJSON(), {
    width: fixture.width,
    height: fixture.height,
    scale: reference.pixelRatio,
    platform: Platform.OS === "android" ? "android" : "ios",
  })
  mkdirSync(join(resultsDir, profile), { recursive: true })
  writeFileSync(join(resultsDir, profile, fixture.name + ".json"), JSON.stringify(toFrame(frame), null, 2) + "\n")
})
