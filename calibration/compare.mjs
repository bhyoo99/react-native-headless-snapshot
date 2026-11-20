import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const root = import.meta.dirname
const threshold = Number(process.env.THRESHOLD ?? 0.01)
const verbose = process.argv.includes("--verbose")

const canonicalTypes = {
  "RN:Paragraph": "Text",
  "RN:ScrollView": "ScrollView",
  "RN:AndroidHorizontalScrollView": "ScrollView",
  "RCTScrollView": "ScrollView",
  "RN:AndroidHorizontalScrollContentView": "View",
  "RN:AndroidTextInput": "TextInput",
  "RCTSwitch": "Switch",
  "AndroidSwitch": "Switch",
}

const canonical = type => canonicalTypes[type] ?? type.replace(/^RN:/, "")

const indicatorTypes = ["RN:ActivityIndicatorView", "RN:AndroidProgressBar"]

const collapseIndicators = node => {
  if (node.children.length === 1 && indicatorTypes.includes(node.children[0].type)) {
    return { ...node, type: "ActivityIndicator", children: [] }
  }
  return { ...node, children: node.children.map(collapseIndicators) }
}

const flatten = (node, path, out, map = type => type) => {
  out.push({ ...node, type: map(node.type), path })
  node.children.forEach((child, index) => flatten(child, `${path}.${index}`, out, map))
  return out
}

const known = JSON.parse(readFileSync(join(root, "known-differences.json"), "utf8"))
const isKnown = (profile, fixture, path) =>
  known.some(entry => entry.profile === profile && entry.fixture === fixture && entry.path === path)

let total = 0
let failing = 0
for (const profile of readdirSync(join(root, "reference")).sort()) {
  const resultsDir = join(root, "results", profile)
  if (!existsSync(resultsDir)) {
    continue
  }
  console.log(`\n${profile}`)
  for (const file of readdirSync(join(root, "reference", profile)).sort()) {
    const resultPath = join(resultsDir, file)
    if (!existsSync(resultPath)) {
      continue
    }
    const deviceTree = collapseIndicators(JSON.parse(readFileSync(join(root, "reference", profile, file), "utf8")).tree)
    const device = flatten(deviceTree, "0", [], canonical)
    const headless = flatten(JSON.parse(readFileSync(resultPath, "utf8")), "0", [], canonical)
    const rows = device.map((node, index) => {
      const other = headless[index]
      if (!other || other.type !== node.type) {
        return { path: node.path, type: node.type, error: Infinity, device: node, headless: other }
      }
      const error = Math.max(...["x", "y", "width", "height"].map(key => Math.abs(node[key] - other[key])))
      return { path: node.path, type: node.type, error, device: node, headless: other }
    })
    if (headless.length !== device.length) {
      rows.push({ path: "-", type: `node count ${device.length} vs ${headless.length}`, error: Infinity })
    }
    const fixtureName = file.replace(/\.json$/, "")
    const bad = rows.filter(row => row.error > threshold && !isKnown(profile, fixtureName, row.path))
    const maxError = Math.max(0, ...rows.map(row => row.error))
    total++
    if (bad.length) {
      failing++
    }
    console.log(`  ${bad.length ? "✗" : "✓"} ${file.replace(/\.json$/, "").padEnd(28)} nodes ${String(device.length).padStart(3)}  off ${String(bad.length).padStart(3)}  max ${maxError === Infinity ? "∞" : maxError.toFixed(3)}`)
    if (verbose) {
      for (const row of bad) {
        const fmt = node => node ? `${node.type} ${["x", "y", "width", "height"].map(key => Number(node[key]).toFixed(2)).join(" ")}` : "missing"
        console.log(`      ${row.path.padEnd(10)} device ${fmt(row.device)} | headless ${fmt(row.headless)}`)
      }
    }
  }
}
console.log(`\n${total - failing}/${total} fixtures within ${threshold}`)
process.exitCode = failing ? 1 : 0
