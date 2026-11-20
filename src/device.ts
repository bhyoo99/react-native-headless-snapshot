export interface Insets {
  top: number
  right: number
  bottom: number
  left: number
}

export interface DeviceProfile {
  platform: "ios" | "android"
  width: number
  height: number
  scale: number
  fontScale?: number
  insets?: Insets
}

export const devices: Record<string, DeviceProfile> = {
  "iphone-18-pro": {
    platform: "ios",
    width: 402,
    height: 874,
    scale: 3,
    insets: { top: 62, right: 0, bottom: 34, left: 0 },
  },
  "android-emulator-2.625x": {
    platform: "android",
    width: 720 / 2.625,
    height: 1600 / 2.625,
    scale: 2.625,
    insets: { top: 136 / 2.625, right: 0, bottom: 24, left: 0 },
  },
}

let currentDevice: DeviceProfile | undefined

const fromProject = (name: string) => {
  try {
    return require(name)
  } catch {
    return require(require.resolve(name, { paths: [process.cwd()] }))
  }
}

const tryFromProject = (name: string) => {
  try {
    return fromProject(name)
  } catch {
    return undefined
  }
}

export const getDevice = () => currentDevice

export const resolveDevice = (device: DeviceProfile | string): DeviceProfile => {
  if (typeof device !== "string") {
    return device
  }
  const profile = devices[device]
  if (!profile) {
    throw new Error(`Unknown device "${device}", use one of ${Object.keys(devices).join(", ")} or pass a profile`)
  }
  return profile
}

export const setDevice = (device: DeviceProfile | string) => {
  const profile = resolveDevice(device)
  currentDevice = profile
  const insets = profile.insets ?? { top: 0, right: 0, bottom: 0, left: 0 }
  const metrics = { width: profile.width, height: profile.height, scale: profile.scale, fontScale: profile.fontScale ?? 1 }

  const reactNative = tryFromProject("react-native")
  reactNative?.Dimensions?.set?.({ window: metrics, screen: metrics })

  const safeArea = tryFromProject("react-native-safe-area-context")
  if (safeArea?.initialWindowMetrics) {
    Object.assign(safeArea.initialWindowMetrics.frame, { x: 0, y: 0, width: profile.width, height: profile.height })
    Object.assign(safeArea.initialWindowMetrics.insets, insets)
  }

  const units = tryFromProject("react-native-css-interop/dist/runtime/native/unit-observables")
  const shared = tryFromProject("react-native-css-interop/dist/shared")
  if (units && shared?.INTERNAL_SET) {
    units.vw[shared.INTERNAL_SET](profile.width)
    units.vh[shared.INTERNAL_SET](profile.height)
  }
  return profile
}
