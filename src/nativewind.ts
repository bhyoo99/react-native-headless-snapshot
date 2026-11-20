import * as fs from "fs"
import * as path from "path"

export interface NativeWindOptions {
  css?: string
  input?: string
  config?: string
  cwd?: string
  inlineRem?: number
}

const fromProject = (cwd: string, name: string) => require(require.resolve(name, { paths: [cwd] }))

const compileTailwind = async (cwd: string, input: string, config: string): Promise<string> => {
  const postcss = fromProject(cwd, "postcss")
  const tailwind = fromProject(cwd, "tailwindcss")
  const source = fs.readFileSync(input, "utf8")
  const result = await postcss([tailwind({ config })]).process(source, { from: input })
  return result.css
}

export const loadNativeWind = async (options: NativeWindOptions = {}) => {
  const cwd = options.cwd ?? process.cwd()
  process.env.NATIVEWIND_OS = fromProject(cwd, "react-native").Platform.OS
  const css = options.css ?? await compileTailwind(
    cwd,
    path.resolve(cwd, options.input ?? "global.css"),
    path.resolve(cwd, options.config ?? "tailwind.config.js"),
  )
  const { cssToReactNativeRuntime } = fromProject(cwd, "react-native-css-interop/dist/css-to-rn")
  const { injectData } = fromProject(cwd, "react-native-css-interop/dist/runtime/native/styles")
  fromProject(cwd, "react-native-css-interop/dist/runtime/components")
  injectData(cssToReactNativeRuntime(css, {
    ignorePropertyWarningRegex: ["^--tw-"],
    grouping: ["^group(/.*)?"],
    inlineRem: options.inlineRem ?? 14,
  }))
}
