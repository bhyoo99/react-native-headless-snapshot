import * as fs from "fs"
import * as path from "path"

import type { Settings } from "./index"
import { computeLayout } from "./layout"
import { toRootComponent } from "./to-root-component"
import treeToSVG from "./tree-to-svg"

const fail = (msg: string) => ({ message: () => msg, pass: false })

const pass = (msg: string) => ({ message: () => msg, pass: true })

const renderSVG = (root, settings: Settings, snapshotsDir: string): string =>
    treeToSVG(computeLayout(root, settings), settings, snapshotsDir)

export function toMatchSVGSnapshot(
    this: any,
    received: unknown,
    width: number,
    height: number,
    { wireframe = false, scale, platform }: { wireframe?: boolean, scale?: number, platform?: "ios" | "android" } = {}
) {
    const root = toRootComponent(received)
    if (!root) { return fail("A falsy Component was passed to toMatchSVGSnapshot") }
    if (!root.props) { return fail("A Component without props was passed to toMatchSVGSnapshot") }
    if (typeof root.type !== "string") {
        return fail("A Component without a type was passed to toMatchSVGSnapshot")
    }

    const testPath: string = this.testPath
    const testName = this.currentTestName.replace(/\s+/g, "-").replace(/[\\/:*?"<>|]/g, "-").toLowerCase()
    const snapshotsDir = path.join(testPath, "..", "__snapshots__")
    const snapshotPath = path.join(snapshotsDir, path.basename(testPath) + "-" + testName + ".svg")
    const snapshotName = path.relative(process.cwd(), snapshotPath)

    const svgText = renderSVG(root, { width, height, wireframe, scale, platform }, snapshotsDir)

    const snapshotState = this.snapshotState
    const updateMode: string = snapshotState?._updateSnapshot ?? "new"
    const count = (counter: "added" | "matched" | "unmatched" | "updated") => {
        if (snapshotState) { snapshotState[counter]++ }
    }

    if (!fs.existsSync(snapshotPath)) {
        if (updateMode === "none") {
            count("unmatched")
            return fail(`New SVG snapshot ${snapshotName} was not written. `
                + "The update flag must be explicitly passed to write a new snapshot when Jest runs with --ci.")
        }
        fs.mkdirSync(snapshotsDir, { recursive: true })
        fs.writeFileSync(snapshotPath, svgText)
        count("added")
        return pass(`Wrote a new SVG snapshot to ${snapshotName}`)
    }

    const expected = fs.readFileSync(snapshotPath, "utf8")
    if (expected === svgText) {
        count("matched")
        return pass(`SVG snapshot ${snapshotName} matches`)
    }

    if (updateMode === "all") {
        fs.writeFileSync(snapshotPath, svgText)
        count("updated")
        return pass(`Updated SVG snapshot ${snapshotName}`)
    }

    count("unmatched")
    return fail(`SVG snapshot ${snapshotName} does not match. Run Jest with -u to update it.\n\n`
        + this.utils.diff(expected, svgText, { expand: false }))
}
