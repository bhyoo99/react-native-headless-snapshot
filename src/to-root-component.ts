import type { Component } from "./index"

const isElement = (node: any): boolean => typeof node === "object" && node !== null

export const toRootComponent = (input: any): Component | null => {
  const json = isElement(input) && typeof input.toJSON === "function" ? input.toJSON() : input

  if (Array.isArray(json)) {
    return { type: "", props: {}, children: json }
  }

  if (isElement(json) && json.type === "" && Array.isArray(json.children)
    && json.children.length === 1 && isElement(json.children[0])) {
    return json.children[0]
  }

  return json
}
