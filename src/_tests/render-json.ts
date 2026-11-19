import { act, type ReactElement } from "react"
import { createRoot } from "test-renderer"

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

export const renderToJSON = async (element: ReactElement): Promise<any> => {
  const root = createRoot()
  await act(async () => {
    root.render(element)
  })
  const json = root.container.toJSON()
  return json && json.children.length === 1 ? json.children[0] : json
}
