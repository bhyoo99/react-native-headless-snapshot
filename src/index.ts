import { initYoga } from "./yoga"

// Add toMatchSVGSnapshot to jest definitions. Specified here so that it is output into
// the index.d.ts definitions provided for projects to use.
declare global {
    namespace jest {
        interface Matchers<R> {
            /** Checks and sets up SVG rendering for React Components. */
            toMatchSVGSnapshot(
                width: number,
                height: number,
                settings?: { wireframe?: boolean, scale?: number, platform?: "ios" | "android" },
            ): R;
            toMatchSVGSnapshot(options?: { device?: import("./device").DeviceProfile | string, wireframe?: boolean }): R;
        }
    }
}

export interface Component {
    type: string
    props: any
    children: Component[] | string[] | null
}

export interface RenderedComponent {
    type: string
    props: any
    textContent?: string
    children: RenderedComponent[]
    layout: {
        left: number
        right: number
        top: number
        bottom: number
        width: number
        height: number
    }
}

export interface Settings {
    width: number
    height: number
    wireframe: boolean
    scale?: number
    platform?: "ios" | "android"
    insets?: { top: number, right: number, bottom: number, left: number }
}

import { toMatchSVGSnapshot } from "./to-match-svg-snapshot"

export {
    addFontFallback,
    addFontToSvg,
    loadFallbackFont,
    loadFont,
    loadSystemFont,
    setDefaultFont,
} from "./font-loader"
export { devices, getDevice, setDevice } from "./device"
export type { DeviceProfile, Insets } from "./device"
export { layoutTree } from "./layout"
export { loadNativeWind } from "./nativewind"
export type { NativeWindOptions } from "./nativewind"
export type { LayoutFrame, LayoutOptions } from "./layout"

beforeAll(() => initYoga())

expect.extend({ toMatchSVGSnapshot })
