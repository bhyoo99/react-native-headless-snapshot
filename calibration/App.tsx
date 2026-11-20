import "./global.css"

import { useFonts } from "expo-font"
import { useEffect, useRef, useState } from "react"
import { Dimensions, PixelRatio, Platform, Text, View } from "react-native"

import { fixtures } from "./fixtures"
import { resetTextIds, textLines } from "./primitives"

const collector = process.env.EXPO_PUBLIC_COLLECTOR
  ?? (Platform.OS === "android" ? "http://10.0.2.2:4545" : "http://localhost:4545")

interface Frame {
  type: string
  id?: string
  x: number
  y: number
  width: number
  height: number
  children: Frame[]
}

const toFrame = (node: any, origin: { x: number, y: number }): Frame => {
  const rect = node.getBoundingClientRect()
  const type = String(node.nodeName ?? node.tagName)
  return {
    type,
    id: node.id || undefined,
    x: rect.x - origin.x,
    y: rect.y - origin.y,
    width: rect.width,
    height: rect.height,
    children: /Paragraph/i.test(type) ? [] : Array.from(node.children ?? []).map(child => toFrame(child, origin)),
  }
}

const post = (path: string, body: unknown) =>
  fetch(collector + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })

export default function App() {
  const [fontsLoaded] = useFonts({
    "Arimo-Regular": require("./assets/fonts/Arimo-Regular.ttf"),
    "Arimo-Bold": require("./assets/fonts/Arimo-Bold.ttf"),
    "NotoSansKR-Regular": require("./assets/fonts/NotoSansKR-Regular.otf"),
    "NotoSansKR-Bold": require("./assets/fonts/NotoSansKR-Bold.otf"),
  })
  const [index, setIndex] = useState(0)
  const rootRef = useRef<View>(null)
  const fixture = fixtures[index]

  useEffect(() => {
    if (!fontsLoaded) {
      return
    }
    if (!fixture) {
      post("/done", { platform: Platform.OS })
      return
    }
    const timer = setTimeout(async () => {
      const root = rootRef.current as any
      const rect = root.getBoundingClientRect()
      const origin = { x: rect.x, y: rect.y }
      await post("/dump", {
        platform: Platform.OS,
        osVersion: Platform.Version,
        fixture: fixture.name,
        window: Dimensions.get("window"),
        screen: Dimensions.get("screen"),
        pixelRatio: PixelRatio.get(),
        fontScale: PixelRatio.getFontScale(),
        origin,
        tree: toFrame(root, origin),
        textLines: { ...textLines },
      })
      resetTextIds()
      setIndex(current => current + 1)
    }, 800)
    return () => clearTimeout(timer)
  }, [fontsLoaded, fixture])

  if (!fontsLoaded) {
    return null
  }
  if (!fixture) {
    return <Text style={{ marginTop: 120, textAlign: "center" }}>done</Text>
  }
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View
        key={fixture.name}
        ref={rootRef}
        collapsable={false}
        style={{ position: "absolute", left: 0, top: 0, width: fixture.width, height: fixture.height }}
      >
        {fixture.render()}
      </View>
    </View>
  )
}
