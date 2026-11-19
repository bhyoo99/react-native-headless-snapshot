import "../index"

import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import { toMatchSVGSnapshot } from "../to-match-svg-snapshot"

const block = (backgroundColor: string) => ({
  type: "View",
  props: { style: { width: 10, height: 10, backgroundColor } },
  children: null,
})

let dir: string

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "svg-snapshot-"))
})

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true })
})

const snapshotPath = () => path.join(dir, "__snapshots__", "fake.test.tsx-a-fake-test.svg")

const run = (updateMode: "all" | "new" | "none", color = "red") => {
  const snapshotState = { _updateSnapshot: updateMode, added: 0, matched: 0, unmatched: 0, updated: 0 }
  const context = {
    snapshotState,
    testPath: path.join(dir, "fake.test.tsx"),
    currentTestName: "a fake test",
    utils: { diff: () => "<diff>" },
  }
  const result = toMatchSVGSnapshot.call(context, block(color), 20, 20)
  return { result, snapshotState }
}

it("writes a new snapshot and passes", () => {
  const { result, snapshotState } = run("new")
  expect(result.pass).toBe(true)
  expect(snapshotState.added).toBe(1)
  expect(fs.readFileSync(snapshotPath(), "utf8")).toContain('fill="red"')
})

it("does not write a new snapshot with --ci", () => {
  const { result, snapshotState } = run("none")
  expect(result.pass).toBe(false)
  expect(result.message()).toContain("--ci")
  expect(snapshotState.unmatched).toBe(1)
  expect(fs.existsSync(snapshotPath())).toBe(false)
})

it("passes when the snapshot matches", () => {
  run("new")
  const { result, snapshotState } = run("none")
  expect(result.pass).toBe(true)
  expect(snapshotState.matched).toBe(1)
})

it("fails with a diff and keeps the snapshot when it does not match", () => {
  run("new")
  const { result, snapshotState } = run("new", "blue")
  expect(result.pass).toBe(false)
  expect(result.message()).toContain("-u")
  expect(result.message()).toContain("<diff>")
  expect(snapshotState.unmatched).toBe(1)
  expect(fs.readFileSync(snapshotPath(), "utf8")).toContain('fill="red"')
})

it("overwrites a snapshot that does not match with -u", () => {
  run("new")
  const { result, snapshotState } = run("all", "blue")
  expect(result.pass).toBe(true)
  expect(snapshotState.updated).toBe(1)
  expect(fs.readFileSync(snapshotPath(), "utf8")).toContain('fill="blue"')
})
