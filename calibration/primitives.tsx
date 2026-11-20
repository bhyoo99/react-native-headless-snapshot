import { type ComponentProps, useState } from "react"
import { Text as NativeText } from "react-native"

export const textLines: Record<string, unknown[]> = {}

let nextId = 0

export const resetTextIds = () => {
  nextId = 0
  for (const key of Object.keys(textLines)) {
    delete textLines[key]
  }
}

export const Text = (props: ComponentProps<typeof NativeText>) => {
  const [id] = useState(() => `text-${++nextId}`)
  return (
    <NativeText
      nativeID={id}
      {...props}
      onTextLayout={event => {
        textLines[id] = event.nativeEvent.lines
      }}
    />
  )
}
