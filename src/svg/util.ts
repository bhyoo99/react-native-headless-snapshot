const bareAmpersand = /&(?!(#\d+|#x[0-9a-fA-F]+|amp|lt|gt|quot|apos);)/g

export const escapeText = (text: string): string =>
  text.replace(bareAmpersand, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const escapeAttribute = (value: unknown): string =>
  escapeText(String(value)).replace(/"/g, "&quot;")

export const $ = (type: string, attributes: object, children?: string): string => {
  const opening = Object.keys(attributes).reduce((accum, key) => (
    attributes[key] != null ? `${accum} ${key}="${escapeAttribute(attributes[key])}"` : accum
  ), `<${type}`)
  return children ? `${opening}>${children}</${type}>` : `${opening}/>`
}
