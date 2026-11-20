import { router, Stack, useLocalSearchParams } from "expo-router"
import { useEffect, useRef } from "react"
import { Dimensions, PixelRatio, Platform, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { post } from "../../components/FixtureRunner"
import { screenVariants } from "../../fixtures/screens"

export default function ScreenProbe() {
  const { variant } = useLocalSearchParams<{ variant: string }>()
  const insets = useSafeAreaInsets()
  const ref = useRef<any>(null)
  const index = screenVariants.findIndex(entry => entry.name === variant)
  const current = screenVariants[index]

  useEffect(() => {
    const timer = setTimeout(async () => {
      const rect = (ref.current as any).getBoundingClientRect()
      await post("/dump", {
        platform: Platform.OS,
        osVersion: Platform.Version,
        fixture: `screen-${variant}`,
        window: Dimensions.get("window"),
        screen: Dimensions.get("screen"),
        pixelRatio: PixelRatio.get(),
        fontScale: PixelRatio.getFontScale(),
        insets,
        origin: { x: 0, y: 0 },
        tree: { type: "RN:View", id: "screen-content", x: rect.x, y: rect.y, width: rect.width, height: rect.height, children: [] },
        textLines: {},
      })
      const next = screenVariants[index + 1]
      if (next) {
        router.replace(`/screen/${next.name}`)
      } else {
        await post("/done", { platform: Platform.OS })
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [variant])

  return (
    <>
      <Stack.Screen options={current?.options ?? {}} />
      <View ref={ref} nativeID="screen-content" collapsable={false} style={{ flex: 1, backgroundColor: "white" }} />
    </>
  )
}
